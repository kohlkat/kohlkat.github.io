import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const generatorPath = fileURLToPath(import.meta.url);
const repositoryRoot = path.resolve(path.dirname(generatorPath), "..");
const outputDirectory = path.join(repositoryRoot, "public", "data");
const jsonPath = path.join(outputDirectory, "sage-public-simulation-v1.json");
const csvPath = path.join(outputDirectory, "sage-public-simulation-v1.csv");
const checksumsPath = path.join(outputDirectory, "SHA256SUMS.txt");
const checkOnly = process.argv.includes("--check");

const sampleCount = 120;
const vibrationFrameSampleCount = 64;
const vibrationDemoThreshold = 0.85;

function round(value, digits = 2) {
  const scale = 10 ** digits;
  return Math.round(value * scale) / scale;
}

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

function stageAt(timeSeconds) {
  if (timeSeconds <= 19) return "startup";
  if (timeSeconds <= 49) return "steady_cut";
  if (timeSeconds <= 69) return "feed_step";
  if (timeSeconds <= 94) return "disturbance";
  return "recovery";
}

function commandsAt(timeSeconds, stage) {
  if (stage === "startup") {
    const progress = timeSeconds / 19;
    return {
      spindleCommandRpm: Math.round(8000 * progress),
      feedCommandMmMin: Math.round(400 * progress),
    };
  }

  return {
    spindleCommandRpm: 8000,
    feedCommandMmMin: stage === "steady_cut" ? 400 : 650,
  };
}

function disturbanceAt(timeSeconds, stage) {
  if (stage === "disturbance") {
    const position = (timeSeconds - 70) / 24;
    return 0.22 + 0.48 * Math.sin(Math.PI * position) ** 2;
  }
  if (stage === "recovery") {
    return 0.18 * Math.exp(-(timeSeconds - 95) / 5.5);
  }
  return 0;
}

function vibrationProxyGRmsAt(
  timeSeconds,
  spindleCommandRpm,
  feedCommandMmMin,
  disturbance,
) {
  const rmsEnvelopeG =
    0.12 +
    spindleCommandRpm * 0.000025 +
    feedCommandMmMin * 0.00015 +
    Math.sin(timeSeconds * 0.51) * 0.018 +
    Math.sin(timeSeconds * 0.17 + 0.8) * 0.009 +
    disturbance;
  const phaseOffset = timeSeconds * 0.19;
  let squaredSum = 0;

  for (
    let sampleIndex = 0;
    sampleIndex < vibrationFrameSampleCount;
    sampleIndex += 1
  ) {
    const phase =
      (2 * Math.PI * sampleIndex) / vibrationFrameSampleCount + phaseOffset;
    const syntheticAccelerationG =
      rmsEnvelopeG * Math.SQRT2 * Math.sin(phase);
    squaredSum += syntheticAccelerationG ** 2;
  }

  return round(Math.sqrt(squaredSum / vibrationFrameSampleCount), 3);
}

function buildObservations() {
  const observations = [];
  let temperatureProxyC = 24.5;

  for (let timeSeconds = 0; timeSeconds < sampleCount; timeSeconds += 1) {
    const stage = stageAt(timeSeconds);
    const { spindleCommandRpm, feedCommandMmMin } = commandsAt(
      timeSeconds,
      stage,
    );
    const commandFactor =
      (spindleCommandRpm / 8000) * 0.45 +
      (feedCommandMmMin / 650) * 0.55;
    const disturbance = disturbanceAt(timeSeconds, stage);
    const loadStep = stage === "feed_step" ? 5.5 : 0;
    const loadDisturbance =
      stage === "disturbance"
        ? 4 + disturbance * 12
        : stage === "recovery"
          ? disturbance * 8
          : 0;
    const loadProxyPct = round(
      clamp(
        12 +
          commandFactor * 42 +
          loadStep +
          loadDisturbance +
          Math.sin(timeSeconds * 0.43) * 1.8 +
          Math.sin(timeSeconds * 0.11 + 1.2) * 0.7,
        0,
        100,
      ),
    );
    const vibrationProxyGRms = vibrationProxyGRmsAt(
      timeSeconds,
      spindleCommandRpm,
      feedCommandMmMin,
      disturbance,
    );
    const targetTemperatureC = 24 + loadProxyPct * 0.22;
    temperatureProxyC +=
      (targetTemperatureC - temperatureProxyC) * 0.055 +
      Math.sin(timeSeconds * 0.23) * 0.012;
    temperatureProxyC = round(temperatureProxyC);

    observations.push({
      time_s: timeSeconds,
      stage,
      spindle_command_rpm: spindleCommandRpm,
      feed_command_mm_min: feedCommandMmMin,
      load_proxy_pct: loadProxyPct,
      vibration_proxy_g_rms: vibrationProxyGRms,
      temperature_proxy_c: temperatureProxyC,
      surface_roughness_ra_um: null,
      evidence_label: "SIMULATED",
      advisory_state:
        vibrationProxyGRms > vibrationDemoThreshold ? "WITHHELD" : "ELIGIBLE",
    });
  }

  return observations;
}

