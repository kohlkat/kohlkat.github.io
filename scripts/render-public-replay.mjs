import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import {
  REPLAY_DURATION_SECONDS,
  buildMediaReadme,
  buildPublicUsdScene,
  buildReplayCaptions,
  buildReplayManifest,
  publicReplayScene,
  readFragmentedMp4DurationSeconds,
  sha256,
} from "./public-replay-scene.mjs";

const mediaDirectory = path.resolve("public", "media");
const qaDirectory = path.resolve("replay-qa");
const renderQaFrames = process.argv.includes("--qa");
const checkOnly = process.argv.includes("--check");
const filePaths = {
  video: path.join(mediaDirectory, "sage-simulation-replay-v2.mp4"),
  poster: path.join(mediaDirectory, "sage-simulation-replay-poster-v2.jpg"),
  captions: path.join(
    mediaDirectory,
    "sage-simulation-replay-captions-v2.vtt",
  ),
  usd: path.join(mediaDirectory, "sage-public-teaching-scene-v2.usda"),
  manifest: path.join(
    mediaDirectory,
    "sage-simulation-replay-manifest-v2.json",
  ),
  readme: path.join(mediaDirectory, "README.md"),
};
const retiredFilePaths = [
  path.join(mediaDirectory, "sage-simulation-replay-v1.mp4"),
  path.join(mediaDirectory, "sage-simulation-replay-poster-v1.jpg"),
  path.join(mediaDirectory, "sage-simulation-replay-captions-v1.vtt"),
];

function findChrome() {
  const windowsProgramRoots = [
    process.env.ProgramFiles,
    process.env["ProgramFiles(x86)"],
  ].filter(Boolean);
  const windowsCandidates = windowsProgramRoots.flatMap((root) => [
    path.join(root, "Google", "Chrome", "Application", "chrome.exe"),
    path.join(root, "Microsoft", "Edge", "Application", "msedge.exe"),
  ]);
  if (process.env.LOCALAPPDATA) {
    windowsCandidates.push(
      path.join(
        process.env.LOCALAPPDATA,
        "Google",
        "Chrome",
        "Application",
        "chrome.exe",
      ),
    );
  }
  const candidates = [
    process.env.CHROME_PATH,
    ...windowsCandidates,
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  ].filter(Boolean);

  return candidates.find((candidate) => fs.existsSync(candidate));
}

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
  const usdText = fs.readFileSync(filePaths.usd, "utf8");
  const manifest = JSON.parse(fs.readFileSync(filePaths.manifest, "utf8"));

  assert(
    videoBytes.length >= 100_000 && videoBytes.length <= 5_000_000,
    "Replay MP4 must remain between 100 KB and 5 MB.",
  );
  assert.equal(
    videoBytes.subarray(4, 8).toString("ascii"),
    "ftyp",
    "Replay video is not an MP4 container.",
  );
  assert(
    !videoBytes.includes(Buffer.from("soun")),
    "Replay video unexpectedly contains an audio track.",
  );
  const encodedDuration = readFragmentedMp4DurationSeconds(videoBytes);
  assert(
    encodedDuration >= 17.8 && encodedDuration <= 18.2,
    `Replay MP4 duration must remain 18 seconds; found ${encodedDuration.toFixed(3)}.`,
  );
  assert.deepEqual(
    [...posterBytes.subarray(0, 2)],
    [0xff, 0xd8],
    "Replay poster is not a JPEG.",
  );
  assert.deepEqual(
    [...posterBytes.subarray(-2)],
    [0xff, 0xd9],
    "Replay poster JPEG is incomplete.",
  );
  assert(
    !posterBytes.includes(Buffer.from("Exif")),
    "Replay poster unexpectedly contains EXIF metadata.",
  );
  assert.equal(
    manifest.schema_version,
    "sage-public-teaching-replay/v2",
    "Replay manifest schema is invalid.",
  );
  assert.equal(manifest.evidence_class, "SIMULATED");
  assert.equal(manifest.authority, "shadow_only_non_actuating");
  assert.equal(manifest.render_kind, "public_teaching_reconstruction");
  assert.equal(manifest.campaign_relationship.raw_campaign_capture, false);
  assert.equal(manifest.campaign_relationship.raw_campaign_geometry, false);
  assert.equal(
    manifest.campaign_relationship.physical_machine_recording,
    false,
  );
  assert.equal(manifest.files.video.sha256, sha256(videoBytes));
  assert.equal(manifest.files.poster.sha256, sha256(posterBytes));
  assert.equal(manifest.files.captions.sha256, sha256(captionsText));
  assert.equal(manifest.files.usd_scene.sha256, sha256(usdText));
  assert(
    captionsText.includes("CNC surrogate-training path") &&
      captionsText.includes("ROS shadow-optimization path") &&
      captionsText.includes("Physical gate closed"),
    "Replay captions are missing the two-path or authority boundary.",
  );
  assert(
    usdText.startsWith("#usda 1.0") &&
      usdText.includes('string evidenceClass = "SIMULATED"') &&
      usdText.includes('string provenance = "public_teaching_reconstruction"') &&
      usdText.includes('sage:learningPath = "surrogate_training_path"') &&
      usdText.includes('sage:learningPath = "shadow_optimization_path"') &&
      usdText.includes('string sourceBoundary = "not_raw_campaign_geometry"'),
    "Public USD scene is missing its evidence or provenance boundary.",
  );

  console.log(
    `Replay verification passed: ${videoBytes.length.toLocaleString()} byte MP4, ` +
      `${posterBytes.length.toLocaleString()} byte poster.`,
  );
}

function collectRequestBody(request, maximumBytes = 6_000_000) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let totalBytes = 0;

    request.on("data", (chunk) => {
      totalBytes += chunk.length;
      if (totalBytes > maximumBytes) {
        reject(new Error("Browser artifact exceeded the six-megabyte limit."));
        request.destroy();
        return;
      }
      chunks.push(chunk);
    });
    request.on("end", () => resolve(Buffer.concat(chunks)));
    request.on("error", reject);
  });
}

