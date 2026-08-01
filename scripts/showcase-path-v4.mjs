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
    // Stadium-ish rounded rectangle perimeter (parameterized by angle).
    const ax = halfX * Math.sign(Math.cos(phase)) || halfX;
    const ay = halfY * Math.sign(Math.sin(phase)) || halfY;
    const cx = Math.abs(Math.cos(phase));
    const sy = Math.abs(Math.sin(phase));
    const rx = halfX * 0.55;
    const ry = halfY * 0.55;
    if (cx * halfY > sy * halfX) {
      return [ox + ax, oy + Math.sin(phase) * ry];
    }
    return [ox + Math.cos(phase) * rx, oy + ay];
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

/** Self-check: fails process if tip does not plunge / move along path. */
export function selfCheck() {
  const scene = sceneFor("circle", 274503);
  const stockCenter = [0, 0, scene.stock[2] / 2];
  const stockTopZ = scene.stock[2];
  const a = toolTip("circle", 0, stockCenter, stockTopZ, scene.pathHalf, scene.pathOffset, scene.targetDepth);
  const b = toolTip("circle", 0.5, stockCenter, stockTopZ, scene.pathHalf, scene.pathOffset, scene.targetDepth);
  const c = toolTip("circle", 1, stockCenter, stockTopZ, scene.pathHalf, scene.pathOffset, scene.targetDepth);
  if (!(a.z > c.z)) throw new Error("tool tip does not plunge");
  if (Math.hypot(b.x - a.x, b.y - a.y) < 0.01) throw new Error("tool tip does not travel path");
  return "showcase-path-v4 self-check OK";
}

const isDirectRun =
  process.argv[1] &&
  pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;
if (isDirectRun) {
  console.log(selfCheck());
}
