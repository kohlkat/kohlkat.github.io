import crypto from "node:crypto";

function readMp4Boxes(bytes, start = 0, end = bytes.length) {
  const boxes = [];
  let offset = start;

  while (offset + 8 <= end) {
    let size = bytes.readUInt32BE(offset);
    const type = bytes.toString("ascii", offset + 4, offset + 8);
    let headerSize = 8;
    if (size === 1) {
      if (offset + 16 > end) break;
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
  if (!mediaHeader) throw new Error("MP4 media timing box is missing.");

  const version = bytes[mediaHeader.offset + 8];
  const timescaleOffset = mediaHeader.offset + (version === 1 ? 28 : 20);
  const durationOffset = mediaHeader.offset + (version === 1 ? 32 : 24);
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

  if (maximumDecodeTime) return maximumDecodeTime / timescale;
  const duration =
    version === 1
      ? Number(bytes.readBigUInt64BE(durationOffset))
      : bytes.readUInt32BE(durationOffset);
  if (!duration) throw new Error("MP4 duration metadata is missing.");
  return duration / timescale;
}

export function sha256(content) {
  return crypto.createHash("sha256").update(content).digest("hex");
}