function buildRendererHtml() {
  const sceneJson = JSON.stringify(publicReplayScene).replaceAll("<", "\\u003c");

  return String.raw`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>SAGE public simulation replay renderer</title>
    <style>
      html, body { width: 100%; height: 100%; margin: 0; overflow: hidden; background: #051013; }
      body { display: grid; place-items: center; }
      canvas { width: 1280px; height: 720px; display: block; }
    </style>
  </head>
  <body>
    <canvas width="1280" height="720" aria-label="SAGE public simulation teaching replay"></canvas>
    <script>
      "use strict";

      const scene = __SCENE_JSON__;
      const canvas = document.querySelector("canvas");
      const context = canvas.getContext("2d", { alpha: false });
      const width = canvas.width;
      const height = canvas.height;
      const tau = Math.PI * 2;
      const palette = {
        background: "#051013",
        panel: "#0a1c21",
        panelStrong: "#0d252c",
        line: "rgba(129, 176, 188, 0.24)",
        cyan: "#19d7d0",
        cyanSoft: "#7de8e1",
        lime: "#b9f25d",
        amber: "#ffc766",
        white: "#f4f8f7",
        slate: "#94aeb5",
        metalTop: "#6d8991",
        metalSide: "#354f57",
        metalDark: "#172f36",
        orange: "#f28a31",
        orangeLight: "#ffb15d",
      };

      function clamp(value, minimum, maximum) {
        return Math.min(Math.max(value, minimum), maximum);
      }

      function mix(start, end, amount) {
        return start + (end - start) * amount;
      }

      function smoothstep(start, end, value) {
        const normalized = clamp((value - start) / (end - start), 0, 1);
        return normalized * normalized * (3 - 2 * normalized);
      }

      function hashNoise(value) {
        return Math.abs(Math.sin(value * 12.9898 + 78.233) * 43758.5453) % 1;
      }

      function roundedRectangle(x, y, boxWidth, boxHeight, radius) {
        const resolvedRadius = Math.min(radius, boxWidth / 2, boxHeight / 2);
        context.beginPath();
        context.moveTo(x + resolvedRadius, y);
        context.arcTo(x + boxWidth, y, x + boxWidth, y + boxHeight, resolvedRadius);
        context.arcTo(
          x + boxWidth,
          y + boxHeight,
          x,
          y + boxHeight,
          resolvedRadius,
        );
        context.arcTo(x, y + boxHeight, x, y, resolvedRadius);
        context.arcTo(x, y, x + boxWidth, y, resolvedRadius);
        context.closePath();
      }

      function writeText(text, x, y, size, color, weight, align) {
        context.save();
        context.fillStyle = color || palette.white;
        context.font =
          String(weight || 600) + " " + String(size || 16) + "px Arial, sans-serif";
        context.textAlign = align || "left";
        context.textBaseline = "alphabetic";
        context.fillText(text, x, y);
        context.restore();
      }

      function writeTracking(text, x, y, size, color, spacing, align) {
        context.save();
        context.fillStyle = color || palette.white;
        context.font = "700 " + String(size || 11) + "px Arial, sans-serif";
        context.textBaseline = "alphabetic";
        const characters = String(text).toUpperCase().split("");
        const widths = characters.map((character) => context.measureText(character).width);
        const total =
          widths.reduce((sum, characterWidth) => sum + characterWidth, 0) +
          Math.max(0, characters.length - 1) * (spacing || 1.4);
        let cursor =
          align === "center" ? x - total / 2 : align === "right" ? x - total : x;

        for (let index = 0; index < characters.length; index += 1) {
          context.fillText(characters[index], cursor, y);
          cursor += widths[index] + (spacing || 1.4);
        }
        context.restore();
      }

      function pill(text, x, y, options) {
        const settings = options || {};
        const boxWidth = settings.width || 164;
        const boxHeight = settings.height || 30;
        context.save();
        roundedRectangle(x, y, boxWidth, boxHeight, boxHeight / 2);
        context.fillStyle = settings.fill || "rgba(5, 16, 19, 0.76)";
        context.fill();
        context.strokeStyle = settings.stroke || palette.line;
        context.lineWidth = 1;
        context.stroke();
        writeTracking(
          text,
          x + boxWidth / 2,
          y + boxHeight / 2 + 4,
          settings.size || 9,
          settings.color || palette.cyanSoft,
          1.2,
          "center",
        );
        context.restore();
      }

      function makeView(originX, originY, scale) {
        return { originX: originX, originY: originY, scale: scale };
      }

      function project(point, view) {
        const x = point[0];
        const y = point[1];
        const z = point[2] || 0;
        return {
          x: view.originX + (x - y) * 0.8660254 * view.scale,
          y:
            view.originY +
            (x + y) * 0.5 * view.scale -
            z * 0.92 * view.scale,
        };
      }

      function pathFromProjected(points) {
        context.beginPath();
        points.forEach((point, index) => {
          if (index === 0) context.moveTo(point.x, point.y);
          else context.lineTo(point.x, point.y);
        });
        context.closePath();
      }

      function drawPrism(polygon, bottomZ, topZ, view, colors) {
        const lower = polygon.map((point) => project([point[0], point[1], bottomZ], view));
        const upper = polygon.map((point) => project([point[0], point[1], topZ], view));
        const faces = polygon.map((_, index) => {
          const next = (index + 1) % polygon.length;
          const points = [lower[index], lower[next], upper[next], upper[index]];
          return {
            points: points,
            depth: points.reduce((sum, point) => sum + point.y, 0) / points.length,
            index: index,
          };
        });

        context.save();
        faces
          .sort((left, right) => left.depth - right.depth)
          .forEach((face) => {
            pathFromProjected(face.points);
            context.fillStyle =
              face.index % 2 === 0 ? colors.side : colors.sideDark;
            context.fill();
            context.strokeStyle = colors.stroke;
            context.lineWidth = 1;
            context.stroke();
          });
        pathFromProjected(upper);
        const topGradient = context.createLinearGradient(
          upper[0].x,
          upper[0].y,
          upper[Math.floor(upper.length / 2)].x,
          upper[Math.floor(upper.length / 2)].y,
        );
        topGradient.addColorStop(0, colors.top);
        topGradient.addColorStop(1, colors.topEnd);
        context.fillStyle = topGradient;
        context.fill();
        context.strokeStyle = colors.stroke;
        context.lineWidth = 1.3;
        context.stroke();
        context.restore();
      }

      function drawLine3d(start, end, view, color, lineWidth, alpha) {
        const projectedStart = project(start, view);
        const projectedEnd = project(end, view);
        context.save();
        context.globalAlpha = alpha === undefined ? 1 : alpha;
        context.beginPath();
        context.moveTo(projectedStart.x, projectedStart.y);
        context.lineTo(projectedEnd.x, projectedEnd.y);
        context.strokeStyle = color;
        context.lineWidth = lineWidth;
        context.lineCap = "round";
        context.stroke();
        context.restore();
      }

      function drawFloorGrid(view, extent) {
        context.save();
        context.strokeStyle = "rgba(89, 142, 154, 0.13)";
        context.lineWidth = 1;
        for (let value = -extent; value <= extent; value += 20) {
          const firstX = project([value, -extent, -16], view);
          const secondX = project([value, extent, -16], view);
          context.beginPath();
          context.moveTo(firstX.x, firstX.y);
          context.lineTo(secondX.x, secondX.y);
          context.stroke();

          const firstY = project([-extent, value, -16], view);
          const secondY = project([extent, value, -16], view);
          context.beginPath();
          context.moveTo(firstY.x, firstY.y);
          context.lineTo(secondY.x, secondY.y);
          context.stroke();
        }
        context.restore();
      }

      function featureCenter(feature) {
        return feature.center || [0, 0];
      }

      function scaledCurve(feature, factor) {
        const center = featureCenter(feature);
        return feature.curve.map((point) => [
          center[0] + (point[0] - center[0]) * factor,
          center[1] + (point[1] - center[1]) * factor,
        ]);
      }

      function distance(first, second) {
        return Math.hypot(second[0] - first[0], second[1] - first[1]);
      }

      function buildProgram(cell) {
        const segments = [];
        let priorEnd = null;

        cell.features.forEach((feature, featureIndex) => {
          const factors =
            feature.kind === "circle_pocket"
              ? [1, 0.78, 0.56, 0.34]
              : [1, 0.82, 0.64, 0.46, 0.29];

          factors.forEach((factor, passIndex) => {
            const curve = scaledCurve(feature, factor);
            const firstPoint = curve[0];
            if (priorEnd) {
              segments.push({
                points: [priorEnd, firstPoint],
                cut: false,
                featureIndex: featureIndex,
                passIndex: passIndex,
              });
            }
            const closedCurve = curve.concat([curve[0]]);
            segments.push({
              points: closedCurve,
              cut: true,
              featureIndex: featureIndex,
              passIndex: passIndex,
            });
            priorEnd = closedCurve[closedCurve.length - 1];
          });
        });

        let totalLength = 0;
        segments.forEach((segment) => {
          segment.length = segment.points.slice(1).reduce((sum, point, index) => {
            return sum + distance(segment.points[index], point);
          }, 0);
          segment.startLength = totalLength;
          totalLength += segment.length;
          segment.endLength = totalLength;
        });

        return { segments: segments, totalLength: totalLength };
      }

      scene.cells.forEach((cell) => {
        cell.program = buildProgram(cell);
      });

      function partialPolyline(points, fraction) {
        if (fraction <= 0) return [points[0]];
        if (fraction >= 1) return points;
        const lengths = points.slice(1).map((point, index) => distance(points[index], point));
        const totalLength = lengths.reduce((sum, value) => sum + value, 0);
        const targetLength = totalLength * fraction;
        const partial = [points[0]];
        let covered = 0;

        for (let index = 0; index < lengths.length; index += 1) {
          const segmentLength = lengths[index];
          if (covered + segmentLength <= targetLength) {
            partial.push(points[index + 1]);
            covered += segmentLength;
            continue;
          }
          const amount = clamp((targetLength - covered) / segmentLength, 0, 1);
          partial.push([
            mix(points[index][0], points[index + 1][0], amount),
            mix(points[index][1], points[index + 1][1], amount),
          ]);
          break;
        }
        return partial;
      }

      function sampleProgram(program, progress) {
        const targetLength = clamp(progress, 0, 1) * program.totalLength;
        const segment =
          program.segments.find(
            (candidate) =>
              targetLength >= candidate.startLength &&
              targetLength <= candidate.endLength,
          ) || program.segments[program.segments.length - 1];
        const local =
          segment.length === 0
            ? 1
            : clamp(
                (targetLength - segment.startLength) / segment.length,
                0,
                1,
              );
        const partial = partialPolyline(segment.points, local);

        return {
          point: partial[partial.length - 1],
          cutting: segment.cut,
          featureIndex: segment.featureIndex,
        };
      }

      function strokeWorldPolyline(points, z, view, color, lineWidth, dash, alpha) {
        if (!points || points.length < 2) return;
        context.save();
        context.globalAlpha = alpha === undefined ? 1 : alpha;
        context.beginPath();
        points.forEach((point, index) => {
          const projected = project([point[0], point[1], z], view);
          if (index === 0) context.moveTo(projected.x, projected.y);
          else context.lineTo(projected.x, projected.y);
        });
        context.strokeStyle = color;
        context.lineWidth = lineWidth;
        context.lineJoin = "round";
        context.lineCap = "round";
        context.setLineDash(dash || []);
        context.stroke();
        context.restore();
      }

      function drawFeatureFaces(cell, progress, view) {
        const z = cell.stock.depth + 0.35;
        cell.features.forEach((feature, index) => {
          const start = index / cell.features.length;
          const end = (index + 1) / cell.features.length;
          const localProgress = smoothstep(start, end, progress);
          const projected = feature.curve.map((point) =>
            project([point[0], point[1], z], view),
          );
          context.save();
          pathFromProjected(projected);
          context.fillStyle =
            "rgba(7, 24, 29, " + String(0.12 + localProgress * 0.58) + ")";
          context.fill();
          context.strokeStyle = "rgba(125, 232, 225, 0.42)";
          context.lineWidth = Math.max(0.8, view.scale * 0.9);
          context.setLineDash([5, 5]);
          context.stroke();
          context.restore();
        });
      }

      function drawProgram(cell, progress, view) {
        const program = cell.program;
        const targetLength = clamp(progress, 0, 1) * program.totalLength;
        const z = cell.stock.depth + 0.7;

        program.segments.forEach((segment) => {
          if (!segment.cut) {
            strokeWorldPolyline(
              segment.points,
              z + 8,
              view,
              palette.amber,
              Math.max(1, view.scale),
              [4, 7],
              0.28,
            );
            return;
          }
          strokeWorldPolyline(
            segment.points,
            z,
            view,
            palette.cyan,
            Math.max(0.8, view.scale * 0.8),
            [3, 6],
            0.24,
          );

          if (targetLength <= segment.startLength) return;
          const completedFraction =
            targetLength >= segment.endLength
              ? 1
              : (targetLength - segment.startLength) / segment.length;
          const completed = partialPolyline(segment.points, completedFraction);
          strokeWorldPolyline(
            completed,
            z,
            view,
            "rgba(4, 18, 22, 0.82)",
            Math.max(3.5, view.scale * 4.5),
            [],
            1,
          );
          strokeWorldPolyline(
            completed,
            z + 0.2,
            view,
            palette.lime,
            Math.max(1.1, view.scale * 1.15),
            [],
            0.92,
          );
        });
      }

      function drawChips(toolPoint, time, view, active, tint) {
        if (!active) return;
        const projected = project([toolPoint[0], toolPoint[1], 24], view);
        context.save();
        for (let index = 0; index < 16; index += 1) {
          const phase = time * (1.8 + hashNoise(index) * 2.4) + index * 0.7;
          const radius = 9 + hashNoise(index + 20) * 30 * view.scale;
          const x = projected.x + Math.cos(phase) * radius;
          const y =
            projected.y -
            Math.abs(Math.sin(phase * 0.83)) * radius * 0.75 -
            hashNoise(index + 40) * 10;
          context.fillStyle =
            index % 3 === 0 ? palette.amber : tint || palette.cyanSoft;
          context.globalAlpha = 0.18 + hashNoise(index + 60) * 0.55;
          context.fillRect(
            x,
            y,
            Math.max(1, view.scale * 1.4),
            Math.max(1, view.scale * 0.7),
          );
        }
        context.restore();
      }

      function drawMachineFrame(view) {
        const frameColor = "rgba(111, 157, 168, 0.42)";
        const strong = "rgba(125, 179, 190, 0.62)";
        drawLine3d([-102, -74, -2], [-102, -74, 92], view, frameColor, 6, 1);
        drawLine3d([102, -74, -2], [102, -74, 92], view, frameColor, 6, 1);
        drawLine3d([-102, -74, 92], [102, -74, 92], view, strong, 8, 1);
        drawLine3d([-102, -74, 72], [102, -74, 72], view, frameColor, 3, 1);
        drawLine3d([-112, -86, -12], [112, -86, -12], view, frameColor, 2, 0.6);
      }

      function drawCncSpindle(toolPoint, view, progress) {
        const tip = project(
          [toolPoint[0], toolPoint[1], scene.cells[0].stock.depth + 2],
          view,
        );
        const bodyTop = project([toolPoint[0], toolPoint[1], 94], view);
        const bodyBottom = project([toolPoint[0], toolPoint[1], 43], view);
        const bodyWidth = Math.max(12, view.scale * 18);

        context.save();
        const glow = context.createRadialGradient(
          tip.x,
          tip.y,
          0,
          tip.x,
          tip.y,
          34 * view.scale,
        );
        glow.addColorStop(0, "rgba(185, 242, 93, 0.46)");
        glow.addColorStop(1, "rgba(25, 215, 208, 0)");
        context.fillStyle = glow;
        context.beginPath();
        context.arc(tip.x, tip.y, 34 * view.scale, 0, tau);
        context.fill();

        roundedRectangle(
          bodyTop.x - bodyWidth / 2,
          bodyTop.y,
          bodyWidth,
          bodyBottom.y - bodyTop.y,
          bodyWidth * 0.18,
        );
        const spindleGradient = context.createLinearGradient(
          bodyTop.x - bodyWidth / 2,
          0,
          bodyTop.x + bodyWidth / 2,
          0,
        );
        spindleGradient.addColorStop(0, "#38525a");
        spindleGradient.addColorStop(0.5, "#a7bbc0");
        spindleGradient.addColorStop(1, "#263f47");
        context.fillStyle = spindleGradient;
        context.fill();
        context.strokeStyle = "rgba(204, 229, 233, 0.42)";
        context.lineWidth = 1;
        context.stroke();

        context.beginPath();
        context.moveTo(bodyBottom.x - bodyWidth * 0.2, bodyBottom.y);
        context.lineTo(tip.x - 2, tip.y);
        context.lineTo(tip.x + 2, tip.y);
        context.lineTo(bodyBottom.x + bodyWidth * 0.2, bodyBottom.y);
        context.closePath();
        context.fillStyle = "#bac9cc";
        context.fill();

        context.beginPath();
        context.ellipse(
          bodyBottom.x,
          bodyBottom.y - 4,
          bodyWidth * (0.54 + Math.sin(progress * tau * 16) * 0.06),
          bodyWidth * 0.13,
          0,
          0,
          tau,
        );
        context.strokeStyle = palette.cyan;
        context.globalAlpha = 0.65;
        context.lineWidth = 1.4;
        context.setLineDash([4, 4]);
        context.stroke();
        context.restore();
      }

      function drawArmSegment(start, end, outerWidth, innerWidth) {
        context.save();
        context.lineCap = "round";
        context.beginPath();
        context.moveTo(start.x, start.y);
        context.lineTo(end.x, end.y);
        context.strokeStyle = "#1a292d";
        context.lineWidth = outerWidth;
        context.stroke();
        context.beginPath();
        context.moveTo(start.x, start.y);
        context.lineTo(end.x, end.y);
        const gradient = context.createLinearGradient(start.x, start.y, end.x, end.y);
        gradient.addColorStop(0, palette.orange);
        gradient.addColorStop(0.52, palette.orangeLight);
        gradient.addColorStop(1, "#c9631d");
        context.strokeStyle = gradient;
        context.lineWidth = innerWidth;
        context.stroke();
        context.restore();
      }

      function drawRobotJoint(point, radius) {
        context.save();
        context.beginPath();
        context.arc(point.x, point.y, radius, 0, tau);
        context.fillStyle = "#12262c";
        context.fill();
        context.strokeStyle = palette.orangeLight;
        context.lineWidth = Math.max(2, radius * 0.18);
        context.stroke();
        context.beginPath();
        context.arc(point.x, point.y, radius * 0.34, 0, tau);
        context.fillStyle = "#6d8991";
        context.fill();
        context.restore();
      }

      function drawIndustrialRobot(toolPoint, view, progress, time) {
        const target = project(
          [toolPoint[0], toolPoint[1], scene.cells[1].stock.depth + 1],
          view,
        );
        const baseWorld = [92, -74, -3];
        const base = project(baseWorld, view);
        const scale = view.scale;
        const shoulder = {
          x: base.x - 5 * scale,
          y: base.y - 72 * scale,
        };
        const wrist = {
          x: target.x + 5 * Math.sin(progress * tau * 1.3) * scale,
          y: target.y - 52 * scale,
        };
        const upperLength = 86 * scale;
        const lowerLength = 78 * scale;
        const deltaX = wrist.x - shoulder.x;
        const deltaY = wrist.y - shoulder.y;
        const rawDistance = Math.hypot(deltaX, deltaY);
        const resolvedDistance = clamp(
          rawDistance,
          Math.abs(upperLength - lowerLength) + 1,
          upperLength + lowerLength - 1,
        );
        const direction = Math.atan2(deltaY, deltaX);
        const shoulderOffset = Math.acos(
          clamp(
            (upperLength * upperLength +
              resolvedDistance * resolvedDistance -
              lowerLength * lowerLength) /
              (2 * upperLength * resolvedDistance),
            -1,
            1,
          ),
        );
        const elbowAngle = direction - shoulderOffset;
        const elbow = {
          x: shoulder.x + Math.cos(elbowAngle) * upperLength,
          y: shoulder.y + Math.sin(elbowAngle) * upperLength,
        };
        const forearmMid = {
          x: mix(elbow.x, wrist.x, 0.62),
          y: mix(elbow.y, wrist.y, 0.62) - 8 * scale,
        };

        context.save();
        const pedestalWidth = 48 * scale;
        const pedestalHeight = 34 * scale;
        roundedRectangle(
          base.x - pedestalWidth / 2,
          base.y - pedestalHeight,
          pedestalWidth,
          pedestalHeight,
          8 * scale,
        );
        context.fillStyle = "#263d44";
        context.fill();
        context.strokeStyle = "rgba(202, 225, 230, 0.35)";
        context.lineWidth = 1.2;
        context.stroke();
        context.beginPath();
        context.ellipse(
          base.x,
          base.y - pedestalHeight,
          28 * scale,
          10 * scale,
          0,
          0,
          tau,
        );
        context.fillStyle = palette.orange;
        context.fill();
        context.strokeStyle = "#17272c";
        context.lineWidth = 4 * scale;
        context.stroke();

        drawArmSegment(
          { x: base.x, y: base.y - pedestalHeight },
          shoulder,
          34 * scale,
          25 * scale,
        );
        drawArmSegment(shoulder, elbow, 31 * scale, 23 * scale);
        drawArmSegment(elbow, forearmMid, 27 * scale, 19 * scale);
        drawArmSegment(forearmMid, wrist, 22 * scale, 15 * scale);
        drawRobotJoint(shoulder, 16 * scale);
        drawRobotJoint(elbow, 14 * scale);
        drawRobotJoint(forearmMid, 10 * scale);
        drawRobotJoint(wrist, 8 * scale);

        context.beginPath();
        context.moveTo(wrist.x, wrist.y);
        context.lineTo(target.x, target.y);
        context.strokeStyle = "#bbc9cc";
        context.lineWidth = Math.max(3, 6 * scale);
        context.lineCap = "round";
        context.stroke();
        context.beginPath();
        context.arc(target.x, target.y, 5 * scale, 0, tau);
        context.fillStyle = palette.lime;
        context.fill();

        const glow = context.createRadialGradient(
          target.x,
          target.y,
          0,
          target.x,
          target.y,
          28 * scale,
        );
        glow.addColorStop(0, "rgba(185, 242, 93, 0.42)");
        glow.addColorStop(1, "rgba(25, 215, 208, 0)");
        context.fillStyle = glow;
        context.beginPath();
        context.arc(target.x, target.y, 28 * scale, 0, tau);
        context.fill();

        drawChips(toolPoint, time, view, true, palette.orangeLight);
        context.restore();
      }

      function tablePolygon(cell) {
        const widthPadding = 34;
        const heightPadding = 30;
        return [
          [-cell.stock.width / 2 - widthPadding, -cell.stock.height / 2 - heightPadding],
          [cell.stock.width / 2 + widthPadding, -cell.stock.height / 2 - heightPadding],
          [cell.stock.width / 2 + widthPadding, cell.stock.height / 2 + heightPadding],
          [-cell.stock.width / 2 - widthPadding, cell.stock.height / 2 + heightPadding],
        ];
      }

      function drawCell(cell, progress, view, time, options) {
        const settings = options || {};
        context.save();
        context.globalAlpha = settings.alpha === undefined ? 1 : settings.alpha;
        drawFloorGrid(view, 150);
        if (cell.id === "cnc") drawMachineFrame(view);
        drawPrism(tablePolygon(cell), -17, -7, view, {
          top: "#314b53",
          topEnd: "#1b343b",
          side: "#172d34",
          sideDark: "#10242a",
          stroke: "rgba(133, 173, 182, 0.30)",
        });
        drawPrism(cell.stock.polygon, 0, cell.stock.depth, view, {
          top: cell.id === "cnc" ? "#89a3aa" : "#7f9197",
          topEnd: cell.id === "cnc" ? "#526e76" : "#495f66",
          side: "#3b555d",
          sideDark: "#263e45",
          stroke: "rgba(208, 229, 232, 0.42)",
        });
        drawFeatureFaces(cell, progress, view);
        drawProgram(cell, progress, view);
        const sampled = sampleProgram(cell.program, progress);
        if (cell.id === "cnc") {
          drawChips(sampled.point, time, view, sampled.cutting, palette.cyanSoft);
          drawCncSpindle(sampled.point, view, progress);
        } else {
          drawIndustrialRobot(sampled.point, view, progress, time);
        }
        context.restore();
      }

      function drawCellTitle(cell, x, y, align) {
        const isCnc = cell.id === "cnc";
        writeTracking(
          isCnc ? "CNC SURROGATE TRAINING PATH" : "ROS SHADOW OPTIMIZATION PATH",
          x,
          y,
          10,
          isCnc ? palette.cyanSoft : palette.orangeLight,
          1.35,
          align || "left",
        );
        writeText(
          isCnc ? "Seeded multi-feature stock" : "Six-axis robot machining",
          x,
          y + 34,
          25,
          palette.white,
          700,
          align || "left",
        );
        writeText(
          isCnc
            ? "Rounded rectangle · circle · slot"
            : "Generic IRB 120-class visual · ROS 2 shadow data",
          x,
          y + 58,
          12,
          palette.slate,
          500,
          align || "left",
        );
      }

      function drawMetricStrip(cell, progress, y) {
        const isCnc = cell.id === "cnc";
        const values = isCnc
          ? [
              ["USD SEED", String(cell.seed)],
              ["MATERIAL", "ALUMINUM 6061"],
              ["PATH", Math.round(progress * 100) + "%"],
            ]
          : [
              ["USD SEED", String(cell.seed)],
              ["MATERIAL", "MILD STEEL"],
              ["SHADOW PATH", Math.round(progress * 100) + "%"],
            ];
        const x = 42;
        const boxWidth = 430;
        const boxHeight = 58;
        context.save();
        roundedRectangle(x, y, boxWidth, boxHeight, 10);
        context.fillStyle = "rgba(4, 16, 19, 0.78)";
        context.fill();
        context.strokeStyle = palette.line;
        context.stroke();
        values.forEach((value, index) => {
          const cellWidth = boxWidth / values.length;
          if (index > 0) {
            context.beginPath();
            context.moveTo(x + index * cellWidth, y);
            context.lineTo(x + index * cellWidth, y + boxHeight);
            context.strokeStyle = palette.line;
            context.stroke();
          }
          writeTracking(
            value[0],
            x + index * cellWidth + 14,
            y + 19,
            8,
            palette.slate,
            1.1,
            "left",
          );
          writeText(
            value[1],
            x + index * cellWidth + 14,
            y + 42,
            13,
            palette.white,
            700,
            "left",
          );
        });
        context.restore();
      }

      function drawFrameChrome(title, subtitle) {
        const gradient = context.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, "#071719");
        gradient.addColorStop(0.58, "#061215");
        gradient.addColorStop(1, "#030a0c");
        context.fillStyle = gradient;
        context.fillRect(0, 0, width, height);

        const glowLeft = context.createRadialGradient(300, 380, 0, 300, 380, 460);
        glowLeft.addColorStop(0, "rgba(25, 215, 208, 0.11)");
        glowLeft.addColorStop(1, "rgba(25, 215, 208, 0)");
        context.fillStyle = glowLeft;
        context.fillRect(0, 0, 700, height);
        const glowRight = context.createRadialGradient(990, 390, 0, 990, 390, 430);
        glowRight.addColorStop(0, "rgba(242, 138, 49, 0.08)");
        glowRight.addColorStop(1, "rgba(242, 138, 49, 0)");
        context.fillStyle = glowRight;
        context.fillRect(600, 0, 680, height);

        context.strokeStyle = "rgba(132, 180, 190, 0.18)";
        context.lineWidth = 1;
        context.strokeRect(20.5, 20.5, width - 41, height - 41);

        writeTracking("SAGE SIMULATION REPLAY", 42, 54, 12, palette.white, 1.8);
        writeText(subtitle, 42, 79, 11, palette.slate, 500);
        pill("SIMULATED · ADVISORY", 1035, 35, {
          width: 202,
          color: palette.amber,
          stroke: "rgba(255, 199, 102, 0.52)",
        });
        if (title) {
          writeText(title, 640, 120, 28, palette.white, 700, "center");
        }
      }

      function drawOverview(time, finalOverview) {
        drawFrameChrome(
          finalOverview
            ? "Two embodiments. One reviewable evidence contract."
            : "An unobstructed elevated view of both simulated work areas.",
          "PUBLIC TEACHING RECONSTRUCTION · SEEDED USD STOCK · NOT RAW CAMPAIGN FOOTAGE",
        );
        const progress = finalOverview ? 0.94 : 0.14 + time * 0.035;
        const cncView = makeView(345, 425, 1.02);
        const robotView = makeView(920, 425, 1.0);
        drawCell(scene.cells[0], clamp(progress, 0, 1), cncView, time, {});
        drawCell(scene.cells[1], clamp(progress * 0.96, 0, 1), robotView, time, {});

        context.save();
        roundedRectangle(40, 134, 358, 74, 12);
        context.fillStyle = "rgba(6, 20, 24, 0.84)";
        context.fill();
        context.strokeStyle = "rgba(25, 215, 208, 0.28)";
        context.stroke();
        drawCellTitle(scene.cells[0], 58, 157, "left");

        roundedRectangle(836, 134, 402, 74, 12);
        context.fillStyle = "rgba(6, 20, 24, 0.84)";
        context.fill();
        context.strokeStyle = "rgba(242, 138, 49, 0.30)";
        context.stroke();
        drawCellTitle(scene.cells[1], 1220, 157, "right");
        context.restore();

        if (finalOverview) {
          const flowY = 645;
          const labels = ["TRACE", "SCORE", "EVIDENCE", "INDEPENDENT CHECK"];
          const centers = [270, 485, 705, 1000];
          labels.forEach((label, index) => {
            const boxWidth = index === labels.length - 1 ? 206 : 132;
            roundedRectangle(centers[index] - boxWidth / 2, flowY - 25, boxWidth, 42, 21);
            context.fillStyle =
              index === labels.length - 1
                ? "rgba(185, 242, 93, 0.12)"
                : "rgba(25, 215, 208, 0.09)";
            context.fill();
            context.strokeStyle =
              index === labels.length - 1
                ? "rgba(185, 242, 93, 0.48)"
                : "rgba(25, 215, 208, 0.35)";
            context.stroke();
            writeTracking(
              label,
              centers[index],
              flowY + 1,
              9,
              index === labels.length - 1 ? palette.lime : palette.cyanSoft,
              1.2,
              "center",
            );
            if (index < labels.length - 1) {
              const startX = centers[index] + boxWidth / 2 + 12;
              const nextWidth = index + 1 === labels.length - 1 ? 206 : 132;
              const endX = centers[index + 1] - nextWidth / 2 - 12;
              context.beginPath();
              context.moveTo(startX, flowY - 4);
              context.lineTo(endX, flowY - 4);
              context.lineTo(endX - 8, flowY - 10);
              context.moveTo(endX, flowY - 4);
              context.lineTo(endX - 8, flowY + 2);
              context.strokeStyle = "rgba(148, 174, 181, 0.52)";
              context.lineWidth = 1.4;
              context.stroke();
            }
          });
          writeText(
            "The physical gate remains closed.",
            640,
            699,
            11,
            palette.slate,
            500,
            "center",
          );
        } else {
          writeText(
            "No opaque enclosure blocks the stock, cutter, or robot tool center point.",
            640,
            671,
            12,
            palette.slate,
            500,
            "center",
          );
        }
      }

      function drawFocusedCnc(time) {
        const progress = clamp((time - 2.8) / 5.1, 0.02, 0.98);
        drawFrameChrome(
          "",
          "PUBLIC TEACHING RECONSTRUCTION · CNC SURROGATE TRAINING PATH",
        );
        drawCellTitle(scene.cells[0], 42, 122, "left");
        pill("CUTAWAY CAMERA", 1041, 102, {
          width: 196,
          color: palette.cyanSoft,
        });
        drawCell(
          scene.cells[0],
          progress,
          makeView(694, 426, 1.92),
          time,
          {},
        );
        drawMetricStrip(scene.cells[0], progress, 635);
        writeText(
          "Three disclosed pocket classes combined into one public-safe seeded demonstration stock.",
          1238,
          672,
          11,
          palette.slate,
          500,
          "right",
        );
      }

      function drawFocusedRobot(time) {
        const progress = clamp((time - 8.2) / 5.6, 0.02, 0.98);
        drawFrameChrome(
          "",
          "PUBLIC TEACHING RECONSTRUCTION · ROS SHADOW OPTIMIZATION PATH",
        );
        drawCellTitle(scene.cells[1], 42, 122, "left");
        pill("IRB 120-CLASS", 1060, 102, {
          width: 177,
          color: palette.orangeLight,
          stroke: "rgba(242, 138, 49, 0.42)",
        });
        drawCell(
          scene.cells[1],
          progress,
          makeView(650, 430, 1.83),
          time,
          {},
        );
        drawMetricStrip(scene.cells[1], progress, 635);
        writeText(
          "Unbranded six-axis teaching visual; no live ROS or robot-controller command path.",
          1238,
          672,
          11,
          palette.slate,
          500,
          "right",
        );
      }

      function drawCrossfade(time, start, end, drawFirst, drawSecond) {
        const amount = smoothstep(start, end, time);
        context.save();
        context.globalAlpha = 1 - amount;
        drawFirst();
        context.restore();
        context.save();
        context.globalAlpha = amount;
        drawSecond();
        context.restore();
      }

      function drawFrame(time) {
        if (time < 2.4) {
          drawOverview(time, false);
          return;
        }
        if (time < 3.1) {
          drawCrossfade(
            time,
            2.4,
            3.1,
            function () { drawOverview(time, false); },
            function () { drawFocusedCnc(time); },
          );
          return;
        }
        if (time < 7.7) {
          drawFocusedCnc(time);
          return;
        }
        if (time < 8.5) {
          drawCrossfade(
            time,
            7.7,
            8.5,
            function () { drawFocusedCnc(time); },
            function () { drawFocusedRobot(time); },
          );
          return;
        }
        if (time < 13.6) {
          drawFocusedRobot(time);
          return;
        }
        if (time < 14.5) {
          drawCrossfade(
            time,
            13.6,
            14.5,
            function () { drawFocusedRobot(time); },
            function () { drawOverview(time, true); },
          );
          return;
        }
        drawOverview(time, true);
      }

      function canvasBlob(type, quality) {
        return new Promise((resolve, reject) => {
          canvas.toBlob(
            (blob) => {
              if (blob) resolve(blob);
              else reject(new Error("Canvas did not produce a " + type + " blob."));
            },
            type,
            quality,
          );
        });
      }

      async function postArtifact(name, body) {
        const response = await fetch("/artifact/" + name, {
          method: "POST",
          body: body,
        });
        if (!response.ok) {
          throw new Error("Artifact upload failed for " + name + ": " + response.status);
        }
      }

      async function reportError(error) {
        try {
          await fetch("/error", {
            method: "POST",
            body: String(error && error.stack ? error.stack : error),
          });
        } catch {}
      }

      async function render() {
        await document.fonts.ready;
        drawFrame(15.6);
        await postArtifact("poster", await canvasBlob("image/jpeg", 0.91));
        drawFrame(5.4);
        await postArtifact("qa-cnc", await canvasBlob("image/jpeg", 0.9));
        drawFrame(11.2);
        await postArtifact("qa-robot", await canvasBlob("image/jpeg", 0.9));

        const mimeCandidates = [
          "video/mp4;codecs=avc1.42E01E",
          "video/mp4",
        ];
        const mimeType = mimeCandidates.find((candidate) =>
          MediaRecorder.isTypeSupported(candidate),
        );
        if (!mimeType) {
          throw new Error("This Chrome build cannot record an MP4 canvas stream.");
        }

        if (
          typeof MediaStreamTrackGenerator !== "function" ||
          typeof VideoFrame !== "function"
        ) {
          throw new Error(
            "This Chrome build cannot create timestamped replay frames.",
          );
        }
        const frameRate = 12;
        const frameDurationMicroseconds = Math.round(1000000 / frameRate);
        const frameCount = Math.round(scene.durationSeconds * frameRate) + 1;
        const trackGenerator = new MediaStreamTrackGenerator({ kind: "video" });
        const stream = new MediaStream([trackGenerator]);
        const recorder = new MediaRecorder(stream, {
          mimeType: mimeType,
          videoBitsPerSecond: 1450000,
        });
        const chunks = [];
        recorder.addEventListener("dataavailable", (event) => {
          if (event.data && event.data.size > 0) chunks.push(event.data);
        });
        const stopped = new Promise((resolve, reject) => {
          recorder.addEventListener("stop", resolve, { once: true });
          recorder.addEventListener("error", reject, { once: true });
        });

        recorder.start(1000);
        const writer = trackGenerator.writable.getWriter();
        const recordingStartedAt = performance.now();
        for (let frameIndex = 0; frameIndex < frameCount; frameIndex += 1) {
          const targetTime =
            recordingStartedAt + (frameIndex * 1000) / frameRate;
          const waitMilliseconds = targetTime - performance.now();
          if (waitMilliseconds > 0) {
            await new Promise((resolve) =>
              setTimeout(resolve, waitMilliseconds),
            );
          }
          drawFrame(
            Math.min(frameIndex / frameRate, scene.durationSeconds),
          );
          const frame = new VideoFrame(canvas, {
            timestamp: frameIndex * frameDurationMicroseconds,
            duration: frameDurationMicroseconds,
          });
          await writer.write(frame);
          frame.close();
        }
        await writer.close();
        if (recorder.state !== "inactive") recorder.stop();
        await stopped;
        stream.getTracks().forEach((track) => track.stop());
        const video = new Blob(chunks, { type: mimeType });
        await postArtifact("video", video);
        document.body.dataset.renderState = "complete";
      }

      render().catch(async (error) => {
        document.body.dataset.renderState = "failed";
        await reportError(error);
      });
    </script>
  </body>
</html>`.replace("__SCENE_JSON__", sceneJson);
}

