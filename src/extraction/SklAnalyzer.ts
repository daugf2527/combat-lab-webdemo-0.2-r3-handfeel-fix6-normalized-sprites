// SklAnalyzer — Semantic analyzer for .skl bytecode files.
// Parses the flat PvfScriptCommand stream into structured SklSkillDef objects.
//
// The .skl bytecode format (parsed by PvfScriptParser) is a flat stream of
// 5-byte commands: [1B typeFlag][4B data]. This analyzer groups them into
// sections and extracts identifiable skill properties.
//
// Current coverage: section grouping, ani file reference extraction,
// string resolution, basic property collection. Full field mapping
// requires community PVF documentation and is a Batch C task.

import { PvfScriptParser } from "./PvfScriptParser.js";
import type { PvfScriptCommand, PvfScriptFile, SklSkillDef } from "./types.js";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);

/** Known skill property command IDs (from community PVF documentation).
 *  These are the command values that appear after section markers
 *  in .skl files. When stringBinMap is available, command values are resolved
 *  to strings and matched against KNOWN_PROPERTY_NAMES instead. */
const KNOWN_PROPERTY_IDS: Record<number, string> = {
  0x00: "skillId",
  0x01: "jobId",
  0x02: "level",
  0x03: "maxLevel",
  0x04: "coolTime",
  0x05: "castTime",
  0x06: "consumeMp",
  0x07: "cubeCost",
  0x08: "commandInput",
  0x09: "iconIndex",
  0x0A: "aniIndex",
  0x10: "skillType",
  0x11: "damageType",
  0x12: "elementType",
  0x20: "castAni",
  0x21: "hitAni",
  0x22: "effectAni",
};

/** String-based property name matching (used when stringBinMap resolves command values).
 *  Keys are lowercased resolved strings from stringBinMap. */
const KNOWN_PROPERTY_NAMES: Record<string, string> = {
  "(down)": "commandInput",
  "(up)": "commandInput",
  "(left)": "commandInput",
  "(right)": "commandInput",
  "(skill)": "commandInput",
  "(attack)": "commandInput",
  "(jump)": "commandInput",
};

/** Section tag names that map to skill properties.
 *  When a section tag is encountered, the next int/string value is the property value. */
const SECTION_PROPERTY_MAP: Record<string, string> = {
  "[name]": "name",
  "[name2]": "name2",
  "[maximum level]": "maxLevel",
  "[required level]": "requiredLevel",
  "[type]": "skillType",
  "[skill class]": "skillClass",
  "[icon]": "iconIndex",
  "[growtype maximum level]": "growtypeMaxLevel",
  "[purchase cost]": "purchaseCost",
};

/** Section IDs found in cancel*.skl files (reverse-engineered from DNF Script.pvf,
 *  2026-05). These are raw stringBinMap indices. When resolved:
 *  - 371543 → "[purchase cost]" (used as cancel window start in cancel files)
 *  - 241483 → "[required level]" (used as cancel window duration in cancel files)
 *  - 371546 → "[skill class]" (used as cancel group in cancel files)
 *  - 371547 → "[growtype maximum level]" (used as cancel weapon mask in cancel files)
 *  - 371549 → "[skill fitness growtype]" (used as cancel target slots in cancel files)
 *  Note: These section tags have dual meaning — in regular .skl files they are
 *  standard skill properties; in cancel*.skl files the int values following them
 *  encode cancel window parameters. Detection relies on file path containing "cancel". */
const CANCEL_SECTION_IDS: Record<number, string> = {
  371543: "cancelWindowStart",
  241483: "cancelWindowDuration",
  371546: "cancelGroup",
  371547: "cancelWeaponMask",
  371549: "cancelTargetSlots",
};

/** Extract potential .ani file references from command streams.
 *  Matches patterns like "character/swordman/effect/animation/..." */
function looksLikeAniPath(value: string): boolean {
  return /\.(ani|img|act|ptl)$/i.test(value)
    || /\/animation\//i.test(value)
    || /^sprite\//i.test(value)
    || /^character\//i.test(value);
}

