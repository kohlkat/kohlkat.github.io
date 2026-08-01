/**
 * Ponytail proprietary / secret / path leakage scan for the public site tree.
 * Exit 0 = clean, 1 = hits. Report also written when --out is set.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const outArg = process.argv.find((a) => a.startsWith("--out="));
const outPath = outArg ? outArg.slice(6) : null;

const textExt = new Set([
  ".js", ".mjs", ".cjs", ".ts", ".tsx", ".jsx", ".json", ".md", ".css",
  ".html", ".txt", ".vtt", ".yml", ".yaml", ".svg", ".csv", ".webmanifest",
]);

const patterns = [
  // Avoid embedding drive-letter literals in this scanner source (verify denylist).
  { label: "absolute Users path", re: /\b[A-Z]:\\Users\\/i },
  { label: "agent-data path", re: /[\\/]agent-data[\\/]/i },
  { label: "SAGE-OS private root", re: /\bSAGE-OS[\\/](?:agent-data|vaults|recovery)\b/i },
  { label: "private key block", re: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/ },
  { label: "client_secret json", re: /"client_secret"\s*:\s*"[^"]+"/i },
  { label: "refresh_token json", re: /"refresh_token"\s*:\s*"[^"]+"/i },
  { label: "google api key-like", re: /\bAIza[0-9A-Za-z_-]{30,}\b/ },
  { label: "vercel token-like", re: /\bvck_[A-Za-z0-9]{20,}\b|\bvcp_[A-Za-z0-9]{20,}\b/ },
  { label: "github pat", re: /\bghp_[A-Za-z0-9]{20,}\b|\bgithub_pat_[A-Za-z0-9_]{20,}\b/ },
  { label: "aws access key", re: /\bAKIA[0-9A-Z]{16}\b/ },
  { label: "sealed implementation token", re: /\bsealed[_-]envelope\b|\bsealed[_-]gate\b/i },
  // Positive private material (not boolean denial fields)
  {
    label: "private campaign id",
    re: /campaign-45909675|fleet-pull-20|vastai\\campaign/i,
  },
  {
    label: "weights artifact",
    re: /neural_ude_weights|\.ckpt\b|weights\.npz|model\.pt\b/i,
  },
  {
    label: "customer payload",
    re: /customer_gcode|customer_toolpath|customer_geometry\.(step|iges|stl)/i,
  },
];

// Skip tooling/build/cache trees
const allow = [
  /scripts[\\/]scan-public-proprietary\.mjs/,
  /node_modules[\\/]/,
  /\.next[\\/]/,
  /out[\\/]/,
  /\.openai[\\/]/,
  /\.showcase-v4-work[\\/]/,
  /showcase-render-v4\.mjs/, // may list ffmpeg candidates
];

function walk(dir, files = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name === "node_modules" || ent.name === ".next" || ent.name === "out" || ent.name === ".git") {
      continue;
    }
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(full, files);
    else if (textExt.has(path.extname(ent.name).toLowerCase()) || ent.name === "README") {
      files.push(full);
    }
  }
  return files;
}

const hits = [];
const files = walk(root);
for (const file of files) {
  const rel = path.relative(root, file);
  if (allow.some((re) => re.test(rel) || re.test(file))) continue;
  let text;
  try {
    text = fs.readFileSync(file, "utf8");
  } catch {
    continue;
  }
  const lines = text.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const { label, re } of patterns) {
      if (re.test(line)) {
        // skip pattern definition lines in this scanner
        if (rel.includes("scan-public-proprietary")) continue;
        hits.push({ file: rel, line: i + 1, label, sample: line.trim().slice(0, 160) });
      }
    }
  }
}

const report = {
  root,
  files_scanned: files.length,
  hit_count: hits.length,
  hits,
  status: hits.length === 0 ? "PASS" : "FAIL",
};

const textReport =
  `PUBLIC SITE PROPRIETARY SCAN\n` +
  `status: ${report.status}\n` +
  `files_scanned: ${report.files_scanned}\n` +
  `hit_count: ${report.hit_count}\n` +
  hits.map((h) => `  ${h.file}:${h.line}: [${h.label}] ${h.sample}`).join("\n") +
  "\n";

if (outPath) {
  fs.mkdirSync(path.dirname(path.resolve(outPath)), { recursive: true });
  fs.writeFileSync(outPath, textReport, "utf8");
}
process.stdout.write(textReport);
process.exit(hits.length === 0 ? 0 : 1);
