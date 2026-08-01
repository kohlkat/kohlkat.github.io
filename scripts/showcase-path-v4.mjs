/**
 * Pure path / tip geometry for public showcase clips (no Isaac dependency).
 * Shared by unit checks and the WebGL showcase renderer.
 */
import path from "node:path";
import { pathToFileURL } from "node:url";

export const SHAPES = ["circle", "rounded_rectangle", "slot"];

export function pathPoint(shape, progress, halfExtents, offset = [0, 0]) {
  const [halfX, halfY] = halfExtents;
  const [ox, oy] = offset;
  const phase = 2 * Math.PI * (progress % 1);
  if (shape === "circle") {
    return [ox + halfX * Math.cos(phase), oy + halfY * Math.sin(phase)];
  }
  if (shape === "rounded_rectangle") {
    // Continuous superellipse (n=4) — matches showcase-scene-v4.html
    const n = 4;
    const c = Math.cos(phase), s = Math.sin(phase);
    const ax = Math.pow(Math.abs(c), 2 / n) * Math.sign(c || 1);
    const ay = Math.pow(Math.abs(s), 2 / n) * Math.sign(s || 1);
    return [ox + halfX * ax, oy + halfY * ay];
  }
  // slot: elongated ellipse
  return [ox + halfX * Math.cos(phase), oy + halfY * Math.sin(phase)];
}

export function toolTip(shape, progress, stockCenter, stockTopZ, pathHalf, pathOffset, targetDepth) {
  const [lx, ly] = pathPoint(shape, progress, pathHalf, pathOffset);
  const plunge = Math.min(progress / 0.12, 1);
  return {
    x: stockCenter[0] + lx,
    y: stockCenter[1] + ly,
    z: stockTopZ - targetDepth * plunge + 0.001,
  };
}

export function sceneFor(shape, seed) {
  // Deterministic LCG-ish from seed
  let s = (seed * 1103515245 + 12345) >>> 0;
  const rnd = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
  const stock = [
    0.28 + rnd() * 0.08,
    0.2 + rnd() * 0.07,
    0.05 + rnd() * 0.03,
  ];
  let pathHalf;
  if (shape === "circle") {
    const r = Math.min(stock[0], stock[1]) * (0.22 + rnd() * 0.1);
    pathHalf = [r, r];
  } else if (shape === "rounded_rectangle") {
    pathHalf = [stock[0] * (0.22 + rnd() * 0.08), stock[1] * (0.2 + rnd() * 0.08)];
  } else {
    pathHalf = [stock[0] * (0.26 + rnd() * 0.08), stock[1] * (0.1 + rnd() * 0.05)];
  }
  const depth = 0.006 + rnd() * 0.006;
  return {
    shape,
    seed,
    stock,
    pathHalf,
    pathOffset: [0, 0],
    targetDepth: depth,
    metal: shape === "circle" ? 0x6e7a86 : shape === "slot" ? 0x7a6a52 : 0x4a5560,
  };
}

/**
 * Analytic 2-link IK (mirrors showcase-scene-v4.html armIk).
 * tip args are Three.js world (x, height y, z).
 */
export function armIk(tipX, tipY, tipZ, opts = {}) {
  const L1 = opts.L1 ?? 0.55;
  const L2 = opts.L2 ?? 0.48;
  const tipOffset = opts.tipOffset ?? 0.22;
  const baseX = opts.baseX ?? -0.12;
  const baseZ = opts.baseZ ?? 0.0;
  const shoulderY = opts.shoulderY ?? 0.88;
  const dx = tipX - baseX;
  const dz = tipZ - baseZ;
  const yaw = Math.atan2(dx, dz);
  const wy = tipY + tipOffset;
  const planar = Math.hypot(dx, dz);
  const dy = wy - shoulderY;
  let dist = Math.hypot(planar, dy);
  const maxR = L1 + L2 - 0.01;
  const minR = Math.abs(L1 - L2) + 0.01;
  dist = Math.max(minR, Math.min(maxR, dist));
  const cosElbow = (L1 * L1 + L2 * L2 - dist * dist) / (2 * L1 * L2);
  const elbowInterior = Math.acos(Math.max(-1, Math.min(1, cosElbow)));
  const elbow = Math.PI - elbowInterior;
  const cosShoulder = (dist * dist + L1 * L1 - L2 * L2) / (2 * dist * L1);
  const alpha = Math.acos(Math.max(-1, Math.min(1, cosShoulder)));
  const line = Math.atan2(planar, dy);
  const shoulder = line - alpha;
  return { yaw, shoulder, elbow };
}

/**
 * toolTip uses {x, y path-plane, z height}. Three.js world is (x, height, pathY).
 * armIk(worldX, worldY_height, worldZ) maps as armIk(t.x, t.z, t.y).
 */
export function selfCheck() {
  const scene = sceneFor("circle", 274503);
  const stockCenter = [0.35, 0, 0];
  const stockTopZ = 0.92 + scene.stock[2] / 2 + 0.002;
  const a = toolTip("circle", 0, stockCenter, stockTopZ, scene.pathHalf, scene.pathOffset, scene.targetDepth);
  const b = toolTip("circle", 0.25, stockCenter, stockTopZ, scene.pathHalf, scene.pathOffset, scene.targetDepth);
  const c = toolTip("circle", 1, stockCenter, stockTopZ, scene.pathHalf, scene.pathOffset, scene.targetDepth);
  if (!(a.z > c.z)) throw new Error("tool tip does not plunge");
  if (Math.hypot(b.x - a.x, b.y - a.y) < 0.01) throw new Error("tool tip does not travel path");
  // Map path tip → Three.js world for IK
  const ikA = armIk(a.x, a.z, a.y);
  const ikB = armIk(b.x, b.z, b.y);
  if (![ikA.yaw, ikA.shoulder, ikA.elbow, ikB.yaw, ikB.shoulder, ikB.elbow].every(Number.isFinite)) {
    throw new Error("arm IK produced non-finite joints");
  }
  // p=0 vs p=0.25 moves path Y → world Z → yaw must change
  if (Math.abs(ikA.yaw - ikB.yaw) < 1e-4) {
    throw new Error("arm IK yaw did not track path motion");
  }
  return "showcase-path-v4 self-check OK";
}

const isDirectRun =
  process.argv[1] &&
  pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;
if (isDirectRun) {
  console.log(selfCheck());
}
