import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { readFragmentedMp4DurationSeconds } from "./public-replay-scene.mjs";

const outputDirectory = path.resolve("out");
const configuredOrigin =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
  "https://sage-public-evidence.vercel.app";
const siteOrigin = new URL(configuredOrigin).origin;
const requiredFiles = [
  "index.html",
  "evidence/index.html",
  "research/index.html",
  "simulation/index.html",
  "distributed/index.html",
  "privacy/index.html",
  "404.html",
  "icon.svg",
  "llms.txt",
  "manifest.webmanifest",
  "opengraph-image.png",
  "robots.txt",
  "data/sage-public-simulation-v1.csv",
  "data/sage-public-simulation-v1.json",
  "data/sage-public-nvidia-simulation-v1.json",
  "data/sage-public-nvidia-surface-integrity-v1.json",
  "data/sage-public-fusion-worldsim-v1.json",
  "data/sage-public-distributed-learning-v1.json",
  "data/sage-public-distributed-learning-v2.json",
  "data/SHA256SUMS.txt",
  "media/sage-isaac-capture-manifest-v4.json",
  "media/sage-simulation-replay-captions-v4.vtt",
  "media/sage-simulation-replay-manifest-v4.json",
  "media/sage-simulation-replay-poster-v4.jpg",
  "media/sage-simulation-replay-v4.mp4",
  "media/sage-distributed-learning-v1.mp4",
  "media/sage-distributed-learning-poster-v1.jpg",
  "media/sage-distributed-learning-captions-v1.vtt",
  "media/sage-distributed-learning-manifest-v1.json",
  "media/sage-distributed-learning-v2.mp4",
  "media/sage-distributed-learning-poster-v2.jpg",
  "media/sage-distributed-learning-captions-v2.vtt",
  "media/sage-distributed-learning-manifest-v2.json",
  "media/third-party/noirlab-machine-shop-360-4096.jpg",
  "media/third-party/noirlab-machine-shop-credit.md",
  "sitemap.xml",
];

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function read(relativePath) {
  return fs.readFileSync(path.join(outputDirectory, relativePath), "utf8");
}

const sourceTextExtensions = new Set([
  ".css",
  ".csv",
  ".js",
  ".json",
  ".md",
  ".mjs",
  ".svg",
  ".txt",
  ".usda",
  ".vtt",
  ".webmanifest",
  ".yaml",
  ".yml",
]);

function readTextTree(rootPath) {
  if (!fs.existsSync(rootPath)) return [];

  return fs.readdirSync(rootPath, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(rootPath, entry.name);
    if (entry.isDirectory()) return readTextTree(entryPath);
    if (
      entry.isFile() &&
      sourceTextExtensions.has(path.extname(entry.name).toLowerCase())
    ) {
      return [fs.readFileSync(entryPath, "utf8")];
    }
    return [];
  });
}

for (const relativePath of requiredFiles) {
  assert(
    fs.existsSync(path.join(outputDirectory, relativePath)),
    `Missing static export asset: ${relativePath}`,
  );
}
assert(
  !fs.existsSync(path.join(outputDirectory, ".well-known/tdmrep.json")),
  "The retired text-and-data-mining reservation remains in the static export.",
);

const home = read("index.html");
const evidence = read("evidence/index.html");
const research = read("research/index.html");
const simulation = read("simulation/index.html");
const distributed = read("distributed/index.html");
const privacy = read("privacy/index.html");
const robots = read("robots.txt");
const sitemap = read("sitemap.xml");
const llms = read("llms.txt");
const vercelConfiguration = JSON.parse(
  fs.readFileSync(path.resolve("vercel.json"), "utf8"),
);
const vercelGlobalHeaders = new Map(
  vercelConfiguration.headers
    ?.find((entry) => entry.source === "/(.*)")
    ?.headers?.map((header) => [header.key, header.value]) ?? [],
);

