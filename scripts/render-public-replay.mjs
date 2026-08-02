import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  readFragmentedMp4DurationSeconds,
  sha256,
} from "./public-replay-scene.mjs";

const mediaDirectory = path.resolve("public", "media");
const filePaths = {
  video: path.join(mediaDirectory, "sage-simulation-replay-v5.mp4"),
  poster: path.join(mediaDirectory, "sage-simulation-replay-poster-v5.jpg"),
  captions: path.join(mediaDirectory, "sage-simulation-replay-captions-v5.vtt"),
  manifest: path.join(mediaDirectory, "sage-simulation-replay-manifest-v5.json"),
  captureManifest: path.join(mediaDirectory, "sage-isaac-capture-manifest-v5.json"),
  readme: path.join(mediaDirectory, "README.md"),
};
const shopPanoramaPath = path.join(
  mediaDirectory,
  "third-party",
  "noirlab-machine-shop-360-4096.jpg",
);
const retiredFilePaths = [
  "sage-simulation-replay-v1.mp4",
  "sage-simulation-replay-poster-v1.jpg",
  "sage-simulation-replay-captions-v1.vtt",
  "sage-simulation-replay-v2.mp4",
  "sage-simulation-replay-poster-v2.jpg",
  "sage-simulation-replay-captions-v2.vtt",
  "sage-simulation-replay-manifest-v2.json",
  "sage-public-teaching-scene-v2.usda",
  // v3 superseded by v4 showcase remaster
  "sage-simulation-replay-v3.mp4",
  "sage-simulation-replay-poster-v3.jpg",
  "sage-simulation-replay-captions-v3.vtt",
  "sage-simulation-replay-manifest-v3.json",
  "sage-isaac-capture-manifest-v3.json",
].map((name) => path.join(mediaDirectory, name));

