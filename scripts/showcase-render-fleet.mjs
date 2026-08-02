/**
 * Render distributed multi-worker fleet showcase (ponytail).
 * SIMULATED teaching grid only — no Isaac spend.
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";
import { chromium } from "playwright";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const siteRoot = path.resolve(__dirname, "..");
const mediaDir = path.join(siteRoot, "public", "media");
const sceneHtml = path.join(__dirname, "showcase-scene-fleet.html");
const workDir =
  process.env.SHOWCASE_WORK_DIR ||
  path.join(siteRoot, ".showcase-fleet-work");

const WIDTH = 1280;
const HEIGHT = 720;
const FPS = 24;
const FRAMES = 144; // 6s
const VERSION = "v2";
const BACKGROUND = {
  path: path.join(mediaDir, "third-party", "noirlab-machine-shop-360-4096.jpg"),
  publicPath: "third-party/noirlab-machine-shop-360-4096.jpg",
  credit: "NOIRLab/NSF/AURA/T. Slovinský",
  license: "CC BY 4.0",
  sourceUrl: "https://commons.wikimedia.org/wiki/File:360-degree_Panorama_of_Machine_Shop_at_NOIRLab_(360Pano_Machine_room_2-CC).jpg",
};

const OUT = {
  video: path.join(mediaDir, `sage-distributed-learning-${VERSION}.mp4`),
  poster: path.join(mediaDir, `sage-distributed-learning-poster-${VERSION}.jpg`),
  captions: path.join(mediaDir, `sage-distributed-learning-captions-${VERSION}.vtt`),
  manifest: path.join(mediaDir, `sage-distributed-learning-manifest-${VERSION}.json`),
};

function sha256File(p) {
  return crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex");
}

function findFfmpeg() {
  const which = spawnSync("where.exe", ["ffmpeg"], { encoding: "utf8" });
  if (which.status === 0) {
    const line = which.stdout.split(/\r?\n/).find(Boolean);
    if (line) return line.trim();
  }
  if (process.env.FFMPEG_PATH && fs.existsSync(process.env.FFMPEG_PATH)) {
    return process.env.FFMPEG_PATH;
  }
  return undefined;
}

async function main() {
  fs.mkdirSync(workDir, { recursive: true });
  fs.mkdirSync(mediaDir, { recursive: true });
  const frameRoot = path.join(workDir, "frames");
  fs.rmSync(frameRoot, { recursive: true, force: true });
  fs.mkdirSync(frameRoot, { recursive: true });

  const browser = await chromium.launch({ headless: true, args: ["--allow-file-access-from-files"] });
  try {
    const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT } });
    const url = pathToFileURL(sceneHtml).href + `?progress=0&w=${WIDTH}&h=${HEIGHT}`;
    await page.goto(url, { waitUntil: "networkidle", timeout: 180000 });
    await page.waitForFunction(() => window.__SAGE_SHOWCASE_READY__ === true, null, {
      timeout: 120000,
    });
    let firstCamera;
    let lastCamera;
    const cameraPhases = new Set();
    for (let f = 0; f < FRAMES; f++) {
      const p = f / Math.max(FRAMES - 1, 1);
      const camera = await page.evaluate((prog) => {
        window.__SAGE_SET_PROGRESS__(prog);
        return window.__SAGE_SHOWCASE_META__.camera;
      }, p);
      if (f === 0) firstCamera = camera;
      if (f === FRAMES - 1) lastCamera = camera;
      cameraPhases.add(camera.phase);
      await page.screenshot({
        path: path.join(frameRoot, `seq_${String(f).padStart(5, "0")}.png`),
        type: "png",
      });
    }
    if (
      firstCamera?.phase !== "low_rail" ||
      lastCamera?.phase !== "close_overview" ||
      !cameraPhases.has("lift") ||
      !(lastCamera.position[1] > firstCamera.position[1] + 2)
    ) {
      throw new Error("fleet camera path did not complete the low-rail-to-overview sweep");
    }
  } finally {
    await browser.close();
  }

  const ffmpeg = findFfmpeg();
  if (!ffmpeg) throw new Error("ffmpeg not found");
  const enc = spawnSync(
    ffmpeg,
    [
      "-y", "-framerate", String(FPS),
      "-i", path.join(frameRoot, "seq_%05d.png"),
      "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18",
      "-movflags", "+faststart", "-an", OUT.video,
    ],
    { encoding: "utf8" },
  );
  if (enc.status !== 0) throw new Error(enc.stderr?.slice(-600));
  const poster = spawnSync(
    ffmpeg,
    ["-y", "-i", path.join(frameRoot, "seq_00072.png"), "-q:v", "2", OUT.poster],
    { encoding: "utf8" },
  );
  if (poster.status !== 0) throw new Error(poster.stderr?.slice(-400));

  fs.writeFileSync(
    OUT.captions,
    `WEBVTT

00:00.000 --> 00:06.000
Distributed multi-worker teaching grid · 40 randomized stock cells · SIMULATED
`,
    "utf8",
  );

  const manifest = {
    schema_version: `sage-public-distributed-learning/${VERSION}`,
    evidence_class: "SIMULATED",
    authority: "shadow_only_non_actuating",
    physical_machine_validation: false,
    render_kind: "webgl_showcase_metal_lighting",
    camera_path: "low_rail_dolly_to_close_overview",
    background: {
      kind: "equirectangular_machine_shop_panorama",
      ...BACKGROUND,
      path: BACKGROUND.publicPath,
      sha256: sha256File(BACKGROUND.path),
      modified: "Resized from source for the 1280x720 teaching render.",
    },
    duration_seconds: 6,
    workers_visualized: 40,
    note:
      "Teaching visualization of parallel randomized-stock cells. Not the private fleet corpus; not physical cutting. Aggregates for real multi-worker campaigns live under /data/.",
    related_public_evidence: [
      "sage-public-fusion-worldsim-v1.json",
      "sage-public-nvidia-simulation-v1.json",
    ],
    files: {
      video: {
        path: `sage-distributed-learning-${VERSION}.mp4`,
        bytes: fs.statSync(OUT.video).size,
        sha256: sha256File(OUT.video),
      },
      poster: {
        path: `sage-distributed-learning-poster-${VERSION}.jpg`,
        bytes: fs.statSync(OUT.poster).size,
        sha256: sha256File(OUT.poster),
      },
      captions: {
        path: `sage-distributed-learning-captions-${VERSION}.vtt`,
        bytes: fs.statSync(OUT.captions).size,
        sha256: sha256File(OUT.captions),
      },
    },
  };
  fs.writeFileSync(OUT.manifest, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(
    `fleet showcase OK video=${manifest.files.video.bytes} sha=${manifest.files.video.sha256.slice(0, 12)}…`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
