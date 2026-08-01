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

const OUT = {
  video: path.join(mediaDir, "sage-distributed-learning-v1.mp4"),
  poster: path.join(mediaDir, "sage-distributed-learning-poster-v1.jpg"),
  captions: path.join(mediaDir, "sage-distributed-learning-captions-v1.vtt"),
  manifest: path.join(mediaDir, "sage-distributed-learning-manifest-v1.json"),
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

  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT } });
    const url = pathToFileURL(sceneHtml).href + `?progress=0&w=${WIDTH}&h=${HEIGHT}`;
    await page.goto(url, { waitUntil: "networkidle", timeout: 180000 });
    await page.waitForFunction(() => window.__SAGE_SHOWCASE_READY__ === true, null, {
      timeout: 120000,
    });
    for (let f = 0; f < FRAMES; f++) {
      const p = f / Math.max(FRAMES - 1, 1);
      await page.evaluate((prog) => window.__SAGE_SET_PROGRESS__(prog), p);
      await page.screenshot({
        path: path.join(frameRoot, `seq_${String(f).padStart(5, "0")}.png`),
        type: "png",
      });
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
    schema_version: "sage-public-distributed-learning/v1",
    evidence_class: "SIMULATED",
    authority: "shadow_only_non_actuating",
    physical_machine_validation: false,
    render_kind: "webgl_showcase_metal_lighting",
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
        path: "sage-distributed-learning-v1.mp4",
        bytes: fs.statSync(OUT.video).size,
        sha256: sha256File(OUT.video),
      },
      poster: {
        path: "sage-distributed-learning-poster-v1.jpg",
        bytes: fs.statSync(OUT.poster).size,
        sha256: sha256File(OUT.poster),
      },
      captions: {
        path: "sage-distributed-learning-captions-v1.vtt",
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
