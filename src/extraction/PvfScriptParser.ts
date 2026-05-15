// PvfScriptParser — bytecode script parser for DNF PVF .skl files.
// Parses the .skl bytecode format (magic 0xB0 0xD0, 9 script types),
// equipment.lst, and stringtable.bin / n_string.lst.
//
// Pure TypeScript, depends only on ByteReader and types.

import { ByteReader } from "./ByteReader.js";
import type { PvfScriptCommand, PvfScriptFile, PvfScriptType, EquipmentDefinition } from "./types.js";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);

/** Magic bytes for .skl files. */
const SKL_MAGIC_B0 = 0xb0;
const SKL_MAGIC_D0 = 0xd0;

/** Script type flag → type name mapping (from chunk.md). */
const SCRIPT_TYPE_MAP: Record<number, PvfScriptType> = {
  2: "int",
  3: "intEx",
  4: "float",
  5: "section",
  6: "command",
  7: "string",
  8: "commandSeparator",
  9: "stringLinkIndex",
  10: "stringLink",
};

export class PvfScriptParser {
  /**
   * Parse a .skl file's bytecode into structured script chunks.
   */
  static parse(buf: Buffer): PvfScriptFile {
    const reader = new ByteReader(buf);

    if (reader.remaining < 2) {
      return { magicValid: false, commands: [] };
    }

    // Verify magic bytes 0xB0 0xD0
    const b0 = reader.readUint8();
    const b1 = reader.readUint8();
    const magicValid = b0 === SKL_MAGIC_B0 && b1 === SKL_MAGIC_D0;

    const commands: PvfScriptCommand[] = [];

    // Parse alternating 1B type flag + 4B data value
    while (reader.remaining >= 5) {
      const typeFlag = reader.readUint8();
      const dataStart = reader.position;
      const rawData = reader.readBytes(4);
      const dataValue = new DataView(rawData.buffer, rawData.byteOffset, 4).getUint32(0, true);

      const type = SCRIPT_TYPE_MAP[typeFlag] ?? `unknown(${typeFlag})`;

      let value: number | string = dataValue;

      // For float type, interpret as 32-bit float
      if (typeFlag === 4) {
        value = Number(new DataView(rawData.buffer, rawData.byteOffset, 4).getFloat32(0, true).toFixed(6));
      }

      commands.push({
        type: type as PvfScriptType,
        value,
        raw: { typeFlag, data: new Uint8Array(rawData) },
      });
    }

    // Handle remaining bytes (< 5) — incomplete command at end
    if (reader.remaining > 0) {
      // Skip trailing partial bytes silently
    }

    return { magicValid, commands };
  }

  /**
   * Parse equipment.lst into structured equipment definitions.
   * Equipment.lst uses a line-based format: "id\tname\ttype\tgrade\tstat1=val1\tstat2=val2..."
   */
  static parseEquipmentLst(buf: Buffer): EquipmentDefinition[] {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const iconv = require("iconv-lite");
    const text = iconv.decode(buf, "cp949");
    const lines = text.split(/\r?\n/);
    const equipment: EquipmentDefinition[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("//") || trimmed.startsWith("#")) continue;

      const parts = trimmed.split("\t");
      if (parts.length < 4) continue;

      const id = parseInt(parts[0]!, 10);
      if (isNaN(id)) continue;

      const name = parts[1] ?? "";
      const type = parts[2] ?? "";
      const grade = parts[3] ?? "";
      const stats: Record<string, number> = {};

      // Parse remaining tab-separated stats (key=value format)
      for (let i = 4; i < parts.length; i++) {
        const statPart = parts[i] ?? "";
        const eqIdx = statPart.indexOf("=");
        if (eqIdx > 0) {
          const key = statPart.substring(0, eqIdx).trim();
          const val = parseFloat(statPart.substring(eqIdx + 1).trim());
          if (!isNaN(val)) {
            stats[key] = val;
          }
        }
      }

      equipment.push({ id, name, type, grade, stats });
    }

    return equipment;
  }

  /**
   * Parse stringtable.bin into index ranges with decoded string data.
   *
   * stringtable.bin structure (reverse-engineered from DNF Script.pvf):
   *   [4B] count (uint32 LE)
   *   [8B × count] index entries: start (uint32) + end (uint32)
   *   [variable] string data block
   *
   * The index offsets are relative to the string data block start
   * (= 4 + count*8). Each pair [start, end) delimits one EUC-KR
   * encoded string in the data block.
   *
   * Returns an array of { index, string } for every valid entry.
   */
  static parseStringTable(buf: Buffer): Array<{ index: number; string: string }> {
    if (buf.length < 4) return [];

    const count = buf.readUInt32LE(0);

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const iconv = require("iconv-lite");

    const results: Array<{ index: number; string: string }> = [];

    for (let i = 0; i < count; i++) {
      const startPos = buf.readUInt32LE(i * 4 + 4);
      const endPos = buf.readUInt32LE(i * 4 + 8);
      const len = endPos - startPos;

      if (len <= 0 || len > 10000) continue;

      const absStart = startPos + 4;
      const absEnd = absStart + len;

      if (absStart < 0 || absEnd > buf.length || absStart >= buf.length) continue;

      try {
        const slice = buf.subarray(absStart, absEnd);
        let decoded = iconv.decode(Buffer.from(slice), "cp949").replace(/\x00/g, "");
        decoded = decoded.toLowerCase().trim();
        if (decoded.length > 0) {
          results.push({ index: i, string: decoded });
        }
      } catch {
        // Skip undecodable entries
      }
    }

    return results;
  }

  /**
   * Parse n_string.lst — note this file is binary .skl bytecode format
   * (magic 0xB0 0xD0), NOT a plain-text .lst file. We parse it as a
   * PvfScriptFile and extract key-value pair mappings.
   *
   * Returns a Map of string table index → Map<key, value> pairs.
   */
  static parseNStringLst(buf: Buffer, stringBinMap?: string[]): Map<number, string> {
    const result = new Map<number, string>();
    if (buf.length < 2) return result;

    const magic = buf.readUInt16LE(0);
    if (magic !== 53424) return result;

    for (let i = 2; i < buf.length; i += 10) {
      if (buf.length - i < 10) break;
      const stringIdx = buf.readUInt32LE(i + 6);
      if (stringBinMap && stringIdx < stringBinMap.length) {
        const filePath = stringBinMap[stringIdx]!;
        if (filePath) {
          result.set(stringIdx, filePath);
        }
      }
    }

    return result;
  }
}
