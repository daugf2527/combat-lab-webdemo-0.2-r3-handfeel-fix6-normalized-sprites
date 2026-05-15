// AniAnalyzer — Binary parser for DNF .ani animation files.
// Based on flwmxd/DNF-Porting PvfAnimation.cpp reference implementation.
//
// .ani files are compiled binary format stored inside Script.pvf.
// They define per-frame hitbox regions, sprite references, and animation properties.
//
// Binary format (from reference implementation):
//   [2B] framesCount (uint16)
//   [2B] resourceCount (uint16)
//   for each resource:
//     [4B] stringLength (int32)
//     [N]  sprite path (ASCII)
//   [2B] globalParamCount (uint16)
//   for each global param:
//     [2B] type (AnimationNodeType)
//     [variable] value
//   for each frame:
//     [2B] boxCount (uint16)
//     for each box:
//       [2B] type (14=DAMAGE_BOX, 15=ATTACK_BOX)
//       [6×4B] int32 coords (x1,y1,z1,x2,y2,z2)
//     [2B] imgId (uint16)
//     [2B] imgParam (uint16)
//     [4B] x offset (int32)
//     [4B] y offset (int32)
//     [2B] propertyCount (uint16)
//     for each property:
//       [2B] type (AnimationNodeType)
//       [variable] value based on type

import { ByteReader } from "./ByteReader.js";
import type { AniDef, AniHitBox, PvfContainer } from "./types.js";
import { PvfParser } from "./PvfParser.js";

const DAMAGE_BOX = 14;
const ATTACK_BOX = 15;

enum AniNodeType {
  LOOP = 0,
  SHADOW = 1,
  COORD = 3,
  IMAGE_RATE = 7,
  IMAGE_ROTATE = 8,
  RGBA = 9,
  INTERPOLATION = 10,
  GRAPHIC_EFFECT = 11,
  DELAY = 12,
  DAMAGE_TYPE = 13,
  PLAY_SOUND = 16,
  PRELOAD = 17,
  SET_FLAG = 23,
  FLIP_TYPE = 24,
  LOOP_START = 25,
  LOOP_END = 26,
  CLIP = 27,
}

export class AniAnalyzer {
  static parse(buf: Buffer, sourcePath?: string): AniDef {
    const parseWarnings: string[] = [];
    const rawSections: Array<{ type: string; offset: number; size: number }> = [];
    const hitBoxes: AniHitBox[] = [];

    if (buf.length < 4) {
      return { imgPath: "", totalFrames: 0, hitBoxes: [], rawSections: [], sourcePath, parseWarnings: ["File too small"] };
    }

    const reader = new ByteReader(buf);
    let sprites: string[] = [];

    try {
      // Header
      const framesCount = reader.readUint16();
      const resourceCount = reader.readUint16();

      // Read sprite resource paths
      for (let i = 0; i < resourceCount; i++) {
        const strLen = reader.readInt32();
        if (strLen <= 0 || strLen > 1024) {
          parseWarnings.push(`Invalid resource string length: ${strLen}`);
          break;
        }
        const pathBytes = reader.readBytes(strLen);
        sprites.push(Buffer.from(pathBytes).toString("ascii").toLowerCase().replace(/\x00/g, ""));
      }

      // Global animation params
      const globalParamCount = reader.readUint16();
      for (let j = 0; j < globalParamCount; j++) {
        const type = reader.readUint16();
        AniAnalyzer.skipParamValue(reader, type);
      }

      // Parse each frame
      for (let i = 0; i < framesCount; i++) {
        if (reader.remaining < 2) break;

        // Boxes (damage/attack)
        const boxCount = reader.readUint16();
        for (let j = 0; j < boxCount; j++) {
          if (reader.remaining < 26) break;
          const boxType = reader.readUint16();
          const coords: number[] = [];
          for (let m = 0; m < 6; m++) {
            coords.push(reader.readInt32());
          }
          if (boxType === ATTACK_BOX) {
            hitBoxes.push({
              shape: "rect",
              frameStart: i,
              frameEnd: i,
              x1: coords[0]!, y1: coords[1]!, z1: coords[2]!,
              x2: coords[3]!, y2: coords[4]!, z2: coords[5]!,
            });
          }
        }

        if (reader.remaining < 12) break;

        // imgId, imgParam, x, y
        reader.readUint16(); // imgId
        reader.readUint16(); // imgParam
        reader.readInt32();  // x offset
        reader.readInt32();  // y offset

        // Per-frame properties
        if (reader.remaining < 2) break;
        const propertyCount = reader.readUint16();
        for (let m = 0; m < propertyCount; m++) {
          if (reader.remaining < 2) break;
          const propType = reader.readUint16();
          AniAnalyzer.skipParamValue(reader, propType);
        }
      }
    } catch (e: unknown) {
      parseWarnings.push(`Parse error: ${e instanceof Error ? e.message : String(e)}`);
    }

    const imgPath = sprites.length > 0 ? sprites[0]! : "";

    return {
      imgPath,
      totalFrames: hitBoxes.length > 0 ? Math.max(...hitBoxes.map(h => h.frameEnd)) + 1 : 0,
      hitBoxes,
      rawSections,
      sourcePath,
      parseWarnings,
    };
  }

  private static skipParamValue(reader: ByteReader, type: number): void {
    switch (type) {
      case AniNodeType.LOOP:
      case AniNodeType.SHADOW:
      case AniNodeType.INTERPOLATION:
        reader.readUint8();
        break;
      case AniNodeType.COORD:
        reader.readUint16();
        break;
      case AniNodeType.IMAGE_RATE:
        reader.readFloat32(); reader.readFloat32();
        break;
      case AniNodeType.IMAGE_ROTATE:
        reader.readInt32();
        break;
      case AniNodeType.RGBA:
        reader.readUint32();
        break;
      case AniNodeType.GRAPHIC_EFFECT: {
        const itemType = reader.readUint16();
        if (itemType === 5) { // MONOCHROME
          reader.readUint8(); reader.readUint8(); reader.readUint8();
        } else if (itemType === 6) { // SPACEDISTORT
          reader.readUint16(); reader.readUint16();
        }
        break;
      }
      case AniNodeType.DELAY:
        reader.readInt32();
        break;
      case AniNodeType.DAMAGE_TYPE:
        reader.readUint16();
        break;
      case AniNodeType.PLAY_SOUND: {
        const sLen = reader.readInt32();
        if (sLen > 0 && sLen < reader.remaining) reader.readBytes(sLen);
        break;
      }
      case AniNodeType.PRELOAD:
        break;
      case AniNodeType.SET_FLAG:
        reader.readInt32();
        break;
      case AniNodeType.FLIP_TYPE:
        reader.readUint16();
        break;
      case AniNodeType.LOOP_START:
        break;
      case AniNodeType.LOOP_END:
        reader.readInt32();
        break;
      case AniNodeType.CLIP:
        reader.readInt16(); reader.readInt16(); reader.readInt16(); reader.readInt16();
        break;
      default:
        // Unknown types: types 2,4,5,6,14,15,18,19,20,21,22 have no extra data
        break;
    }
  }

  static extractAndParse(pvfBuf: Buffer, container: PvfContainer, aniPath: string): AniDef | undefined {
    const data = PvfParser.extractFile(pvfBuf, container, aniPath);
    if (!data) return undefined;
    return AniAnalyzer.parse(data, aniPath);
  }
}