function sha256(content) {
  return crypto.createHash("sha256").update(content).digest("hex");
}

function csvValue(value) {
  if (value === null) return "";
  const text = String(value);
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function renderCsv(observations) {
  const fields = Object.keys(observations[0]);
  const rows = observations.map((observation) =>
    fields.map((field) => csvValue(observation[field])).join(","),
  );
  return `${fields.join(",")}\n${rows.join("\n")}\n`;
}

function buildArtifacts() {
  const observations = buildObservations();
  const csv = renderCsv(observations);
  const withheldSamples = observations.filter(
    (observation) => observation.advisory_state === "WITHHELD",
  ).length;
  const observationBytes = JSON.stringify(observations);
  const generatorBytes = fs.readFileSync(generatorPath);

  const document = {
    schema_version: "sage-public-simulation/v1",
    title: "Public simulated CNC-like process trace",
    evidence_label: "SIMULATED",
    observed_sample_count: 0,
    generated_by: "scripts/generate-public-simulation.mjs",
    generator_version: "1.0.0",
    generator_sha256: sha256(generatorBytes),
    observation_sha256: sha256(observationBytes),
    csv_sha256: sha256(csv),
    sample_interval_seconds: 1,
    methodology: {
      vibration_proxy_g_rms:
        "Root-mean-square of a 64-sample synthetic acceleration frame scaled by disclosed command and disturbance terms; not calibrated sensor data.",
    },
    public_demo_policy: {
      field: "vibration_proxy_g_rms",
      operator: ">",
      threshold: vibrationDemoThreshold,
      result_when_true: "WITHHELD",
      result_when_false: "ELIGIBLE",
      disclaimer:
        "Illustrative public-demo threshold only; not SAGE production policy, a machine-safety limit, or a certification criterion.",
    },
    stages: [
      { id: "startup", start_s: 0, end_s: 19 },
      { id: "steady_cut", start_s: 20, end_s: 49 },
      { id: "feed_step", start_s: 50, end_s: 69 },
      { id: "disturbance", start_s: 70, end_s: 94 },
      { id: "recovery", start_s: 95, end_s: 119 },
    ],
    summary: {
      sample_count: observations.length,
      simulated_sample_count: observations.filter(
        (observation) => observation.evidence_label === "SIMULATED",
      ).length,
      observed_sample_count: 0,
      stage_count: new Set(
        observations.map((observation) => observation.stage),
      ).size,
      withheld_sample_count: withheldSamples,
      surface_roughness_measured_sample_count: observations.filter(
        (observation) => observation.surface_roughness_ra_um !== null,
      ).length,
      maximum_load_proxy_pct: Math.max(
        ...observations.map((observation) => observation.load_proxy_pct),
      ),
      maximum_vibration_proxy_g_rms: Math.max(
        ...observations.map(
          (observation) => observation.vibration_proxy_g_rms,
        ),
      ),
      maximum_temperature_proxy_c: Math.max(
        ...observations.map((observation) => observation.temperature_proxy_c),
      ),
    },
    limitations: [
      "All values are generated synthetic proxies or command trajectories.",
      "No row is an observation from physical equipment.",
      "Vibration g RMS is computed from a synthetic frame, not calibrated sensor data.",
      "Surface roughness is unmeasured and remains null in every row.",
      "The advisory rule is a disclosed public demonstration, not SAGE production policy.",
      "The dataset makes no claim of optimization, accuracy, defect reduction, field validation, certification, machine safety, or actuation.",
    ],
    observations,
  };

  const json = `${JSON.stringify(document, null, 2)}\n`;
  const checksums = [
    `${sha256(csv)}  ${path.basename(csvPath)}`,
    `${sha256(json)}  ${path.basename(jsonPath)}`,
  ].join("\n");

  return { csv, json, checksums: `${checksums}\n` };
}

function writeOrCheck(filePath, expectedContent) {
  if (checkOnly) {
    if (!fs.existsSync(filePath)) {
      throw new Error(`Missing generated public simulation artifact: ${filePath}`);
    }
    const actualContent = fs.readFileSync(filePath, "utf8");
    if (actualContent !== expectedContent) {
      throw new Error(
        `Generated public simulation artifact is stale: ${filePath}`,
      );
    }
    return;
  }

  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, expectedContent, "utf8");
}

const artifacts = buildArtifacts();
writeOrCheck(csvPath, artifacts.csv);
writeOrCheck(jsonPath, artifacts.json);
writeOrCheck(checksumsPath, artifacts.checksums);

console.log(
  checkOnly
    ? "Public simulation artifacts are current and reproducible."
    : "Public simulation CSV, JSON, and checksums generated.",
);