async function renderReplay() {
  const chromePath = findChrome();
  assert(
    chromePath,
    "Chrome or Edge is required to render the public simulation replay.",
  );

  fs.mkdirSync(mediaDirectory, { recursive: true });
  if (renderQaFrames) fs.mkdirSync(qaDirectory, { recursive: true });

  const usdText = buildPublicUsdScene();
  const captionsText = buildReplayCaptions();
  fs.writeFileSync(filePaths.usd, usdText, "utf8");
  fs.writeFileSync(filePaths.captions, captionsText, "utf8");

  const requiredArtifacts = new Set(["video", "poster"]);
  const receivedArtifacts = new Set();
  let completeResolve;
  let completeReject;
  const completion = new Promise((resolve, reject) => {
    completeResolve = resolve;
    completeReject = reject;
  });

  const server = http.createServer(async (request, response) => {
    try {
      if (request.method === "GET" && request.url === "/") {
        const html = buildRendererHtml();
        response.writeHead(200, {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "no-store",
          "Content-Length": Buffer.byteLength(html),
        });
        response.end(html);
        return;
      }

      if (request.method === "POST" && request.url?.startsWith("/artifact/")) {
        const name = request.url.slice("/artifact/".length);
        const body = await collectRequestBody(request);
        if (name === "video") fs.writeFileSync(filePaths.video, body);
        else if (name === "poster") fs.writeFileSync(filePaths.poster, body);
        else if (name === "qa-cnc" && renderQaFrames) {
          fs.writeFileSync(path.join(qaDirectory, "cnc.jpg"), body);
        } else if (name === "qa-robot" && renderQaFrames) {
          fs.writeFileSync(path.join(qaDirectory, "robot.jpg"), body);
        }
        receivedArtifacts.add(name);
        response.writeHead(204);
        response.end();
        if (
          [...requiredArtifacts].every((artifact) =>
            receivedArtifacts.has(artifact),
          )
        ) {
          completeResolve();
        }
        return;
      }

      if (request.method === "POST" && request.url === "/error") {
        const body = await collectRequestBody(request, 50_000);
        const message = body.toString("utf8");
        response.writeHead(204);
        response.end();
        completeReject(new Error(`Chrome replay renderer failed: ${message}`));
        return;
      }

      response.writeHead(404);
      response.end("Not found");
    } catch (error) {
      response.writeHead(500);
      response.end("Renderer server error");
      completeReject(error);
    }
  });

  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  assert(address && typeof address === "object");
  const profileDirectory = fs.mkdtempSync(
    path.join(os.tmpdir(), "sage-replay-chrome-"),
  );
  const browser = spawn(
    chromePath,
    [
      "--headless=new",
      "--autoplay-policy=no-user-gesture-required",
      "--disable-background-timer-throttling",
      "--disable-component-update",
      "--disable-breakpad",
      "--disable-default-apps",
      "--disable-features=Translate",
      "--disable-crash-reporter",
      "--disable-renderer-backgrounding",
      "--hide-scrollbars",
      "--mute-audio",
      "--no-default-browser-check",
      "--no-first-run",
      "--window-size=1280,720",
      `--user-data-dir=${profileDirectory}`,
      `http://127.0.0.1:${address.port}/`,
    ],
    {
      stdio: ["ignore", "ignore", "pipe"],
      windowsHide: true,
    },
  );
  let browserErrors = "";
  const browserExited = new Promise((resolve) => {
    browser.once("exit", resolve);
  });
  browser.stderr.on("data", (chunk) => {
    if (browserErrors.length < 20_000) browserErrors += chunk.toString("utf8");
  });
  browser.once("error", completeReject);
  browser.once("exit", (code) => {
    if (
      ![...requiredArtifacts].every((artifact) =>
        receivedArtifacts.has(artifact),
      )
    ) {
      completeReject(
        new Error(
          `Chrome exited before rendering completed (code ${code}).\n${browserErrors}`,
        ),
      );
    }
  });

  const timeout = setTimeout(() => {
    completeReject(
      new Error(
        `Replay render exceeded 45 seconds.\n${browserErrors.slice(-4000)}`,
      ),
    );
  }, 45_000);

  try {
    await completion;
  } finally {
    clearTimeout(timeout);
    if (!browser.killed) browser.kill();
    await Promise.race([
      browserExited,
      new Promise((resolve) => setTimeout(resolve, 2000)),
    ]);
    await new Promise((resolve) => server.close(resolve));
    try {
      fs.rmSync(profileDirectory, {
        recursive: true,
        force: true,
        maxRetries: 5,
        retryDelay: 200,
      });
    } catch (error) {
      console.warn(
        `Chrome profile cleanup deferred: ${error.code ?? error.message}`,
      );
    }
  }

  const videoBytes = fs.readFileSync(filePaths.video);
  const posterBytes = fs.readFileSync(filePaths.poster);
  const manifest = buildReplayManifest({
    videoBytes,
    posterBytes,
    usdText,
    captionsText,
  });
  fs.writeFileSync(
    filePaths.manifest,
    `${JSON.stringify(manifest, null, 2)}\n`,
    "utf8",
  );
  fs.writeFileSync(filePaths.readme, buildMediaReadme(manifest), "utf8");

  console.log(`Rendered ${REPLAY_DURATION_SECONDS}-second replay with ${chromePath}.`);
  if (renderQaFrames) console.log(`QA frames: ${qaDirectory}`);
}

if (checkOnly) {
  verifyReplayFiles();
} else {
  await renderReplay();
  verifyReplayFiles();
}
