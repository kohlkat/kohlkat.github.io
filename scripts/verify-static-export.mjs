import fs from "node:fs";
import path from "node:path";

const outputDirectory = path.resolve("out");
const configuredOrigin =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://kohlkat.github.io";
const siteOrigin = new URL(configuredOrigin).origin;
const requiredFiles = [
  "index.html",
  "privacy/index.html",
  "404.html",
  "icon.svg",
  "llms.txt",
  "manifest.webmanifest",
  "opengraph-image.png",
  "robots.txt",
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

for (const relativePath of requiredFiles) {
  assert(
    fs.existsSync(path.join(outputDirectory, relativePath)),
    `Missing static export asset: ${relativePath}`,
  );
}

const home = read("index.html");
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
  home.includes(`${siteOrigin}/opengraph-image.png`),
  "Open Graph image URL does not match the canonical origin.",
);
assert(
  robots.includes(`Sitemap: ${siteOrigin}/sitemap.xml`),
  "robots.txt sitemap URL does not match the canonical origin.",
);
assert(
  sitemap.includes(`<loc>${siteOrigin}/</loc>`) &&
    sitemap.includes(`<loc>${siteOrigin}/privacy/</loc>`),
  "sitemap.xml URLs do not match the canonical origin.",
);
assert(
  llms.includes(`Canonical site: ${siteOrigin}/`),
  "llms.txt canonical URL does not match the canonical origin.",
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
      javascript.includes("googletagmanager.com"),
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

const publicText = [home, privacy, robots, sitemap, llms].join("\n");
const secretPatterns = [
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /"client_secret"\s*:/i,
  /"refresh_token"\s*:/i,
  /AIza[0-9A-Za-z_-]{30,}/,
];

for (const pattern of secretPatterns) {
  assert(!pattern.test(publicText), `Potential secret matched ${pattern}.`);
}

console.log(`Static SEO and security verification passed for ${siteOrigin}.`);