assert(
  home.includes(`rel="canonical" href="${siteOrigin}/"`),
  "Homepage canonical does not match NEXT_PUBLIC_SITE_URL.",
);
assert(
  evidence.includes(`rel="canonical" href="${siteOrigin}/evidence/"`),
  "Evidence-guide canonical does not match NEXT_PUBLIC_SITE_URL.",
);
assert(
  research.includes(`rel="canonical" href="${siteOrigin}/research/"`),
  "Research canonical does not match NEXT_PUBLIC_SITE_URL.",
);
assert(
  privacy.includes(`rel="canonical" href="${siteOrigin}/privacy/"`),
  "Privacy canonical does not match NEXT_PUBLIC_SITE_URL.",
);
assert(
  simulation.includes(`rel="canonical" href="${siteOrigin}/simulation/"`),
  "Simulation canonical does not match NEXT_PUBLIC_SITE_URL.",
);
assert(
  distributed.includes(`rel="canonical" href="${siteOrigin}/distributed/"`),
  "Distributed canonical does not match NEXT_PUBLIC_SITE_URL.",
);
assert(
  home.includes('http-equiv="Content-Security-Policy"') &&
    home.includes("media-src &#x27;self&#x27;"),
  "Content Security Policy meta tag or same-origin media boundary is missing.",
);
assert(
  vercelGlobalHeaders
    .get("Content-Security-Policy")
    ?.includes("media-src 'self'") &&
    vercelGlobalHeaders
      .get("Content-Security-Policy")
      ?.includes("frame-ancestors 'none'") &&
    vercelGlobalHeaders
      .get("Permissions-Policy")
      ?.includes("autoplay=(self)") &&
    vercelGlobalHeaders.get("Permissions-Policy")?.includes("camera=()") &&
    vercelGlobalHeaders.get("Permissions-Policy")?.includes("microphone=()"),
  "Vercel media, framing, autoplay, camera, or microphone policy is not fail-closed.",
);
assert(
  !vercelGlobalHeaders.has("X-Robots-Tag"),
  "Vercel headers must not restrict crawler archiving or discovery.",
);
assert(
  home.includes("application/ld+json") &&
    home.includes("SoftwareApplication") &&
    home.includes("Organization"),
  "Expected public-safe JSON-LD graph is missing.",
);
assert(
  simulation.includes("application/ld+json") &&
    simulation.includes('"@type":"Dataset"') &&
    simulation.includes("sage-public-simulation-v1.csv"),
  "Expected public simulation Dataset JSON-LD is missing.",
);
assert(
  home.includes('href="/evidence/"') &&
    home.includes('href="/research/"') &&
    home.includes("Software-Aware G-code Extension") &&
    home.includes('aria-label="Navigation menu"') &&
    home.includes('aria-label="Mobile navigation"') &&
    home.includes("What your team receives") &&
    home.includes("Five focused checks") &&
    home.includes("Make every difficult cut") &&
    home.includes("a decision you can defend") &&
    home.includes("A decision packet, not a black-box prediction") &&
    home.includes("2,542") &&
    home.includes("46.7") &&
    home.includes("2.64") &&
    home.includes("Modeled finish context") &&
    home.includes("659") &&
    home.includes("NVIDIA Isaac Sim") &&
    home.includes("CNC + robot teaching showcase (SIMULATED)") &&
    home.includes("SIMULATED / NVIDIA Isaac Sim") &&
    home.includes("tool-stock cutting contact") &&
    home.includes("Public SIMULATED Isaac Sim capture") &&
    home.includes("force-aware relative pose") &&
    home.includes("seventh-axis linear rail") &&
    home.includes("two-axis tilt-rotary positioner") &&
    home.includes("Force-aware relative pose for robotic machining") &&
    home.includes("Proposed · not current replay") &&
    home.includes("Proposed study sequence") &&
    home.includes("Hold the job constant") &&
    home.includes("Explain or decline") &&
    home.includes("not a live ROS command path") &&
    home.includes("Shadow pilot · offline and non-actuating") &&
    home.includes("Prove the decision workflow before touching the machine") &&
    home.includes("Scope one representative job") &&
    home.includes("Compare in shadow") &&
    home.includes("Disposition log and pilot report") &&
    home.includes("No cross-customer training") &&
    home.includes("Any physical trial is a separate protocol") &&
    home.includes("do not attach controlled production files") &&
    home.includes("A secure intake route is agreed after data-use terms") &&
    home.includes("Inspect the capture manifest") &&
    home.includes(
      'href="/media/sage-isaac-capture-manifest-v4.json"',
    ) &&
    home.includes('aria-label="SIMULATED CNC and robot teaching replay"') &&
    home.includes('src="/media/sage-simulation-replay-v4.mp4"') &&
    home.includes('kind="captions"') &&
    home.includes('src="/media/sage-simulation-replay-captions-v4.vtt"'),
  "Homepage does not provide the product journey, mobile navigation, acronym definition, aggregate simulation evidence, relative-pose plan, research path, or five-check overview.",
);
assert(
  home.indexOf('src="/media/sage-simulation-replay-v4.mp4"') <
    home.indexOf("What your team receives"),
  "Homepage simulation replay must remain in the above-fold hero before product detail.",
);
assert(
  evidence.includes("Five assurance kernels") &&
    evidence.includes("Verified NVIDIA simulation campaign") &&
    evidence.includes(
      "All 2,542 shadow programs scored below their simulated baselines",
    ) &&
    evidence.includes("46.7") &&
    evidence.includes("659") &&
    evidence.includes("Campaign integrity passed. Model promotion did not.") &&
    evidence.includes("Surface-integrity retrospective") &&
    evidence.includes("modeled, not measured") &&
    evidence.includes("Surface aggregate JSON") &&
    evidence.includes("Public description boundary") &&
    evidence.includes("Open the five-source research ledger") &&
    evidence.includes("These datasets did not all train one publicly auditable model checkpoint") &&
    evidence.includes("Bosch CNC") &&
    evidence.includes("AI4I 2020") &&
    evidence.includes("NASA Milling") &&
    evidence.includes("NUAA / Uniwear") &&
    evidence.includes("PHM 2010") &&
    evidence.includes("Held-out") &&
    evidence.includes("NRMSE") &&
    evidence.includes("R²") &&
    evidence.includes("Rights review") &&
    evidence.includes("simulation objective"),
  "Evidence guide is missing kernels, supporting dataset context, glossary terms, or authority boundaries.",
);
assert(
  research.includes("SAGE research program") &&
    research.includes("Traceable machining measurement") &&
    research.includes("Digital-twin VVUQ") &&
    research.includes("Force-aware relative pose") &&
    research.includes("Fixed-base robot") &&
    research.includes("Seventh-axis linear rail") &&
    research.includes("Two-axis tilt-rotary positioner") &&
    research.includes("Same synthetic job, three cell topologies") &&
    research.includes("not a live ROS command path") &&
    research.includes("Surface-integrity retrospective") &&
    research.includes("2,542") &&
    research.includes("46.7") &&
    research.includes("1.78") &&
    research.includes("3.43") &&
    research.includes("NIST collaboration path") &&
    research.includes("CRADA") &&
    research.includes("TechRxiv") &&
    research.includes("Zenodo") &&
    research.includes("Kept controlled") &&
    research.includes("model weights"),
  "Research page is missing the current evidence, NIST routes, release path, or disclosure boundary.",
);
assert(
  evidence.includes("0.563") &&
    evidence.includes("0.680") &&
    evidence.includes("0.752") &&
    evidence.includes("not anomaly-detection accuracy"),
  "Bosch open-data result or its non-overclaim boundary is missing.",
);
assert(
  simulation.includes("120 one-second SIMULATED") &&
    simulation.includes("Observed samples:") &&
    simulation.includes("0.85") &&
    simulation.includes("not SAGE production policy") &&
    simulation.includes("surface_roughness_ra_um") &&
    simulation.includes("field remains null"),
  "Simulation truth-boundary language is missing or incomplete.",
);
assert(
  home.includes(`${siteOrigin}/opengraph-image.png`),
  "Open Graph image URL does not match the canonical origin.",
);
assert(
  robots.includes(`Sitemap: ${siteOrigin}/sitemap.xml`),
  "robots.txt sitemap URL does not match the canonical origin.",
);
assert(
  robots.includes("User-Agent: *") &&
    robots.includes("Allow: /") &&
    !robots.includes("Disallow:") &&
    !robots.includes("tdmrep"),
  "robots.txt must allow cooperative search, archive, and AI crawlers site-wide.",
);
for (const page of [home, evidence, research, simulation, privacy]) {
  assert(
    page.includes("index, follow") &&
      !page.includes("noarchive") &&
      !page.includes("nocache"),
    "A public page still limits crawler archiving or cacheability.",
  );
}
assert(
  privacy.includes('id="automated-access"') &&
    privacy.includes("may be indexed, crawled, archived, retrieved, and") &&
    privacy.includes("reviewed by search engines, web archives, and AI systems") &&
    !privacy.includes("text-and-data-mining rights") &&
    !privacy.includes("tdmrep"),
  "The visible automated-access policy does not clearly permit discovery.",
);
assert(
  sitemap.includes(`<loc>${siteOrigin}/</loc>`) &&
    sitemap.includes(`<loc>${siteOrigin}/evidence/</loc>`) &&
    sitemap.includes(`<loc>${siteOrigin}/research/</loc>`) &&
    sitemap.includes(`<loc>${siteOrigin}/privacy/</loc>`) &&
    sitemap.includes(`<loc>${siteOrigin}/simulation/</loc>`),
  "sitemap.xml URLs do not match the canonical origin.",
);
assert(
  llms.includes(`Canonical site: ${siteOrigin}/`),
  "llms.txt canonical URL does not match the canonical origin.",
);
assert(
  llms.includes(`${siteOrigin}/robots.txt`) &&
    llms.includes(`${siteOrigin}/privacy/#automated-access`) &&
    llms.includes("welcomes automated discovery, indexing, archiving, retrieval") &&
    llms.includes(`${siteOrigin}/research/`) &&
    llms.includes("SIMULATED") &&
    !llms.includes("not authorized without") &&
    !llms.includes("TDM rights reservation"),
  "llms.txt must provide an open, evidence-bounded AI-readable site index.",
);
assert(
  !home.includes("\uFFFD") &&
    !evidence.includes("\uFFFD") &&
    !privacy.includes("\uFFFD"),
  "Replacement characters were found in exported HTML.",
);

