/**
 * Playwright check: robot mode parents the spindle under the wrist and
 * keeps a continuous arm→wrist→tool chain while the tip tracks the stock.
 */
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "playwright";
import fs from "node:fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sceneHtml = path.join(__dirname, "showcase-scene-v4.html");
const scratch =
  process.env.SHOWCASE_WORK_DIR ||
  path.join(__dirname, "..", ".showcase-v4-work");
const stillDir = path.join(scratch, "robot-chain-stills");

async function main() {
  fs.mkdirSync(stillDir, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const url =
    pathToFileURL(sceneHtml).href +
    "?mode=robot&shape=circle&seed=274503&progress=0&w=1280&h=720";
  await page.goto(url, { waitUntil: "networkidle", timeout: 180000 });
  await page.waitForFunction(() => window.__SAGE_SHOWCASE_READY__ === true, null, {
    timeout: 120000,
  });
  await page.evaluate(() => window.__SAGE_SET_JOB__("robot", "circle", 274503));

  const samples = [0.1, 0.35, 0.55, 0.75, 0.9];
  const metas = [];
  for (let i = 0; i < samples.length; i++) {
    const p = samples[i];
    await page.evaluate((prog) => window.__SAGE_SET_PROGRESS__(prog), p);
    const meta = await page.evaluate(() => window.__SAGE_SHOWCASE_META__);
    metas.push(meta);
    if (!meta.robotHoldsTool || meta.toolParent !== "wrist") {
      throw new Error(
        `progress=${p}: tool not under wrist (parent=${meta.toolParent}, holds=${meta.robotHoldsTool})`,
      );
    }
    if (!meta.chain?.includes("wrist") || !meta.chain?.includes("elbow")) {
      throw new Error(`progress=${p}: chain missing wrist/elbow: ${meta.chain}`);
    }
    // Tip world should be near commanded tip (within 12 cm — IK teaching accuracy)
    const err = Math.hypot(
      meta.tipWorld.x - meta.tip.x,
      meta.tipWorld.y - meta.tip.y,
      meta.tipWorld.z - meta.tip.z,
    );
    if (err > 0.12) {
      throw new Error(
        `progress=${p}: tip world error ${err.toFixed(3)} m (chain not reaching stock)`,
      );
    }
    const still = path.join(stillDir, `robot_chain_${String(i).padStart(2, "0")}.png`);
    await page.screenshot({ path: still, type: "png" });
  }
  await browser.close();
  const report = {
    status: "PASS",
    samples: metas.map((m) => ({
      progress: m.progress,
      toolParent: m.toolParent,
      robotHoldsTool: m.robotHoldsTool,
      chain: m.chain,
      tipErr: Math.hypot(
        m.tipWorld.x - m.tip.x,
        m.tipWorld.y - m.tip.y,
        m.tipWorld.z - m.tip.z,
      ),
    })),
    stills: stillDir,
  };
  fs.writeFileSync(
    path.join(stillDir, "robot-chain-report.json"),
    `${JSON.stringify(report, null, 2)}\n`,
  );
  console.log("robot-chain-v4 PASS", JSON.stringify(report.samples.map((s) => s.toolParent)));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
