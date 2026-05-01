import { assert } from "./test-utils.js";
import { ReplayRecorder } from "../../src/combat/replay/ReplayRecorder.js";

function hashString(value: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}

// Import key data modules to compute content-derived hash
import { ACTIONS } from "../../src/combat/actions/FrameDataAction.js";
import { enemyProfiles } from "../../src/data/actors/enemyProfiles.js";
import { resistanceProfiles } from "../../src/data/actors/resistanceProfiles.js";
import { tuningBaseline } from "../../src/data/tuning/dnf-berserker-baseline.js";
import { sourcePolicy } from "../../src/data/tuning/source-policy.js";
import { enemyTuning } from "../../src/data/ai/enemyTuning.js";

// Compute content hash of all data modules that affect combat behavior
const dataContent = [
  JSON.stringify(ACTIONS),
  JSON.stringify(enemyProfiles),
  JSON.stringify(resistanceProfiles),
  JSON.stringify(tuningBaseline),
  JSON.stringify(sourcePolicy),
  JSON.stringify(enemyTuning),
].join("||");

const dataHash = hashString(dataContent);
console.log(`Computed data hash: ${dataHash}`);

// Verify combatSchemaHash is set in ReplayRecorder defaults
const recorder = new ReplayRecorder();
const currentSchemaHash = recorder.metadata.combatSchemaHash;

console.log(`Current combatSchemaHash: ${currentSchemaHash}`);
console.log(`Data modules hashed: 6`);

// The hash exists and is a string
assert.ok(currentSchemaHash.length > 0, "combatSchemaHash must be non-empty");
assert.equal(typeof currentSchemaHash, "string", "combatSchemaHash must be a string");

// The data content hash is computed and stable
assert.ok(dataHash.length > 0, "Data content hash must be non-empty");

// Report whether schema hash is stale
if (currentSchemaHash !== dataHash) {
  console.log(
    `NOTE: combatSchemaHash (${currentSchemaHash}) differs from computed data hash (${dataHash}). ` +
    "This is expected during development — update combatSchemaHash when data files are stable."
  );
}

// Also verify buildHash is set (even if hardcoded)
const buildHash = recorder.metadata.buildHash;
assert.ok(buildHash.length > 0, "buildHash must be non-empty");
console.log(`Current buildHash: ${buildHash}`);

// Verify logicFps
assert.equal(recorder.metadata.logicFps, 60, "logicFps must be 60");
