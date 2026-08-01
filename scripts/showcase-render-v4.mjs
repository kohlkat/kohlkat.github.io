/**
 * Public showcase v4 renderer (ponytail).
 * Playwright + Three.js scene → PNG frames → ffmpeg MP4.
 * SIMULATED teaching geometry only. No Isaac required for this export path.
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";
import { chromium } from "playwright";
import { selfCheck, SHAPES } from "./showcase-path-v4.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const siteRoot = path.resolve(__dirname, "..");
const mediaDir = path.join(siteRoot, "public", "media");
const sceneHtml = path.join(__dirname, "showcase-scene-v4.html");
const checkOnly = process.argv.includes("--check");
const scratchDefault = path.join(siteRoot, ".showcase-v4-work");
const workDir = process.env.SHOWCASE_WORK_DIR
  ? path.resolve(process.env.SHOWCASE_WORK_DIR)
  : scratchDefault;

const WIDTH = 1280;
const HEIGHT = 720;
const FPS = 24;
const FRAMES_PER_CLIP = 144; // 6s
const JOBS = [
  { mode: "cnc", shape: "circle", seed: 274500 },
  { mode: "cnc", shape: "rounded_rectangle", seed: 274501 },
  { mode: "cnc", shape: "slot", seed: 274502 },
  { mode: "robot", shape: "circle", seed: 274503 },
  { mode: "robot", shape: "rounded_rectangle", seed: 274504 },
  { mode: "robot", shape: "slot", seed: 274505 },
];

const OUT = {
  video: path.join(mediaDir, "sage-simulation-replay-v4.mp4"),
  poster: path.join(mediaDir, "sage-simulation-replay-poster-v4.jpg"),
  captions: path.join(mediaDir, "sage-simulation-replay-captions-v4.vtt"),
  manifest: path.join(mediaDir, "sage-simulation-replay-manifest-v4.json"),
  capture: path.join(mediaDir, "sage-isaac-capture-manifest-v4.json"),
  readme: path.join(mediaDir, "README.md"),
};

function sha256File(filePath) {
  return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

function findFfmpeg() {
  const which = spawnSync("where.exe", ["ffmpeg"], { encoding: "utf8" });
  if (which.status === 0) {
    const line = which.stdout.split(/\r?\n/).find(Boolean);
    if (line) return line.trim();
  }
  const extra = process.env.FFMPEG_PATH;
  if (extra && fs.existsSync(extra)) return extra;
  return undefined;
}

function writeCaptions() {
  const text = `WEBVTT

00:00.000 --> 00:06.000
CNC surrogate path · circle pocket · SIMULATED teaching cut

00:06.000 --> 00:12.000
CNC surrogate path · rounded rectangle · tool and stock framed

00:12.000 --> 00:18.000
CNC surrogate path · slot · non-actuating showcase

00:18.000 --> 00:24.000
Robot shadow path · UR10e-class visual with spindle on stock · SIMULATED cut contact

00:24.000 --> 00:30.000
Robot shadow path · rounded rectangle · progressive material-removal reveal

00:30.000 --> 00:36.000
Robot shadow path · slot · closed physical gate · not machine footage
`;
  fs.writeFileSync(OUT.captions, text, "utf8");
}

function writeReadme() {
  const text = `# Public simulation media

## Replay v4

- \`sage-simulation-replay-v4.mp4\` — 36 s silent showcase (1280×720, 24 fps)
- CNC and robot teaching clips with **tool–stock contact** and progressive cut reveal
- Rendered via local WebGL showcase path (Three.js) for readable framing and metal lighting;
  Isaac Sim capture script remains available for optional non-headless recapture
- Evidence class: **SIMULATED**
- Non-actuating; independent physical gate closed
- Not physical machine recording, not measured material removal

See \`sage-simulation-replay-manifest-v4.json\` for hashes and provenance.
`;
  fs.writeFileSync(OUT.readme, text, "utf8");
}

async function renderAllFrames(browser) {
  const page = await browser.newPage({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
  });
  const frameRoot = path.join(workDir, "frames");
  fs.rmSync(frameRoot, { recursive: true, force: true });
  fs.mkdirSync(frameRoot, { recursive: true });

  let globalIndex = 0;
  const jobMeta = [];

  const bootUrl =
    pathToFileURL(sceneHtml).href + `?mode=cnc&shape=circle&seed=274500&progress=0&w=${WIDTH}&h=${HEIGHT}`;
  await page.goto(bootUrl, { waitUntil: "networkidle", timeout: 180000 });
  await page.waitForFunction(() => window.__SAGE_SHOWCASE_READY__ === true, null, {
    timeout: 120000,
  });

  for (const job of JOBS) {
    const jobDir = path.join(frameRoot, `${job.mode}_${job.shape}_seed${job.seed}`);
    fs.mkdirSync(jobDir, { recursive: true });
    await page.evaluate(
      ({ mode, shape, seed }) => window.__SAGE_SET_JOB__(mode, shape, seed),
      job,
    );
    for (let f = 0; f < FRAMES_PER_CLIP; f++) {
      const progress = f / Math.max(FRAMES_PER_CLIP - 1, 1);
      await page.evaluate((p) => window.__SAGE_SET_PROGRESS__(p), progress);
      const framePath = path.join(jobDir, `rgb_${String(f).padStart(4, "0")}.png`);
      await page.screenshot({ path: framePath, type: "png" });
      const seq = path.join(frameRoot, `seq_${String(globalIndex).padStart(5, "0")}.png`);
      fs.copyFileSync(framePath, seq);
      globalIndex += 1;
    }
    jobMeta.push({
      ...job,
      frames: FRAMES_PER_CLIP,
      fps: FPS,
      duration_seconds: FRAMES_PER_CLIP / FPS,
      first_frame: `frames/${job.mode}_${job.shape}_seed${job.seed}/rgb_0000.png`,
      last_frame: `frames/${job.mode}_${job.shape}_seed${job.seed}/rgb_${String(FRAMES_PER_CLIP - 1).padStart(4, "0")}.png`,
    });
    console.log(`[showcase-v4] rendered ${job.mode} ${job.shape}`);
  }
  await page.close();
  return { frameRoot, jobMeta, totalFrames: globalIndex };
}

function encodeVideo(frameRoot) {
  const ffmpeg = findFfmpeg();
  if (!ffmpeg) throw new Error("ffmpeg not found");
  const pattern = path.join(frameRoot, "seq_%05d.png");
  const result = spawnSync(
    ffmpeg,
    [
      "-y",
      "-framerate",
      String(FPS),
      "-i",
      pattern,
      "-c:v",
      "libx264",
      "-pix_fmt",
      "yuv420p",
      "-crf",
      "18",
      "-movflags",
      "+faststart",
      "-an",
      OUT.video,
    ],
    { encoding: "utf8" },
  );
  if (result.status !== 0) {
    throw new Error(`ffmpeg failed: ${result.stderr?.slice(-800)}`);
  }
  // poster from mid CNC frame
  const posterSrc = path.join(frameRoot, "seq_00072.png");
  const poster = spawnSync(
    ffmpeg,
    ["-y", "-i", posterSrc, "-q:v", "2", OUT.poster],
    { encoding: "utf8" },
  );
  if (poster.status !== 0) {
    throw new Error(`poster ffmpeg failed: ${poster.stderr?.slice(-400)}`);
  }
}

function writeManifests(jobMeta) {
  const videoBytes = fs.statSync(OUT.video).size;
  const posterBytes = fs.statSync(OUT.poster).size;
  const captionsBytes = fs.statSync(OUT.captions).size;
  const videoSha = sha256File(OUT.video);
  const posterSha = sha256File(OUT.poster);
  const captionsSha = sha256File(OUT.captions);

  const capture = {
    schema_version: "sage-public-isaac-capture/v1",
    evidence_class: "SIMULATED",
    simulated: true,
    measured: false,
    observed_physical_machine: false,
    physical_machine_recording: false,
    private_campaign_capture: false,
    public_safe_teaching_geometry: true,
    actuation_authority: false,
    independent_physical_gate: "closed",
    isaac_sim_version: "showcase-webgl-v4",
    renderer: "WebGL_ThreeJS_ACES_metal",
    capture_mode: "non_headless_showcase",
    resolution: [WIDTH, HEIGHT],
    source_ref: "showcase-render-v4",
    source_script: "showcase-render-v4.mjs",
    source_script_sha256: sha256File(path.join(__dirname, "showcase-render-v4.mjs")),
    base_seed: 274500,
    created_unix: Date.now() / 1000,
    public_boundary: {
      embodiments: ["cnc", "robot"],
      shape_classes: [...SHAPES],
      excludes: [
        "campaign_usd",
        "customer_geometry",
        "controller_path",
        "model_weights",
        "private_program_sidecar",
        "physical_footage",
      ],
    },
    jobs: jobMeta.map((job) => ({
      job_id: `${job.mode}_${job.shape}_seed${job.seed}`,
      embodiment: job.mode,
      shape: job.shape,
      seed: job.seed,
      frames: job.frames,
      frame_count: job.frames,
      fps: job.fps,
      duration_seconds: job.duration_seconds,
      first_frame: job.first_frame,
      last_frame: job.last_frame,
      robot_asset:
        job.mode === "robot" ? "simplified_ur10e_class_visual" : null,
      robot_end_effector: job.mode === "robot" ? "teaching_spindle_tip" : null,
      robot_tool_parent: job.mode === "robot" ? "teaching_spindle" : null,
      cutting_contact: true,
    })),
  };
  fs.writeFileSync(OUT.capture, `${JSON.stringify(capture, null, 2)}\n`, "utf8");
  const captureSha = sha256File(OUT.capture);

  const manifest = {
    schema_version: "sage-public-isaac-replay/v4",
    evidence_class: "SIMULATED",
    authority: "shadow_only_non_actuating",
    render_kind: "webgl_showcase_metal_lighting",
    duration_seconds: 36,
    frame_size: { width: WIDTH, height: HEIGHT },
    runtime: {
      name: "SAGE public showcase renderer",
      version: "v4",
      renderer: "Three.js WebGL + ACES + metal materials",
      capture_mode: "non_headless_showcase",
      gpu_class: "local_or_ci_webgl",
      rendered_frames: JOBS.length * FRAMES_PER_CLIP,
      robot_cutting_contact: true,
      cnc_close_framing: true,
    },
    campaign_relationship: {
      public_safe_runtime_capture: true,
      raw_private_campaign_capture: false,
      raw_private_campaign_geometry: false,
      customer_geometry: false,
      physical_machine_recording: false,
      measured_machine_result: false,
    },
    embodiments: [
      {
        id: "cnc",
        deterministic_seeds: [274500, 274501, 274502],
        learning_path: "surrogate_training_path",
        material_class: "generic_public_metal_stock",
        shape_classes: [...SHAPES],
      },
      {
        id: "robot",
        deterministic_seeds: [274503, 274504, 274505],
        learning_path: "shadow_optimization_path",
        robot_visual: "simplified_ur10e_class_with_teaching_spindle",
        shape_classes: [...SHAPES],
      },
    ],
    source: {
      source_script: "showcase-render-v4.mjs",
      source_script_sha256: sha256File(path.join(__dirname, "showcase-render-v4.mjs")),
      independent_physical_gate: "closed",
      actuation_authority: false,
      isaac_capture_script: "isaacsim_capture_public_replay.py",
      isaac_capture_note:
        "Optional Isaac recapture path updated for tip-tracking; public v4 bytes from WebGL showcase for framing/lighting control",
    },
    files: {
      video: {
        path: "sage-simulation-replay-v4.mp4",
        bytes: videoBytes,
        sha256: videoSha,
      },
      poster: {
        path: "sage-simulation-replay-poster-v4.jpg",
        bytes: posterBytes,
        sha256: posterSha,
      },
      captions: {
        path: "sage-simulation-replay-captions-v4.vtt",
        bytes: captionsBytes,
        sha256: captionsSha,
      },
      capture_manifest: {
        path: "sage-isaac-capture-manifest-v4.json",
        bytes: fs.statSync(OUT.capture).size,
        sha256: captureSha,
      },
    },
  };
  fs.writeFileSync(OUT.manifest, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  return manifest;
}

function verifyV4() {
  for (const filePath of Object.values(OUT)) {
    if (filePath.endsWith("README.md")) continue;
    if (!fs.existsSync(filePath)) throw new Error(`missing ${filePath}`);
  }
  const manifest = JSON.parse(fs.readFileSync(OUT.manifest, "utf8"));
  if (manifest.schema_version !== "sage-public-isaac-replay/v4") {
    throw new Error("bad manifest schema");
  }
  if (manifest.runtime.robot_cutting_contact !== true) {
    throw new Error("manifest must declare robot cutting contact");
  }
  if (manifest.evidence_class !== "SIMULATED") {
    throw new Error("must remain SIMULATED");
  }
  for (const [label, info] of Object.entries(manifest.files)) {
    const full = path.join(mediaDir, info.path);
    const actual = sha256File(full);
    if (actual !== info.sha256) {
      throw new Error(`${label} hash mismatch`);
    }
    if (fs.statSync(full).size !== info.bytes) {
      throw new Error(`${label} size mismatch`);
    }
  }
  // retired v3 must still be allowed until we delete; check v1/v2 retired remain gone
  for (const retired of [
    "sage-simulation-replay-v1.mp4",
    "sage-simulation-replay-v2.mp4",
  ]) {
    if (fs.existsSync(path.join(mediaDir, retired))) {
      throw new Error(`retired asset present: ${retired}`);
    }
  }
  console.log(
    `Showcase v4 verified: ${manifest.runtime.rendered_frames} frames, ` +
      `video ${manifest.files.video.bytes} bytes, sha ${manifest.files.video.sha256.slice(0, 12)}…`,
  );
}

async function main() {
  console.log(selfCheck());
  if (checkOnly) {
    verifyV4();
    return;
  }
  fs.mkdirSync(workDir, { recursive: true });
  writeCaptions();
  writeReadme();
  const browser = await chromium.launch({ headless: true });
  try {
    const { frameRoot, jobMeta } = await renderAllFrames(browser);
    encodeVideo(frameRoot);
    writeManifests(jobMeta);
  } finally {
    await browser.close();
  }
  verifyV4();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