const verificationToken =
  process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim();
if (verificationToken) {
  assert(
    home.includes('name="google-site-verification"') &&
      home.includes(verificationToken),
    "Configured Google verification token is missing from the homepage.",
  );
}

function isTrustedGtagLoaderUrl(candidate) {
  try {
    const url = new URL(candidate);
    const loaderId = url.searchParams.get("id");

    return (
      url.origin === "https://www.googletagmanager.com" &&
      url.pathname === "/gtag/js" &&
      url.searchParams.size === 1 &&
      typeof loaderId === "string" &&
      loaderId.length > 0 &&
      url.hash === ""
    );
  } catch {
    return false;
  }
}

function bundleHasTrustedGtagLoader(javascript) {
  const absoluteUrls = javascript.match(/https:\/\/[^\s"'`\\]+/g) ?? [];
  return absoluteUrls.some(isTrustedGtagLoaderUrl);
}

assert(
  isTrustedGtagLoaderUrl(
    "https://www.googletagmanager.com/gtag/js?id=G-TEST1234",
  ),
  "Trusted gtag loader URL validation rejected the intended endpoint.",
);
assert(
  !isTrustedGtagLoaderUrl(
    "https://evil-googletagmanager.com/gtag/js?id=G-TEST1234",
  ),
  "Trusted gtag loader URL validation accepted a host-prefix attack.",
);
assert(
  !isTrustedGtagLoaderUrl(
    "https://www.googletagmanager.com.evil.example/gtag/js?id=G-TEST1234",
  ),
  "Trusted gtag loader URL validation accepted a host-suffix attack.",
);

const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();
if (measurementId) {
  assert(
    /^G-[A-Z0-9]+$/i.test(measurementId),
    "NEXT_PUBLIC_GA_MEASUREMENT_ID has an invalid format.",
  );
  const javascript = fs
    .readdirSync(path.join(outputDirectory, "_next/static/chunks"))
    .filter((fileName) => fileName.endsWith(".js"))
    .map((fileName) =>
      fs.readFileSync(
        path.join(outputDirectory, "_next/static/chunks", fileName),
        "utf8",
      ),
    )
    .join("\n");
  assert(
    javascript.includes(measurementId) &&
      bundleHasTrustedGtagLoader(javascript),
    "Configured GA4 measurement ID is missing from the client bundle.",
  );
}

const socialImage = fs.readFileSync(
  path.join(outputDirectory, "opengraph-image.png"),
);
assert(
  socialImage.subarray(0, 8).equals(
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  ),
  "Open Graph asset is not a PNG.",
);
assert(
  socialImage.readUInt32BE(16) === 1200 &&
    socialImage.readUInt32BE(20) === 630,
  "Open Graph image must be 1200x630.",
);

const replayVideo = fs.readFileSync(
  path.join(outputDirectory, "media", "sage-simulation-replay-v4.mp4"),
);
const replayPoster = fs.readFileSync(
  path.join(
    outputDirectory,
    "media",
    "sage-simulation-replay-poster-v4.jpg",
  ),
);
const replayCaptions = read("media/sage-simulation-replay-captions-v4.vtt");
const replayManifestText = read(
  "media/sage-simulation-replay-manifest-v4.json",
);
const captureManifestText = read("media/sage-isaac-capture-manifest-v4.json");
const replayManifest = JSON.parse(replayManifestText);
const captureManifest = JSON.parse(captureManifestText);
const replayDurationSeconds = readFragmentedMp4DurationSeconds(replayVideo);
assert(
  replayVideo.length >= 100_000 &&
    replayVideo.length <= 8_000_000 &&
    replayVideo.subarray(4, 8).equals(Buffer.from("ftyp")) &&
    !replayVideo.includes(Buffer.from("soun")) &&
    replayDurationSeconds >= 35.5 &&
    replayDurationSeconds <= 36.5 &&
    replayManifest.files?.video?.sha256 === sha256(replayVideo) &&
    replayManifest.files?.video?.bytes === replayVideo.length,
  "Showcase replay must be a compact, silent, manifest-bound MP4 asset.",
);
assert(
  replayPoster.length >= 8_000 &&
    replayPoster.length <= 1_000_000 &&
    replayPoster.subarray(0, 2).equals(Buffer.from([0xff, 0xd8])) &&
    replayPoster
      .subarray(replayPoster.length - 2)
      .equals(Buffer.from([0xff, 0xd9])) &&
    replayManifest.files?.poster?.sha256 === sha256(replayPoster) &&
    replayManifest.files?.poster?.bytes === replayPoster.length,
  "Simulation replay poster must be a compact, manifest-bound JPEG.",
);
assert(
  replayManifest.schema_version === "sage-public-isaac-replay/v4" &&
    replayManifest.evidence_class === "SIMULATED" &&
    replayManifest.authority === "shadow_only_non_actuating" &&
    replayManifest.duration_seconds === 36 &&
    replayManifest.frame_size?.width === 1280 &&
    replayManifest.frame_size?.height === 720 &&
    replayManifest.runtime?.rendered_frames === 864 &&
    replayManifest.runtime?.robot_cutting_contact === true &&
    replayManifest.runtime?.cnc_close_framing === true &&
    replayManifest.campaign_relationship?.public_safe_runtime_capture ===
      true &&
    replayManifest.campaign_relationship?.raw_private_campaign_capture ===
      false &&
    replayManifest.campaign_relationship?.physical_machine_recording ===
      false &&
    replayManifest.source?.independent_physical_gate === "closed" &&
    replayManifest.source?.actuation_authority === false &&
    replayManifest.embodiments?.some((embodiment) => embodiment.id === "cnc") &&
    replayManifest.embodiments?.some((embodiment) => embodiment.id === "robot"),
  "Simulation replay manifest is missing its evidence, embodiment, or provenance boundary.",
);
assert(
  replayCaptions.includes("SIMULATED") &&
    replayCaptions.includes("CNC") &&
    replayCaptions.includes("Robot") &&
    replayManifest.files?.captions?.sha256 === sha256(replayCaptions),
  "Simulation replay captions are missing the SIMULATED / dual-path boundary.",
);
assert(
  replayManifest.files?.capture_manifest?.sha256 ===
    sha256(captureManifestText) &&
    replayManifest.files?.capture_manifest?.bytes ===
      Buffer.byteLength(captureManifestText) &&
    captureManifest.schema_version === "sage-public-isaac-capture/v1" &&
    captureManifest.evidence_class === "SIMULATED" &&
    captureManifest.independent_physical_gate === "closed" &&
    captureManifest.actuation_authority === false &&
    captureManifest.physical_machine_recording === false &&
    captureManifest.jobs?.length === 6 &&
    captureManifest.jobs?.every(
      (job) => job.frames === 144 && job.frame_count === 144,
    ) &&
    captureManifest.jobs.reduce(
      (frameCount, job) => frameCount + job.frame_count,
      0,
    ) === 864 &&
    captureManifest.jobs
      .filter((job) => job.embodiment === "robot")
      .every((job) => job.cutting_contact === true),
  "Capture manifest is missing its job, cutting-contact, or authority boundary.",
);

const distributedVideo = fs.readFileSync(
  path.join(outputDirectory, "media", "sage-distributed-learning-v2.mp4"),
);
const distributedPoster = fs.readFileSync(
  path.join(outputDirectory, "media", "sage-distributed-learning-poster-v2.jpg"),
);
const distributedCaptions = read("media/sage-distributed-learning-captions-v2.vtt");
const distributedManifest = JSON.parse(
  read("media/sage-distributed-learning-manifest-v2.json"),
);
const distributedBackground = fs.readFileSync(
  path.join(outputDirectory, "media", "third-party", "noirlab-machine-shop-360-4096.jpg"),
);
const distributedDurationSeconds = readFragmentedMp4DurationSeconds(distributedVideo);
assert(
  distributedVideo.length >= 100_000 &&
    distributedVideo.length <= 8_000_000 &&
    distributedVideo.subarray(4, 8).equals(Buffer.from("ftyp")) &&
    !distributedVideo.includes(Buffer.from("soun")) &&
    distributedDurationSeconds >= 5.5 &&
    distributedDurationSeconds <= 6.5 &&
    distributedManifest.files?.video?.sha256 === sha256(distributedVideo) &&
    distributedManifest.files?.video?.bytes === distributedVideo.length,
  "Distributed v2 must be a compact, silent, manifest-bound MP4 asset.",
);
assert(
  distributedPoster.subarray(0, 2).equals(Buffer.from([0xff, 0xd8])) &&
    distributedPoster
      .subarray(distributedPoster.length - 2)
      .equals(Buffer.from([0xff, 0xd9])) &&
    distributedManifest.files?.poster?.sha256 === sha256(distributedPoster) &&
    distributedManifest.files?.poster?.bytes === distributedPoster.length &&
    distributedCaptions.includes("40 randomized stock cells") &&
    distributedCaptions.includes("SIMULATED") &&
    distributedManifest.files?.captions?.sha256 === sha256(distributedCaptions),
  "Distributed v2 poster, captions, or manifest binding is invalid.",
);
assert(
  distributedManifest.schema_version === "sage-public-distributed-learning/v2" &&
    distributedManifest.evidence_class === "SIMULATED" &&
    distributedManifest.authority === "shadow_only_non_actuating" &&
    distributedManifest.physical_machine_validation === false &&
    distributedManifest.camera_path === "low_rail_dolly_to_close_overview" &&
    distributedManifest.duration_seconds === 6 &&
    distributedManifest.workers_visualized === 40 &&
    distributedManifest.background?.kind ===
      "equirectangular_machine_shop_panorama" &&
    distributedManifest.background?.license === "CC BY 4.0" &&
    distributedManifest.background?.sha256 === sha256(distributedBackground),
  "Distributed v2 evidence, camera, or credited shop background is invalid.",
);
assert(
  distributed.includes('src="/media/sage-distributed-learning-v2.mp4"') &&
    distributed.includes("NOIRLab/NSF/AURA/T. Slovinský") &&
    distributed.includes("CC BY 4.0"),
  "Distributed page does not expose v2 media and its required background credit.",
);

function sha256(content) {
  return crypto.createHash("sha256").update(content).digest("hex");
}

const sourceDataDirectory = path.resolve("public", "data");
const exportedDataDirectory = path.join(outputDirectory, "data");
const simulationJsonText = fs.readFileSync(
  path.join(sourceDataDirectory, "sage-public-simulation-v1.json"),
  "utf8",
);
const simulationCsvText = fs.readFileSync(
  path.join(sourceDataDirectory, "sage-public-simulation-v1.csv"),
  "utf8",
);
const nvidiaResultsText = fs.readFileSync(
  path.join(sourceDataDirectory, "sage-public-nvidia-simulation-v1.json"),
  "utf8",
);
const surfaceResultsText = fs.readFileSync(
  path.join(
    sourceDataDirectory,
    "sage-public-nvidia-surface-integrity-v1.json",
  ),
  "utf8",
);
const fusionResultsText = fs.readFileSync(
  path.join(sourceDataDirectory, "sage-public-fusion-worldsim-v1.json"),
  "utf8",
);
const simulationDocument = JSON.parse(simulationJsonText);
const nvidiaResultsDocument = JSON.parse(nvidiaResultsText);
const surfaceResultsDocument = JSON.parse(surfaceResultsText);
const fusionResultsDocument = JSON.parse(fusionResultsText);
const observations = simulationDocument.observations;
const expectedObservationKeys = [
  "time_s",
  "stage",
  "spindle_command_rpm",
  "feed_command_mm_min",
  "load_proxy_pct",
  "vibration_proxy_g_rms",
  "temperature_proxy_c",
  "surface_roughness_ra_um",
  "evidence_label",
  "advisory_state",
];
const sortedExpectedObservationKeys = [...expectedObservationKeys].sort();

assert(
  simulationDocument.schema_version === "sage-public-simulation/v1",
  "Public simulation schema version is unsupported.",
);
assert(
  Array.isArray(observations) && observations.length === 120,
  "Public simulation must contain exactly 120 observations.",
);
assert(
  observations.every(
    (observation) =>
      JSON.stringify(Object.keys(observation).sort()) ===
      JSON.stringify(sortedExpectedObservationKeys),
  ),
  "Public simulation observations contain missing or unexpected fields.",
);
assert(
  observations.every(
    (observation, index) =>
      observation.time_s === index &&
      observation.evidence_label === "SIMULATED" &&
      observation.surface_roughness_ra_um === null,
  ),
  "Public simulation time, evidence labels, or null Ra values are invalid.",
);
assert(
  simulationDocument.observed_sample_count === 0 &&
    simulationDocument.summary.observed_sample_count === 0 &&
    simulationDocument.summary.simulated_sample_count === 120 &&
    simulationDocument.summary.surface_roughness_measured_sample_count === 0,
  "Public simulation evidence counts are not fail-closed.",
);
assert(
  observations.every((observation) =>
    [
      observation.time_s,
      observation.spindle_command_rpm,
      observation.feed_command_mm_min,
      observation.load_proxy_pct,
      observation.vibration_proxy_g_rms,
      observation.temperature_proxy_c,
    ].every(Number.isFinite),
  ),
  "Public simulation contains a non-finite numeric value.",
);

const demoPolicy = simulationDocument.public_demo_policy;
const derivedWithheldCount = observations.filter(
  (observation) =>
    observation.vibration_proxy_g_rms > demoPolicy.threshold,
).length;
assert(
  demoPolicy.field === "vibration_proxy_g_rms" &&
    demoPolicy.operator === ">" &&
    demoPolicy.threshold === 0.85 &&
    observations.every(
      (observation) =>
        observation.advisory_state ===
        (observation.vibration_proxy_g_rms > demoPolicy.threshold
          ? "WITHHELD"
          : "ELIGIBLE"),
    ) &&
    simulationDocument.summary.withheld_sample_count === derivedWithheldCount,
  "Public simulation advisory states do not match the disclosed demo rule.",
);

const csvLines = simulationCsvText.trimEnd().split("\n");
const csvHeader = csvLines[0].split(",");
const raIndex = csvHeader.indexOf("surface_roughness_ra_um");
const evidenceIndex = csvHeader.indexOf("evidence_label");
assert(
  csvLines.length === 121 &&
    JSON.stringify(csvHeader) === JSON.stringify(expectedObservationKeys) &&
    raIndex >= 0 &&
    evidenceIndex >= 0,
  "Public simulation CSV shape or fields are invalid.",
);
assert(
  csvLines.slice(1).every((line) => {
    const values = line.split(",");
    return (
      values.length === csvHeader.length &&
      values[raIndex] === "" &&
      values[evidenceIndex] === "SIMULATED"
    );
  }),
  "Public simulation CSV must keep Ra blank and every row SIMULATED.",
);

const approximatelyEqual = (left, right) =>
  Number.isFinite(left) &&
  Number.isFinite(right) &&
  Math.abs(left - right) < 1e-8;

assert(
  nvidiaResultsDocument.schema_version ===
    "sage-public-nvidia-simulation/v1" &&
    nvidiaResultsDocument.evidence_class === "SIMULATED" &&
    nvidiaResultsDocument.authority === "shadow_only_non_actuating" &&
    nvidiaResultsDocument.runtime?.name === "NVIDIA Isaac Sim" &&
    nvidiaResultsDocument.integrity?.postflight_status === "PASS",
  "Public NVIDIA result schema, evidence class, authority, runtime, or integrity status is invalid.",
);

const campaign = nvidiaResultsDocument.campaign;
const outcomes = nvidiaResultsDocument.within_simulator_outcomes;
const reduction = outcomes?.program_objective_reduction_fraction;
assert(
  campaign?.robot_programs === 2542 &&
    campaign?.provenance_records === 2542 &&
    campaign?.unique_program_hashes === 2542 &&
    campaign?.verified_shard_archives === 659 &&
    campaign?.scenario_cells === 9 &&
    outcomes?.programs_with_lower_objective === 2542 &&
    outcomes?.shard_policies_with_lower_objective === 659 &&
    outcomes?.declared_simulated_constraint_violations === 0 &&
    approximatelyEqual(reduction?.median, 0.46691006) &&
    approximatelyEqual(reduction?.mean, 0.46815768) &&
    approximatelyEqual(reduction?.p10, 0.3750838) &&
    approximatelyEqual(reduction?.p90, 0.56336824),
  "Public NVIDIA campaign counts or reviewed outcome distribution are invalid.",
);

const expectedCells = new Map([
  ["circle_pocket|aluminum_6061", 296],
  ["circle_pocket|mild_steel", 288],
  ["circle_pocket|titanium_proxy", 251],
  ["rounded_rectangle_pocket|aluminum_6061", 253],
  ["rounded_rectangle_pocket|mild_steel", 240],
  ["rounded_rectangle_pocket|titanium_proxy", 298],
  ["slot_pocket|aluminum_6061", 277],
  ["slot_pocket|mild_steel", 394],
  ["slot_pocket|titanium_proxy", 245],
]);
const coverageCells = nvidiaResultsDocument.coverage?.cells;
assert(
  Array.isArray(coverageCells) &&
    coverageCells.length === expectedCells.size &&
    coverageCells.reduce((sum, cell) => sum + cell.programs, 0) === 2542 &&
    coverageCells.every(
      (cell) =>
        expectedCells.get(`${cell.shape}|${cell.material}`) === cell.programs,
    ),
  "Public NVIDIA campaign coverage cells do not match the reviewed aggregate.",
);

assert(
  Array.isArray(nvidiaResultsDocument.interpretation) &&
    nvidiaResultsDocument.interpretation.some((boundary) =>
      boundary.includes("not held-out policy generalization"),
    ) &&
    nvidiaResultsDocument.interpretation.some((boundary) =>
      boundary.includes("physical cutting"),
    ) &&
    nvidiaResultsDocument.model_decision?.saved_cnc_surrogate_promoted ===
      false &&
    nvidiaResultsDocument.model_decision?.trust_radius_published === false,
  "Public NVIDIA campaign boundaries or fail-closed model decision are missing.",
);

assert(
  sha256(nvidiaResultsText) ===
    "5a05ce9e948d5994fd461948a2d11adf7f114975b8a546f8ad84eee39be27817" &&
    sha256(nvidiaResultsText.replace(/\r?\n/g, "\r\n")) ===
      "cc230453e155f5e3bc103b30ce82c72ff57d08810801ef8c7c3bbf4003122ff7",
  "Public NVIDIA result document does not match the reviewed exporter artifact.",
);

const publicSurface = surfaceResultsDocument
  .finish_pass_surface_integrity_proxy_um;
assert(
  surfaceResultsDocument.schema_version ===
    "sage-public-nvidia-surface-integrity/v1" &&
    surfaceResultsDocument.evidence_class === "SIMULATED" &&
    surfaceResultsDocument.authority === "shadow_only_non_actuating" &&
    surfaceResultsDocument.measurement_status === "modeled_not_measured" &&
    surfaceResultsDocument.runtime?.name ===
      "NVIDIA Isaac Sim hybrid trajectory" &&
    surfaceResultsDocument.integrity?.postflight_status === "PASS" &&
    surfaceResultsDocument.campaign?.robot_episodes_analyzed === 2542 &&
    surfaceResultsDocument.campaign?.verified_shard_archives === 659 &&
    surfaceResultsDocument.historical_geometry_boundary
      ?.campaign_programs_with_measured_corner_radius === 0 &&
    approximatelyEqual(
      publicSurface?.lower_bound_distribution?.median,
      1.77892137,
    ) &&
    approximatelyEqual(
      publicSurface?.midpoint_distribution?.median,
      2.6418043,
    ) &&
    approximatelyEqual(
      publicSurface?.upper_bound_distribution?.median,
      3.42579012,
    ),
  "Public NVIDIA surface-integrity schema, campaign counts, labels, or reviewed distributions are invalid.",
);
assert(
  Array.isArray(surfaceResultsDocument.interpretation) &&
    surfaceResultsDocument.interpretation.some((boundary) =>
      boundary.includes("not measured Ra"),
    ) &&
    surfaceResultsDocument.interpretation.some((boundary) =>
      boundary.includes("physical cutting evidence"),
    ) &&
    sha256(surfaceResultsText) ===
      "bf3bd81577d1b039c47aac67f72ed6ab17f3adc06a88e1de7e313140bbc1b93f" &&
    sha256(surfaceResultsText.replace(/\r?\n/g, "\r\n")) ===
      "836a0a5888042d10b53b9d3f8c07686028a1707b3d1aa7744ab9c34b73d04b5d",
  "Public NVIDIA surface-integrity boundaries or exporter hash are invalid.",
);

assert(
  fusionResultsDocument.schema === "sage-public-fusion-worldsim/v1" &&
    fusionResultsDocument.evidence_class === "SIMULATED" &&
    fusionResultsDocument.authority === "shadow_only_non_actuating" &&
    fusionResultsDocument.measurement_status === "modeled_not_measured" &&
    fusionResultsDocument.observed_count === 0 &&
    fusionResultsDocument.physical_cutting === false &&
    fusionResultsDocument.physical_machine_validation === false &&
    fusionResultsDocument.campaign?.worker_runs === 53 &&
    fusionResultsDocument.campaign?.stress_episodes === 497834 &&
    fusionResultsDocument.campaign?.sensor_catalog_size === 26 &&
    fusionResultsDocument.latency_stress?.knee_ident_below_0_4_reached ===
      false &&
    approximatelyEqual(fusionResultsDocument.latency_stress?.x2?.ident_mean, 0.602) &&
    approximatelyEqual(fusionResultsDocument.latency_stress?.x4?.ident_mean, 0.548) &&
    Array.isArray(fusionResultsDocument.nonclaims) &&
    fusionResultsDocument.nonclaims.some((item) =>
      item.includes("Not physical machine validation"),
    ) &&
    fusionResultsDocument.digital_twin_capability?.status ===
      "implemented_software" &&
    sha256(fusionResultsText) ===
      "60c4ee7f4fd7d94b7a28fab1ca02962a90d7ad404da61acc2673cf1ad86c9e10",
  "Public fusion world-sim aggregate schema, labels, or reviewed counts are invalid.",
);

const generatorBytes = fs.readFileSync(
  path.resolve("scripts", "generate-public-simulation.mjs"),
);
assert(
  simulationDocument.observation_sha256 ===
    sha256(JSON.stringify(observations)) &&
    simulationDocument.csv_sha256 === sha256(simulationCsvText) &&
    simulationDocument.generator_sha256 === sha256(generatorBytes),
  "Public simulation embedded hashes are stale.",
);

const checksumLines = fs
  .readFileSync(path.join(sourceDataDirectory, "SHA256SUMS.txt"), "utf8")
  .trim()
  .split("\n");
for (const line of checksumLines) {
  const [expectedHash, fileName] = line.split(/\s{2}/);
  assert(
    expectedHash &&
      fileName &&
      sha256(fs.readFileSync(path.join(sourceDataDirectory, fileName))) ===
        expectedHash &&
      sha256(fs.readFileSync(path.join(exportedDataDirectory, fileName))) ===
        expectedHash,
    `Public simulation checksum mismatch: ${fileName || "unknown file"}.`,
  );
}

const publicText = [
  home,
  evidence,
  research,
  simulation,
  privacy,
  robots,
  sitemap,
  llms,
  simulationJsonText,
  simulationCsvText,
  nvidiaResultsText,
  surfaceResultsText,
  fusionResultsText,
].join("\n");
const sourceText = [
  ...["app", "lib", "public", "scripts", ".github"].flatMap((directory) =>
    readTextTree(path.resolve(directory)),
  ),
  ...["README.md", "package.json", "package-lock.json"]
    .filter((fileName) => fs.existsSync(path.resolve(fileName)))
    .map((fileName) => fs.readFileSync(path.resolve(fileName), "utf8")),
].join("\n");
const scannedText = `${publicText}\n${sourceText}`;
const secretPatterns = [
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /"client_secret"\s*:/i,
  /"refresh_token"\s*:/i,
  /AIza[0-9A-Za-z_-]{30,}/,
];

for (const pattern of secretPatterns) {
  assert(!pattern.test(scannedText), `Potential secret matched ${pattern}.`);
}

const privateMarkerPatterns = [
  {
    label: "absolute Windows path",
    pattern: /\b[A-Z]:\\[^\s<>"|?*\r\n]+/i,
  },
  {
    label: "numbered private source module",
    pattern: /\bsrc[\\/][a-z][a-z0-9_-]*\d{3,}\b/i,
  },
  {
    label: "sealed implementation token",
    pattern: /\bsealed[_-][a-z][a-z0-9_-]*\b/i,
  },
  {
    label: "internal runner or governor identifier",
    pattern: /\b(?:[A-Z][a-z0-9]+){2,}(?:Runner|Governor)\b/,
  },
  {
    label: "numbered internal codename",
    pattern: /\b[A-Z]{4,}-\d{3}\b/,
  },
  {
    label: "private Python module path",
    pattern: /\b(?:control|contract|sim)[\\/][a-z][a-z0-9_-]*\.py\b/i,
  },
  {
    label: "confidential engineering record language",
    pattern: /\bconfidential engineering working record\b/i,
  },
  {
    label: "numbered legal claim reference",
    pattern: /\bclaims?\s+\d+(?:\s*[,–-]\s*\d+)*\b/i,
  },
];

for (const { label, pattern } of privateMarkerPatterns) {
  assert(
    !pattern.test(scannedText),
    `Potential proprietary or private marker found: ${label}.`,
  );
}

const publicClaimScanText = scannedText.replace(
  /\b(?:not|no)\b[^.!?]{0,180}\bmeasured (?:cycle time|quality|force|shop-floor performance)\b/gi,
  "NEGATED_MEASUREMENT_BOUNDARY",
);
const prohibitedPublicClaims = [
  /\bfield[- ]proven\b/i,
  /\bmachine[- ]validated\b/i,
  /\bmeasured (?:cycle time|quality|force|shop-floor performance)\b/i,
  /\b(?:actual|live|executed)\s+(?:Isaac Sim|Omniverse)\b/i,
];
for (const pattern of prohibitedPublicClaims) {
  assert(
    !pattern.test(publicClaimScanText),
    `Potential simulation overclaim found: ${pattern}.`,
  );
}

console.log(`Static SEO and security verification passed for ${siteOrigin}.`);
