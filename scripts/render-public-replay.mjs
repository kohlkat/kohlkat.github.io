import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  readFragmentedMp4DurationSeconds,
  sha256,
} from "./public-replay-scene.mjs";

const mediaDirectory = path.resolve("public", "media");
const filePaths = {
  video: path.join(mediaDirectory, "sage-simulation-replay-v3.mp4"),
  poster: path.join(
    mediaDirectory,
    "sage-simulation-replay-poster-v3.jpg",
  ),
  captions: path.join(
    mediaDirectory,
    "sage-simulation-replay-captions-v3.vtt",
  ),
  manifest: path.join(
    mediaDirectory,
    "sage-simulation-replay-manifest-v3.json",
  ),
  captureManifest: path.join(
    mediaDirectory,
    "sage-isaac-capture-manifest-v3.json",
  ),
  readme: path.join(mediaDirectory, "README.md"),
};
const retiredFilePaths = [
  "sage-simulation-replay-v1.mp4",
  "sage-simulation-replay-poster-v1.jpg",
  "sage-simulation-replay-captions-v1.vtt",
  "sage-simulation-replay-v2.mp4",
  "sage-simulation-replay-poster-v2.jpg",
  "sage-simulation-replay-captions-v2.vtt",
  "sage-simulation-replay-manifest-v2.json",
  "sage-public-teaching-scene-v2.usda",
].map((name) => path.join(mediaDirectory, name));
const reviewedHashes = {
  video: "c9fb08553007bc1750ea4f1b4bed30ed39cdc513b4b2d3112f9d5cfb28af1080",
  poster: "b5025fe0a8915afc03a0db8e0fad11861d777b9d6bf7daf71d0a1ffb622031e2",
  captions: "000d965a09b02609d801e034f7467721ed1f00b9657ef64870d5bbb8755d53cc",
  manifest: "c402fddcdb36bbac6b5428086d634e36f7b11c6059835c067d1c441c522b77e9",
  captureManifest:
    "ca4d698271a0d4246aacec023e56f5cee43011f65b2cc4ebb5ab55b03b4033d3",
};

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
  const captureManifestText = fs.readFileSync(
    filePaths.captureManifest,
    "utf8",
  );
  const mediaReadme = fs.readFileSync(filePaths.readme, "utf8");
  const manifest = JSON.parse(manifestText);
  const captureManifest = JSON.parse(captureManifestText);
  const durationSeconds = readFragmentedMp4DurationSeconds(videoBytes);

  assert(
    videoBytes.length >= 100_000 &&
      videoBytes.length <= 5_000_000 &&
      videoBytes.subarray(4, 8).toString("ascii") === "ftyp" &&
      !videoBytes.includes(Buffer.from("soun")) &&
      durationSeconds >= 35.8 &&
      durationSeconds <= 36.2,
    "Isaac replay must remain a compact, silent 36-second MP4.",
  );
  assert(
    posterBytes.length >= 10_000 &&
      posterBytes.length <= 1_000_000 &&
      posterBytes.subarray(0, 2).equals(Buffer.from([0xff, 0xd8])) &&
      posterBytes.subarray(-2).equals(Buffer.from([0xff, 0xd9])) &&
      !posterBytes.includes(Buffer.from("Exif")),
    "Isaac replay poster must be a compact, metadata-clean JPEG.",
  );

  const actualHashes = {
    video: sha256(videoBytes),
    poster: sha256(posterBytes),
    captions: sha256(captionsText),
    manifest: sha256(manifestText),
    captureManifest: sha256(captureManifestText),
  };
  assert.deepEqual(actualHashes, reviewedHashes);
  assert(
    captionsText.includes("CNC surrogate-training path") &&
      captionsText.includes("Robot shadow-optimization path") &&
      captionsText.includes("Physical gate closed"),
    "Replay captions are missing the two-path or authority boundary.",
  );

  assert.equal(manifest.schema_version, "sage-public-isaac-replay/v3");
  assert.equal(manifest.evidence_class, "SIMULATED");
  assert.equal(manifest.authority, "shadow_only_non_actuating");
  assert.equal(
    manifest.render_kind,
    "nvidia_isaac_sim_non_headless_capture",
  );
  assert.equal(manifest.duration_seconds, 36);
  assert.deepEqual(manifest.frame_size, { width: 1280, height: 720 });
  assert.equal(manifest.runtime?.name, "NVIDIA Isaac Sim");
  assert.equal(manifest.runtime?.version, "6.0.1");
  assert.equal(manifest.runtime?.capture_mode, "non_headless");
  assert.equal(manifest.runtime?.rendered_frames, 864);
  assert.equal(manifest.campaign_relationship?.public_safe_runtime_capture, true);
  assert.equal(manifest.campaign_relationship?.raw_private_campaign_capture, false);
  assert.equal(manifest.campaign_relationship?.raw_private_campaign_geometry, false);
  assert.equal(manifest.campaign_relationship?.physical_machine_recording, false);
  assert.equal(manifest.source?.independent_physical_gate, "closed");
  assert.equal(manifest.source?.actuation_authority, false);
  assert(
    manifest.embodiments?.some(
      (embodiment) =>
        embodiment.id === "cnc" &&
        embodiment.learning_path === "surrogate_training_path",
    ) &&
      manifest.embodiments?.some(
        (embodiment) =>
          embodiment.id === "robot" &&
          embodiment.learning_path === "shadow_optimization_path" &&
          embodiment.robot_visual ===
            "nvidia_universal_robots_ur10e_asset",
      ),
    "Replay manifest is missing its distinct CNC and robot paths.",
  );

  for (const [key, file] of Object.entries({
    video: videoBytes,
    poster: posterBytes,
    captions: captionsText,
    capture_manifest: captureManifestText,
  })) {
    assert.equal(manifest.files?.[key]?.sha256, sha256(file));
    assert.equal(
      manifest.files?.[key]?.bytes,
      Buffer.isBuffer(file) ? file.length : Buffer.byteLength(file),
    );
  }

  assert.equal(captureManifest.schema_version, "sage-public-isaac-capture/v1");
  assert.equal(captureManifest.evidence_class, "SIMULATED");
  assert.equal(captureManifest.capture_mode, "non_headless");
  assert.equal(captureManifest.isaac_sim_version, "6.0.1");
  assert.equal(captureManifest.renderer, "RayTracedLighting");
  assert.equal(captureManifest.independent_physical_gate, "closed");
  assert.equal(captureManifest.actuation_authority, false);
  assert.equal(captureManifest.physical_machine_recording, false);
  assert.equal(captureManifest.private_campaign_capture, false);
  assert.equal(captureManifest.jobs?.length, 6);
  assert.equal(
    captureManifest.jobs?.reduce(
      (frameCount, job) => frameCount + job.frame_count,
      0,
    ),
    864,
  );
  assert(
    captureManifest.jobs?.every(
      (job) => job.frames === 144 && job.duration_seconds === 6,
    ),
    "Capture manifest contains an incomplete replay job.",
  );
  assert.equal(
    captureManifest.source_script_sha256,
    manifest.source.source_script_sha256,
  );
  assert(
    mediaReadme.includes("non-headless NVIDIA Isaac Sim") &&
      mediaReadme.includes("independent physical gate remains closed"),
    "Media README is missing its renderer or authority boundary.",
  );

  console.log(
    `Immutable Isaac replay verified: ${durationSeconds.toFixed(1)} seconds, ` +
      `${videoBytes.length.toLocaleString()} bytes, 864 rendered frames.`,
  );
}

verifyReplayFiles();
