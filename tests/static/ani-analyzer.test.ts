// ani-analyzer.test.ts — Tests for AniAnalyzer .ani binary parser.
// Uses inline binary fixtures matching the real .ani format:
//   [2B framesCount][2B resourceCount][resources...][params...][frames...]

import { assert } from "./test-utils.js";
import { AniAnalyzer } from "../../src/extraction/AniAnalyzer.js";
import { PvfParser } from "../../src/extraction/PvfParser.js";
import { readFileSync } from "node:fs";

// ── Helper: build a .ani binary in the correct format ──

function buildAni(opts: {
  framesCount?: number;
  sprites?: string[];
  globalParams?: Buffer;
  frameData?: Buffer;
}): Buffer {
  const parts: Buffer[] = [];
  const framesCount = opts.framesCount ?? 0;
  const sprites = opts.sprites ?? [];

  // Header: framesCount + resourceCount
  const header = Buffer.alloc(4);
  header.writeUInt16LE(framesCount, 0);
  header.writeUInt16LE(sprites.length, 2);
  parts.push(header);

  // Resources (sprite paths)
  for (const sp of sprites) {
    const lenBuf = Buffer.alloc(4);
    lenBuf.writeInt32LE(sp.length, 0);
    parts.push(lenBuf);
    parts.push(Buffer.from(sp, "ascii"));
  }

  // Global params
  if (opts.globalParams) {
    parts.push(opts.globalParams);
  } else {
    const noParams = Buffer.alloc(2);
    noParams.writeUInt16LE(0, 0);
    parts.push(noParams);
  }

  // Frame data
  if (opts.frameData) {
    parts.push(opts.frameData);
  }

  return Buffer.concat(parts);
}

function buildFrame(opts: {
  attackBoxes?: number[][];
  damageBoxes?: number[][];
  imgId?: number;
  imgParam?: number;
  x?: number;
  y?: number;
  properties?: Buffer;
}): Buffer {
  const parts: Buffer[] = [];
  const attacks = opts.attackBoxes ?? [];
  const damages = opts.damageBoxes ?? [];
  const totalBoxes = attacks.length + damages.length;

  // Box count
  const boxCountBuf = Buffer.alloc(2);
  boxCountBuf.writeUInt16LE(totalBoxes, 0);
  parts.push(boxCountBuf);

  // Damage boxes (type=14)
  for (const coords of damages) {
    const boxBuf = Buffer.alloc(26);
    boxBuf.writeUInt16LE(14, 0);
    for (let i = 0; i < 6; i++) boxBuf.writeInt32LE(coords[i] ?? 0, 2 + i * 4);
    parts.push(boxBuf);
  }

  // Attack boxes (type=15)
  for (const coords of attacks) {
    const boxBuf = Buffer.alloc(26);
    boxBuf.writeUInt16LE(15, 0);
    for (let i = 0; i < 6; i++) boxBuf.writeInt32LE(coords[i] ?? 0, 2 + i * 4);
    parts.push(boxBuf);
  }

  // imgId, imgParam, x, y
  const frameMeta = Buffer.alloc(12);
  frameMeta.writeUInt16LE(opts.imgId ?? 0, 0);
  frameMeta.writeUInt16LE(opts.imgParam ?? 0, 2);
  frameMeta.writeInt32LE(opts.x ?? 0, 4);
  frameMeta.writeInt32LE(opts.y ?? 0, 8);
  parts.push(frameMeta);

  // Properties
  if (opts.properties) {
    parts.push(opts.properties);
  } else {
    const noProps = Buffer.alloc(2);
    noProps.writeUInt16LE(0, 0);
    parts.push(noProps);
  }

  return Buffer.concat(parts);
}

// ── Tests ──

// Test 1: Parse minimal .ani (0 frames, 1 sprite resource)
{
  const buf = buildAni({ framesCount: 0, sprites: ["Character/Swordman/Test.img"] });
  const result = AniAnalyzer.parse(buf, "test.ani");

  assert.ok(result, "Should return AniDef for minimal .ani");
  assert.equal(result.imgPath, "character/swordman/test.img");
  assert.equal(result.totalFrames, 0);
  assert.equal(result.hitBoxes.length, 0);
  assert.equal(result.sourcePath, "test.ani");
}