export class SklAnalyzer {
  /**
   * Analyze a parsed .skl file and extract structured skill data.
   *
   * @param scriptFile — parsed output from PvfScriptParser.parse()
   * @param stringTable — optional string lookup map (index → text)
   * @param sourcePath — source file path for provenance
   */
  static analyze(
    scriptFile: PvfScriptFile,
    stringTable?: Map<number, string>,
    sourcePath?: string,
    stringBinMap?: string[],
    stringStringMap?: Map<string, string>,
  ): SklSkillDef {
    const commands = scriptFile.commands;
    const unverifiedFields: string[] = [];
    const aniFileRefs: string[] = [];
    const props: Record<string, number | string> = {};
    let currentSection = 0;
    const cancelProps: Record<string, number> = {};

    // Helper: resolve a raw command value through stringBinMap if available
    const resolveStr = (rawValue: number): string | undefined => {
      if (stringBinMap && rawValue < stringBinMap.length) {
        return stringBinMap[rawValue] || undefined;
      }
      return undefined;
    };

    for (let i = 0; i < commands.length; i++) {
      const cmd = commands[i]!;

      switch (cmd.type) {
        case "section": {
          if (typeof cmd.value !== "number") break;
          currentSection = cmd.value;
          // Check cancel section IDs (matched on raw index, only meaningful in cancel files)
          const cancelField = CANCEL_SECTION_IDS[cmd.value];
          if (cancelField && i + 1 < commands.length) {
            const nextCmd = commands[i + 1]!;
            if ((nextCmd.type === "int" || nextCmd.type === "intEx") && typeof nextCmd.value === "number") {
              cancelProps[cancelField] = nextCmd.value;
            }
          }
          // Resolve section tag name and extract property values
          const sectionTag = resolveStr(cmd.value);
          if (sectionTag) {
            const sectionProp = SECTION_PROPERTY_MAP[sectionTag];
            if (sectionProp && i + 1 < commands.length) {
              const nextCmd = commands[i + 1]!;
              if (nextCmd.type === "int" || nextCmd.type === "intEx") {
                props[sectionProp] = nextCmd.value as number;
              } else if (nextCmd.type === "string" && typeof nextCmd.value === "number") {
                const strVal = resolveStr(nextCmd.value) ?? String(nextCmd.value);
                props[sectionProp] = strVal;
              } else if (nextCmd.type === "stringLinkIndex" && typeof nextCmd.value === "number") {
                const idx = nextCmd.value;
                if (stringBinMap && idx < stringBinMap.length) {
                  const key = stringBinMap[idx]!;
                  props[sectionProp] = stringStringMap?.get(key) ?? key;
                }
              }
            }
          }
          break;
        }

        case "command": {
          if (typeof cmd.value !== "number") break;
          // Resolve command value: try stringBinMap first, fall back to hex ID table
          const resolvedName = resolveStr(cmd.value);
          const propName = (resolvedName && KNOWN_PROPERTY_NAMES[resolvedName])
            ?? KNOWN_PROPERTY_IDS[cmd.value]
            ?? (resolvedName || `cmd_0x${cmd.value.toString(16).padStart(2, "0")}`);

          if (!KNOWN_PROPERTY_NAMES[resolvedName ?? ""] && !KNOWN_PROPERTY_IDS[cmd.value]) {
            unverifiedFields.push(propName);
          }

          if (i + 1 < commands.length) {
            const nextCmd = commands[i + 1]!;
            if (nextCmd.type === "int" || nextCmd.type === "intEx") {
              props[propName] = nextCmd.value as number;
            } else if (nextCmd.type === "float") {
              props[propName] = nextCmd.value as number;
            } else if (nextCmd.type === "string") {
              // type=7 value is a stringBinMap index
              const strVal = resolveStr(nextCmd.value as number) ?? String(nextCmd.value);
              props[propName] = strVal;
              if (looksLikeAniPath(strVal)) {
                aniFileRefs.push(strVal);
              }
            } else if (nextCmd.type === "stringLinkIndex") {
              const idx = nextCmd.value as number;
              if (stringBinMap && idx < stringBinMap.length) {
                const key = stringBinMap[idx]!;
                const resolved = stringStringMap?.get(key) ?? key;
                if (resolved) {
                  props[propName] = resolved;
                  if (looksLikeAniPath(resolved)) {
                    aniFileRefs.push(resolved);
                  }
                }
              } else if (stringTable) {
                const resolved = stringTable.get(idx);
                if (resolved) {
                  props[propName] = resolved;
                  if (looksLikeAniPath(resolved)) {
                    aniFileRefs.push(resolved);
                  }
                }
              }
            }
          }
          break;
        }

        case "stringLink":
          if (typeof cmd.value === "number" && stringBinMap && cmd.value < stringBinMap.length) {
            const key = stringBinMap[cmd.value]!;
            const resolved = stringStringMap?.get(key) ?? key;
            if (resolved && looksLikeAniPath(resolved)) {
              aniFileRefs.push(resolved);
            }
          } else if (typeof cmd.value === "number" && stringTable) {
            const resolved = stringTable.get(cmd.value);
            if (resolved && looksLikeAniPath(resolved)) {
              aniFileRefs.push(resolved);
            }
          }
          break;

        case "string":
          // type=7 value is a stringBinMap index — resolve it
          if (typeof cmd.value === "number") {
            const resolved = resolveStr(cmd.value);
            if (resolved && looksLikeAniPath(resolved)) {
              aniFileRefs.push(resolved);
            }
          } else if (typeof cmd.value === "string" && looksLikeAniPath(cmd.value)) {
            aniFileRefs.push(cmd.value);
          }
          break;
      }
    }

    // Build the skill definition
    const name = (props["name"] as string)
      ?? stringTable?.get(props["skillId"] as number)
      ?? (sourcePath ? sourcePath.replace(/^.*[\\/]skill_[^_]+_/, "").replace(/\.skl$/, "") : undefined);

    // Build cancel window if any cancel props were found
    const cancelWindow = (cancelProps["cancelWindowStart"] !== undefined || cancelProps["cancelWindowDuration"] !== undefined)
      ? {
          startFrame: cancelProps["cancelWindowStart"],
          duration: cancelProps["cancelWindowDuration"],
          group: cancelProps["cancelGroup"],
          weaponMask: cancelProps["cancelWeaponMask"],
          targetSlots: cancelProps["cancelTargetSlots"],
        }
      : undefined;

    return {
      skillId: (props["skillId"] as number) ?? 0,
      name,
      jobId: props["jobId"] as number | undefined,
      coolTimeMs: props["coolTime"] as number | undefined,
      castTimeMs: props["castTime"] as number | undefined,
      consumeMp: props["consumeMp"] as number | undefined,
      cubeCost: props["cubeCost"] as number | undefined,
      maxLevel: props["maxLevel"] as number | undefined,
      cancelWindow,
      aniFileRefs: [...new Set(aniFileRefs)],
      sourcePath,
      commandCount: commands.length,
      magicValid: scriptFile.magicValid,
      unverifiedFields: unverifiedFields.length > 0
        ? [...new Set(unverifiedFields)]
        : undefined,
    };
  }