function verifyReplayFiles() {
  for (const [label, filePath] of Object.entries(filePaths)) {
    assert(fs.existsSync(filePath), `Missing replay ${label}: ${filePath}`);
  }
  for (const retiredFilePath of retiredFilePaths) {
    assert(
      !fs.existsSync(retiredFilePath),
      `Retired replay asset is still public: ${retiredFilePath}`,
    );
  }

  const videoBytes = fs.readFileSync(filePaths.video);
  const posterBytes = fs.readFileSync(filePaths.poster);
  const captionsText = fs.readFileSync(filePaths.captions, "utf8");
  const manifestText = fs.readFileSync(filePaths.manifest, "utf8");
  const captureManifestText = fs.readFileSync(filePaths.captureManifest, "utf8");
  const shopPanoramaBytes = fs.readFileSync(shopPanoramaPath);
  const mediaReadme = fs.readFileSync(filePaths.readme, "utf8");
  const manifest = JSON.parse(manifestText);
  const captureManifest = JSON.parse(captureManifestText);
  const durationSeconds = readFragmentedMp4DurationSeconds(videoBytes);

  assert(
    videoBytes.length >= 100_000 &&
      videoBytes.length <= 95_000_000 &&
      videoBytes.subarray(4, 8).toString("ascii") === "ftyp" &&
      !videoBytes.includes(Buffer.from("soun")) &&
      durationSeconds >= 119.5 &&
      durationSeconds <= 120.5,
    "Showcase replay must remain a silent 120-second MP4 below 95 MB.",
  );
  assert(
    posterBytes.length >= 8_000 &&
      posterBytes.length <= 1_000_000 &&
      posterBytes.subarray(0, 2).equals(Buffer.from([0xff, 0xd8])) &&
      posterBytes.subarray(-2).equals(Buffer.from([0xff, 0xd9])),
    "Showcase poster must be a compact JPEG.",
  );

  // Hashes must match committed manifest (source of truth after generate).
  for (const [key, file] of Object.entries({
    video: videoBytes,
    poster: posterBytes,
    captions: captionsText,
    capture_manifest: captureManifestText,
  })) {
    const entryKey = key === "capture_manifest" ? "capture_manifest" : key;
    assert.equal(manifest.files?.[entryKey]?.sha256, sha256(file));
    assert.equal(
      manifest.files?.[entryKey]?.bytes,
      Buffer.isBuffer(file) ? file.length : Buffer.byteLength(file),
    );
  }

  assert(
    captionsText.includes("SIMULATED") &&
      captionsText.includes("CNC") &&
      /robot/i.test(captionsText) &&
      (captionsText.includes("closed") || captionsText.includes("gate")),
    "Replay captions missing SIMULATED / dual-path / gate boundary.",
  );

  assert.equal(manifest.schema_version, "sage-public-isaac-replay/v5");
  assert.equal(manifest.evidence_class, "SIMULATED");
  assert.equal(manifest.authority, "shadow_only_non_actuating");
  assert.equal(manifest.duration_seconds, 120);
  assert.deepEqual(manifest.frame_size, { width: 1280, height: 720 });
  assert.equal(manifest.runtime?.rendered_frames, 2880);
  assert.equal(manifest.runtime?.simulated_robot_contact_gate_passed, true);
  assert.equal(manifest.runtime?.cnc_stock_and_cutter_visible, true);
  assert.equal(manifest.campaign_relationship?.public_safe_runtime_capture, true);
  assert.equal(manifest.campaign_relationship?.raw_private_campaign_capture, false);
  assert.equal(manifest.campaign_relationship?.physical_machine_recording, false);
  assert.equal(manifest.source?.independent_physical_gate, "closed");
  assert.equal(manifest.source?.actuation_authority, false);
  assert(
    manifest.embodiments?.some((e) => e.id === "cnc") &&
      manifest.embodiments?.some((e) => e.id === "robot"),
    "Replay manifest missing CNC and robot embodiments.",
  );

  assert.equal(captureManifest.schema_version, "sage-public-isaac-capture/v1");
  assert.equal(captureManifest.evidence_class, "SIMULATED");
  assert.equal(captureManifest.simulated, true);
  assert.equal(captureManifest.measured, false);
  assert.equal(captureManifest.showcase, "machining");
  assert.equal(captureManifest.total_duration_seconds, 120);
  assert.equal(captureManifest.independent_physical_gate, "closed");
  assert.equal(captureManifest.actuation_authority, false);
  assert.equal(captureManifest.physical_machine_recording, false);
  assert.equal(captureManifest.jobs?.length, 6);
  assert.equal(
    captureManifest.jobs?.reduce((n, job) => n + job.frame_count, 0),
    2880,
  );
  assert(
    captureManifest.jobs?.every(
      (job) =>
        job.frames === 480 &&
        job.frame_count === 480 &&
        job.duration_seconds === 20 &&
        job.cutting_contact === true &&
        job.cutting_contact_evidence?.evidence_class === "SIMULATED" &&
        job.cutting_contact_evidence?.measured_physical_contact === false,
    ),
    "Capture manifest contains an incomplete replay job.",
  );
  assert(
    captureManifest.jobs
      ?.filter((j) => j.embodiment === "robot")
      .every(
        (j) =>
          j.cutting_contact_evidence?.tolerance_m === 0.002 &&
          j.cutting_contact_evidence?.max_gap_m <=
            j.cutting_contact_evidence?.tolerance_m,
      ),
    "Robot jobs must keep SIMULATED tool-tip gap within declared tolerance.",
  );
  assert(
    captureManifest.shop_panorama?.license === "CC BY 4.0" &&
      captureManifest.shop_panorama?.sha256 === sha256(shopPanoramaBytes) &&
      captureManifest.shop_panorama?.metric_scale_source ===
        "authored_USD_geometry_at_one_meter_per_unit",
    "Capture manifest must bind the credited shop panorama and metric scale source.",
  );
  assert(
    mediaReadme.includes("SIMULATED") &&
      mediaReadme.includes("v5") &&
      mediaReadme.toLowerCase().includes("gate"),
    "Media README missing v5 / SIMULATED / gate boundary.",
  );

  console.log(
    `Immutable showcase replay verified: ${durationSeconds.toFixed(1)} seconds, ` +
      `${videoBytes.length.toLocaleString()} bytes, 2,880 rendered frames.`,
  );
}

verifyReplayFiles();