// Test 2: Parse .ani with 1 frame, no boxes
{
  const frame = buildFrame({});
  const buf = buildAni({ framesCount: 1, sprites: ["Test/Sprite.img"], frameData: frame });
  const result = AniAnalyzer.parse(buf);

  assert.ok(result);
  assert.equal(result.imgPath, "test/sprite.img");
  assert.equal(result.hitBoxes.length, 0);
}

// Test 3: Empty buffer → graceful error
{
  const result = AniAnalyzer.parse(Buffer.alloc(0));
  assert.ok(result);
  assert.equal(result.imgPath, "");
  assert.equal(result.totalFrames, 0);
  assert.ok(result.parseWarnings.length > 0);
}

// Test 4: Buffer too small → graceful error
{
  const result = AniAnalyzer.parse(Buffer.from([0x01, 0x00]));
  assert.ok(result);
  assert.ok(result.parseWarnings.length > 0);
}

// Test 5: Parse .ani with attack box hitboxes
{
  const frame0 = buildFrame({ attackBoxes: [[-50, -100, -20, 50, 10, 20]] });
  const frame1 = buildFrame({ attackBoxes: [[-30, -80, -10, 30, 5, 10]] });
  const frameData = Buffer.concat([frame0, frame1]);
  const buf = buildAni({ framesCount: 2, sprites: ["Test/Attack.img"], frameData });
  const result = AniAnalyzer.parse(buf);

  assert.ok(result);
  assert.equal(result.hitBoxes.length, 2);
  assert.equal(result.hitBoxes[0]!.frameStart, 0);
  assert.equal(result.hitBoxes[0]!.x1, -50);
  assert.equal(result.hitBoxes[0]!.y1, -100);
  assert.equal(result.hitBoxes[0]!.z1, -20);
  assert.equal(result.hitBoxes[0]!.x2, 50);
  assert.equal(result.hitBoxes[0]!.y2, 10);
  assert.equal(result.hitBoxes[0]!.z2, 20);
  assert.equal(result.hitBoxes[1]!.frameStart, 1);
}

// Test 6: Damage boxes are NOT included in hitBoxes (only attack boxes)
{
  const frame = buildFrame({
    damageBoxes: [[-10, -10, -10, 10, 10, 10]],
    attackBoxes: [[-50, -50, -50, 50, 50, 50]],
  });
  const buf = buildAni({ framesCount: 1, sprites: ["Test/Mixed.img"], frameData: frame });
  const result = AniAnalyzer.parse(buf);

  assert.equal(result.hitBoxes.length, 1);
  assert.equal(result.hitBoxes[0]!.x1, -50);
}

// Test 7: Multiple sprites, first one used as imgPath
{
  const frame = buildFrame({});
  const buf = buildAni({
    framesCount: 1,
    sprites: ["First/Sprite.img", "Second/Sprite.img", "Third/Sprite.img"],
    frameData: frame,
  });
  const result = AniAnalyzer.parse(buf);

  assert.equal(result.imgPath, "first/sprite.img");
}

// Test 8: Script.pvf cross-reference (if available)
{
  let pvfAvailable = false;
  const PVF_PATH = "D:/BaiduNetdiskDownload/DNF客户端（2018年2月更新）/地下城与勇士/Script.pvf";
  try {
    readFileSync(PVF_PATH);
    pvfAvailable = true;
  } catch {}

  if (pvfAvailable) {
    const pvfBuf = readFileSync(PVF_PATH);
    const p = PvfParser.parse(pvfBuf);
    const aniPath = "character/swordman/animation/weaponcomboblade4.ani";
    const result = AniAnalyzer.extractAndParse(pvfBuf, p, aniPath);

    assert.ok(result, "extractAndParse should return result for known .ani");
    assert.ok(result!.imgPath.length > 0, "Should have non-empty imgPath");
    assert.equal(result!.sourcePath, aniPath);
  }
}

console.log("PASS: ani-analyzer tests (8/8)");
