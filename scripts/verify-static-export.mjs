import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const outputDirectory = path.resolve("out");
const configuredOrigin =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://kohlkat.github.io";
const siteOrigin = new URL(configuredOrigin).origin;
const requiredFiles = [
  "index.html",
  "simulation/index.html",
  "privacy/index.html",
  "404.html",
  "icon.svg",
  "llms.txt",
  "manifest.webmanifest",
  "opengraph-image.png",
  "robots.txt",
  "data/sage-public-simulation-v1.csv",
  "data/sage-public-simulation-v1.json",
  "data/SHA256SUMS.txt",
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

const home = read("index.html");
const simulation = read("simulation/index.html");
const privacy = read("privacy/index.html");
const robots = read("robots.txt");
const sitemap = read("sitemap.xml");
const llms = read("llms.txt");

assert(
  home.includes(`rel="canonical" href="${siteOrigin}/"`),
  "Homepage canonical does not match NEXT_PUBLIC_SITE_URL.",
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
  home.includes('http-equiv="Content-Security-Policy"'),
  "Content Security Policy meta tag is missing.",
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
  home.includes('href="/simulation/"') &&
    home.includes("120 simulated samples") &&
    home.includes("public-demo threshold"),
  "Homepage does not surface the concrete public simulation evidence.",
);
assert(
  simulation.includes("120 one-second SIMULATED") &&
    simulation.includes("Observed samples:") &&
    simulation.includes("0.85") &&
    simulation.includes("not SAGE production policy") &&
    simulation.includes("surface_roughness_ra_um") &&
    simulation.includes("null and unmeasured"),
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
  sitemap.includes(`<loc>${siteOrigin}/</loc>`) &&
    sitemap.includes(`<loc>${siteOrigin}/privacy/</loc>`) &&
    sitemap.includes(`<loc>${siteOrigin}/simulation/</loc>`),
  "sitemap.xml URLs do not match the canonical origin.",
);
assert(
  llms.includes(`Canonical site: ${siteOrigin}/`),
  "llms.txt canonical URL does not match the canonical origin.",
);
assert(
  llms.includes(`${siteOrigin}/simulation/`) &&
    llms.includes("120 one-second SIMULATED") &&
    llms.includes("zero observed samples"),
  "llms.txt does not describe the public simulation truth boundary.",
);
assert(
  !home.includes("\uFFFD") && !privacy.includes("\uFFFD"),
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
const simulationDocument = JSON.parse(simulationJsonText);
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
  simulation,
  privacy,
  robots,
  sitemap,
  llms,
  simulationJsonText,
  simulationCsvText,
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
];

for (const { label, pattern } of privateMarkerPatterns) {
  assert(
    !pattern.test(scannedText),
    `Potential proprietary or private marker found: ${label}.`,
  );
}

console.log(`Static SEO and security verification passed for ${siteOrigin}.`);