  /**
   * Load and parse a .skl file buffer, then analyze it.
   * Convenience method combining PvfScriptParser.parse() + analyze().
   */
  static parseAndAnalyze(
    buf: Buffer,
    stringTable?: Map<number, string>,
    sourcePath?: string,
    stringBinMap?: string[],
    stringStringMap?: Map<string, string>,
  ): SklSkillDef {
    const scriptFile = PvfScriptParser.parse(buf);
    return SklAnalyzer.analyze(scriptFile, stringTable, sourcePath, stringBinMap, stringStringMap);
  }

  /**
   * Build a string lookup table from extracted stringtable.bin and n_string.lst data.
   *
   * @param stringTableBuf — raw stringtable.bin buffer
   * @param nStringLstBuf — raw n_string.lst buffer (binary bytecode format)
   * @returns Map of index → resolved string value
   */
  static buildStringTable(
    stringTableBuf: Buffer,
    nStringLstBuf: Buffer,
    extractFileContent?: (path: string) => Buffer | undefined,
  ): { stringBinMap: string[]; stringStringMap: Map<string, string> } {
    // Phase 1: parse stringtable.bin → stringBinMap (index → string)
    const entries = PvfScriptParser.parseStringTable(stringTableBuf);
    let maxIdx = 0;
    for (const e of entries) {
      if (e.index > maxIdx) maxIdx = e.index;
    }
    const stringBinMap: string[] = new Array(maxIdx + 1).fill("");
    for (const e of entries) {
      stringBinMap[e.index] = e.string;
    }

    // Phase 2: parse n_string.lst → get .kor.str file paths
    const nStringRefs = PvfScriptParser.parseNStringLst(nStringLstBuf, stringBinMap);

    // Phase 3: resolve .kor.str files into stringStringMap (key → localized value)
    const stringStringMap = new Map<string, string>();

    if (extractFileContent) {
      for (const [, filePath] of nStringRefs) {
        if (!filePath || !filePath.endsWith(".str")) continue;
        try {
          const content = extractFileContent(filePath);
          if (!content) continue;
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          const iconv = require("iconv-lite");
          const text: string = iconv.decode(content, "cp949");
          const lines = text.split(/\r?\n/);
          for (const line of lines) {
            const gtPos = line.indexOf(">");
            if (gtPos > 0) {
              const key = line.substring(0, gtPos).trim();
              const val = line.substring(gtPos + 1).trim();
              if (key && val) {
                stringStringMap.set(key, val);
              }
            }
          }
        } catch {
          // Skip unreadable .str files
        }
      }
    }

    return { stringBinMap, stringStringMap };
  }

  /**
   * Build a simple index→string Map from stringBinMap for backward compatibility.
   */
  static buildStringLookup(
    stringTableBuf: Buffer,
  ): Map<number, string> {
    const result = new Map<number, string>();
    const entries = PvfScriptParser.parseStringTable(stringTableBuf);
    for (const entry of entries) {
      result.set(entry.index, entry.string);
    }
    return result;
  }
}
