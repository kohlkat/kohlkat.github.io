import crypto from "node:crypto";

export const REPLAY_VERSION = "v2";
export const REPLAY_DURATION_SECONDS = 18;
export const REPLAY_WIDTH = 1280;
export const REPLAY_HEIGHT = 720;

const disclosedShapeClasses = [
  "circle_pocket",
  "rounded_rectangle_pocket",
  "slot_pocket",
];

function mulberry32(seed) {
  let state = seed >>> 0;

  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function round(value, digits = 4) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function rotatePoint([x, y], angle, [centerX, centerY]) {
  const cosine = Math.cos(angle);
  const sine = Math.sin(angle);

  return [
    round(centerX + x * cosine - y * sine),
    round(centerY + x * sine + y * cosine),
  ];
}

function roundedRectanglePoints(width, height, radius, center, rotation) {
  const points = [];
  const halfWidth = width / 2;
  const halfHeight = height / 2;
  const corners = [
    [halfWidth - radius, halfHeight - radius, 0],
    [-halfWidth + radius, halfHeight - radius, Math.PI / 2],
    [-halfWidth + radius, -halfHeight + radius, Math.PI],
    [halfWidth - radius, -halfHeight + radius, (3 * Math.PI) / 2],
  ];

  for (const [cornerX, cornerY, start] of corners) {
    for (let index = 0; index < 8; index += 1) {
      const angle = start + (index * Math.PI) / 14;
      points.push(
        rotatePoint(
          [
            cornerX + radius * Math.cos(angle),
            cornerY + radius * Math.sin(angle),
          ],
          rotation,
          center,
        ),
      );
    }
  }

  return points;
}

function circlePoints(radius, center, rotation = 0) {
  return Array.from({ length: 40 }, (_, index) => {
    const angle = rotation + (index / 40) * Math.PI * 2;
    return [
      round(center[0] + radius * Math.cos(angle)),
      round(center[1] + radius * Math.sin(angle)),
    ];
  });
}

function slotPoints(length, width, center, rotation) {
  return roundedRectanglePoints(length, width, width / 2, center, rotation);
}

function seededStockPolygon(seed, width, height, chamfer) {
  const random = mulberry32(seed);
  const offsets = Array.from(
    { length: 4 },
    () => chamfer * (0.72 + random() * 0.56),
  );
  const halfWidth = width / 2;
  const halfHeight = height / 2;

  return [
    [-halfWidth + offsets[0], -halfHeight],
    [halfWidth - offsets[1], -halfHeight],
    [halfWidth, -halfHeight + offsets[1]],
    [halfWidth, halfHeight - offsets[2]],
    [halfWidth - offsets[2], halfHeight],
    [-halfWidth + offsets[3], halfHeight],
    [-halfWidth, halfHeight - offsets[3]],
    [-halfWidth, -halfHeight + offsets[0]],
  ].map(([x, y]) => [round(x), round(y)]);
}

function feature(kind, values) {
  const curve =
    kind === "circle_pocket"
      ? circlePoints(values.radius, values.center, values.rotation)
      : kind === "slot_pocket"
        ? slotPoints(
            values.length,
            values.width,
            values.center,
            values.rotation,
          )
        : roundedRectanglePoints(
            values.width,
            values.height,
            values.radius,
            values.center,
            values.rotation,
          );

  return {
    kind,
    ...values,
    curve,
  };
}

export const publicReplayScene = {
  schemaVersion: "sage-public-teaching-scene/v2",
  evidenceClass: "SIMULATED",
  authority: "shadow_only_non_actuating",
  renderKind: "public_teaching_reconstruction",
  durationSeconds: REPLAY_DURATION_SECONDS,
  width: REPLAY_WIDTH,
  height: REPLAY_HEIGHT,
  disclosedShapeClasses,
  cells: [
    {
      id: "cnc",
      label: "CNC simulation",
      learningPath: "surrogate_training_path",
      seed: 274120,
      material: "aluminum_6061",
      stock: {
        width: 152,
        height: 105,
        depth: 20,
        polygon: seededStockPolygon(274120, 152, 105, 11),
      },
      features: [
        feature("rounded_rectangle_pocket", {
          center: [-11, 0],
          width: 88,
          height: 56,
          radius: 11,
          rotation: -0.04,
        }),
        feature("circle_pocket", {
          center: [50, -28],
          radius: 9,
          rotation: 0,
        }),
        feature("slot_pocket", {
          center: [47, 29],
          length: 34,
          width: 11,
          rotation: -0.18,
        }),
      ],
    },
    {
      id: "ros",
      label: "ROS robot simulation",
      learningPath: "shadow_optimization_path",
      seed: 274121,
      material: "mild_steel",
      robotVisual: "generic_unbranded_six_axis_irb120_class",
      stock: {
        width: 134,
        height: 96,
        depth: 22,
        polygon: seededStockPolygon(274121, 134, 96, 13),
      },
      features: [
        feature("rounded_rectangle_pocket", {
          center: [12, -9],
          width: 64,
          height: 44,
          radius: 12,
          rotation: 0.2,
        }),
        feature("slot_pocket", {
          center: [-37, 26],
          length: 43,
          width: 12,
          rotation: -0.36,
        }),
        feature("circle_pocket", {
          center: [-45, -23],
          radius: 10,
          rotation: 0,
        }),
      ],
    },
  ],
};

function formatNumber(value) {
  return Number(value).toFixed(4).replace(/\.?0+$/, "");
}

function formatPoint([x, y], z) {
  return `(${formatNumber(x)}, ${formatNumber(y)}, ${formatNumber(z)})`;
}

function meshForStock(cell) {
  const polygon = cell.stock.polygon;
  const pointCount = polygon.length;
  const points = [
    ...polygon.map((point) => formatPoint(point, 0)),
    ...polygon.map((point) => formatPoint(point, cell.stock.depth)),
  ];
  const bottom = Array.from({ length: pointCount }, (_, index) =>
    pointCount - index - 1,
  );
  const top = Array.from({ length: pointCount }, (_, index) => pointCount + index);
  const sideFaces = Array.from({ length: pointCount }, (_, index) => {
    const next = (index + 1) % pointCount;
    return [index, next, pointCount + next, pointCount + index];
  });
  const faceCounts = [pointCount, pointCount, ...sideFaces.map(() => 4)];
  const faceIndices = [...bottom, ...top, ...sideFaces.flat()];

  return `        def Mesh "SeededStock"
        {
            custom int sage:deterministicSeed = ${cell.seed}
            custom string sage:evidenceClass = "SIMULATED"
            custom string sage:materialClass = "${cell.material}"
            int[] faceVertexCounts = [${faceCounts.join(", ")}]
            int[] faceVertexIndices = [${faceIndices.join(", ")}]
            point3f[] points = [${points.join(", ")}]
            color3f[] primvars:displayColor = [(0.31, 0.46, 0.52)]
            uniform token subdivisionScheme = "none"
        }`;
}

function curvesForFeatures(cell) {
  return cell.features
    .map((currentFeature, index) => {
      const points = currentFeature.curve.map((point) =>
        formatPoint(point, cell.stock.depth + 0.4),
      );

      return `        def BasisCurves "PublicFeature_${index + 1}"
        {
            custom string sage:shapeClass = "${currentFeature.kind}"
            int[] curveVertexCounts = [${currentFeature.curve.length}]
            point3f[] points = [${points.join(", ")}]
            color3f[] primvars:displayColor = [(0.10, 0.84, 0.81)]
            uniform token type = "linear"
            uniform token wrap = "periodic"
            float[] widths = [1.2]
        }`;
    })
    .join("\n\n");
}

export function buildPublicUsdScene() {
  const cellBlocks = publicReplayScene.cells
    .map(
      (cell, index) => `    def Xform "${cell.id === "cnc" ? "CNCCell" : "ROSRobotCell"}"
    {
        custom string sage:embodiment = "${cell.id}"
        custom string sage:learningPath = "${cell.learningPath}"
        custom string sage:provenance = "public_teaching_reconstruction"
        double3 xformOp:translate = (${index === 0 ? -105 : 105}, 0, 0)
        uniform token[] xformOpOrder = ["xformOp:translate"]

${meshForStock(cell)}

${curvesForFeatures(cell)}
    }`,
    )
    .join("\n\n");

  return `#usda 1.0
(
    defaultPrim = "World"
    metersPerUnit = 0.001
    upAxis = "Z"
    customLayerData = {
        string authority = "shadow_only_non_actuating"
        string evidenceClass = "SIMULATED"
        string provenance = "public_teaching_reconstruction"
        string sourceBoundary = "not_raw_campaign_geometry"
    }
)

# Newly generated public teaching geometry.
# Uses only disclosed shape-class names; no campaign USD, customer geometry,
# controller path, model parameter, or private sidecar is copied here.
def Xform "World"
{
${cellBlocks}
}
`;
}

export function buildReplayCaptions() {
  return `WEBVTT

00:00.000 --> 00:03.000
SIMULATED public reconstruction. Elevated cutaway view.

00:03.000 --> 00:08.200
CNC surrogate-training path: seeded multi-feature stock.

00:08.200 --> 00:14.000
ROS shadow-optimization path: generic six-axis arm.

00:14.000 --> 00:18.000
Trace, score, evidence, independent check. Physical gate closed.

NOTE
This browser-rendered replay is not raw NVIDIA campaign footage, physical cutting, or a hardware command stream.
`;
}

export function sha256(content) {
  return crypto.createHash("sha256").update(content).digest("hex");
}

function readMp4Boxes(bytes, start = 0, end = bytes.length) {
  const boxes = [];
  let offset = start;

  while (offset + 8 <= end) {
    let size = bytes.readUInt32BE(offset);
    const type = bytes.toString("ascii", offset + 4, offset + 8);
    let headerSize = 8;
    if (size === 1) {
      size = Number(bytes.readBigUInt64BE(offset + 8));
      headerSize = 16;
    } else if (size === 0) {
      size = end - offset;
    }
    if (size < headerSize || offset + size > end) break;
    boxes.push({ offset, size, type, headerSize });
    offset += size;
  }

  return boxes;
}

function childMp4Box(bytes, parent, type) {
  return readMp4Boxes(
    bytes,
    parent.offset + parent.headerSize,
    parent.offset + parent.size,
  ).find((box) => box.type === type);
}

function fullBoxFlags(bytes, box) {
  return (
    (bytes[box.offset + 9] << 16) |
    (bytes[box.offset + 10] << 8) |
    bytes[box.offset + 11]
  );
}

export function readFragmentedMp4DurationSeconds(bytes) {
  const topLevel = readMp4Boxes(bytes);
  const movie = topLevel.find((box) => box.type === "moov");
  const track = movie && childMp4Box(bytes, movie, "trak");
  const media = track && childMp4Box(bytes, track, "mdia");
  const mediaHeader = media && childMp4Box(bytes, media, "mdhd");
  if (!mediaHeader) throw new Error("MP4 media timescale box is missing.");

  const mediaHeaderVersion = bytes[mediaHeader.offset + 8];
  const timescaleOffset =
    mediaHeader.offset + (mediaHeaderVersion === 1 ? 28 : 20);
  const timescale = bytes.readUInt32BE(timescaleOffset);
  if (!timescale) throw new Error("MP4 media timescale is invalid.");

  let maximumDecodeTime = 0;
  for (const movieFragment of topLevel.filter(
    (box) => box.type === "moof",
  )) {
    const trackFragment = childMp4Box(bytes, movieFragment, "traf");
    if (!trackFragment) continue;
    const decodeTimeBox = childMp4Box(bytes, trackFragment, "tfdt");
    const trackHeader = childMp4Box(bytes, trackFragment, "tfhd");
    const run = childMp4Box(bytes, trackFragment, "trun");
    if (!decodeTimeBox || !trackHeader || !run) continue;

    const decodeTime =
      bytes[decodeTimeBox.offset + 8] === 1
        ? Number(bytes.readBigUInt64BE(decodeTimeBox.offset + 12))
        : bytes.readUInt32BE(decodeTimeBox.offset + 12);
    const trackFlags = fullBoxFlags(bytes, trackHeader);
    let trackCursor = trackHeader.offset + 16;
    if (trackFlags & 0x000001) trackCursor += 8;
    if (trackFlags & 0x000002) trackCursor += 4;
    let defaultSampleDuration = 0;
    if (trackFlags & 0x000008) {
      defaultSampleDuration = bytes.readUInt32BE(trackCursor);
      trackCursor += 4;
    }
    if (trackFlags & 0x000010) trackCursor += 4;
    if (trackFlags & 0x000020) trackCursor += 4;

    const runFlags = fullBoxFlags(bytes, run);
    const sampleCount = bytes.readUInt32BE(run.offset + 12);
    let runCursor = run.offset + 16;
    if (runFlags & 0x000001) runCursor += 4;
    if (runFlags & 0x000004) runCursor += 4;
    let fragmentDuration = 0;
    for (let sampleIndex = 0; sampleIndex < sampleCount; sampleIndex += 1) {
      let sampleDuration = defaultSampleDuration;
      if (runFlags & 0x000100) {
        sampleDuration = bytes.readUInt32BE(runCursor);
        runCursor += 4;
      }
      if (runFlags & 0x000200) runCursor += 4;
      if (runFlags & 0x000400) runCursor += 4;
      if (runFlags & 0x000800) runCursor += 4;
      fragmentDuration += sampleDuration;
    }
    maximumDecodeTime = Math.max(
      maximumDecodeTime,
      decodeTime + fragmentDuration,
    );
  }

  if (!maximumDecodeTime) {
    throw new Error("MP4 fragment timing metadata is missing.");
  }

  return maximumDecodeTime / timescale;
}

export function buildReplayManifest({
  videoBytes,
  posterBytes,
  usdText,
  captionsText,
}) {
  return {
    schema_version: "sage-public-teaching-replay/v2",
    evidence_class: "SIMULATED",
    authority: "shadow_only_non_actuating",
    render_kind: "public_teaching_reconstruction",
    duration_seconds: REPLAY_DURATION_SECONDS,
    frame_size: {
      width: REPLAY_WIDTH,
      height: REPLAY_HEIGHT,
    },
    campaign_relationship: {
      disclosed_shape_classes: disclosedShapeClasses,
      historical_runtime:
        "NVIDIA Isaac Sim articulation with hybrid modeled cutting signals",
      raw_campaign_capture: false,
      raw_campaign_geometry: false,
      physical_machine_recording: false,
    },
    embodiments: publicReplayScene.cells.map((cell) => ({
      id: cell.id,
      deterministic_seed: cell.seed,
      learning_path: cell.learningPath,
      material_class: cell.material,
      shape_classes: cell.features.map((currentFeature) => currentFeature.kind),
      robot_visual: cell.robotVisual ?? null,
    })),
    files: {
      video: {
        path: "sage-simulation-replay-v2.mp4",
        bytes: videoBytes.length,
        sha256: sha256(videoBytes),
      },
      poster: {
        path: "sage-simulation-replay-poster-v2.jpg",
        bytes: posterBytes.length,
        sha256: sha256(posterBytes),
      },
      captions: {
        path: "sage-simulation-replay-captions-v2.vtt",
        bytes: Buffer.byteLength(captionsText),
        sha256: sha256(captionsText),
      },
      usd_scene: {
        path: "sage-public-teaching-scene-v2.usda",
        bytes: Buffer.byteLength(usdText),
        sha256: sha256(usdText),
      },
    },
  };
}

export function buildMediaReadme(manifest) {
  return `# Public Simulation Media

\`sage-simulation-replay-v2.mp4\` is a silent, browser-rendered public teaching
reconstruction. Its elevated cutaway view keeps the work visible while showing
two separate simulated learning paths:

- CNC surrogate training over deterministic multi-feature stock; and
- ROS shadow optimization with an unbranded, IRB 120-class six-axis teaching arm.

\`sage-public-teaching-scene-v2.usda\` contains the matching deterministic stock
meshes and disclosed pocket-class curves. The scene is newly generated for the
public replay. It is not copied from a campaign USD, private program sidecar,
customer part, or machine/controller path.

The replay is not raw NVIDIA Isaac Sim or Omniverse footage, physical cutting,
measured machine footage, or a hardware command stream. The historical campaign
boundary remains Isaac articulation plus hybrid modeled cutting signals, all
labeled \`SIMULATED\`.

Reviewed asset hashes:

- MP4: \`${manifest.files.video.sha256}\`
- JPEG poster: \`${manifest.files.poster.sha256}\`
- USDA scene: \`${manifest.files.usd_scene.sha256}\`
- WebVTT captions: \`${manifest.files.captions.sha256}\`
`;
}
