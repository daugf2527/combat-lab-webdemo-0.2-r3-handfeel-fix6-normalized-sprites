import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";
import { buildBrowserSmokePayload } from "../../scripts/browser-smoke-evidence.mjs";

type DiagnosticBag = {
  consoleErrors: string[];
  pageErrors: string[];
  failedRequests: unknown[];
  badResponses: unknown[];
};

const verificationDir = path.resolve("verification");

function attachDiagnostics(page: Page): DiagnosticBag {
  const diagnostics: DiagnosticBag = {
    consoleErrors: [],
    pageErrors: [],
    failedRequests: [],
    badResponses: [],
  };

  page.on("console", (msg) => {
    if (msg.type() === "error") diagnostics.consoleErrors.push(msg.text());
  });
  page.on("pageerror", err => diagnostics.pageErrors.push(err.message));
  page.on("requestfailed", request => diagnostics.failedRequests.push({
    url: request.url(),
    method: request.method(),
    resourceType: request.resourceType(),
    failure: request.failure()?.errorText ?? "unknown",
  }));
  page.on("response", response => {
    if (response.status() < 400) return;
    diagnostics.badResponses.push({
      url: response.url(),
      status: response.status(),
      statusText: response.statusText(),
    });
  });

  return diagnostics;
}

async function collectRuntimeEvidence(page: Page): Promise<unknown> {
  return await page.evaluate(() => {
    const runtime = (window as any).combatLab ?? {};
    const exportedEvidence = runtime.evidence?.export?.();
    if (exportedEvidence) return exportedEvidence;

    const kernel = runtime.kernel;
    const replay = kernel?.replay?.export?.() ?? null;
    const events = Array.isArray(kernel?.bus?.archive) ? kernel.bus.archive : [];
    const eventTypes: Record<string, number> = {};
    for (const event of events) {
      const type = event?.type ?? "unknown";
      eventTypes[type] = (eventTypes[type] ?? 0) + 1;
    }

    return {
      buildHash: runtime.evidence?.buildHash ?? replay?.metadata?.buildHash ?? null,
      assets: runtime.evidence?.assets ?? { expected: [], loaded: [], failed: [], missingKeys: [] },
      combat: {
        ...(runtime.evidence?.combat ?? {}),
        sceneReady: Boolean(runtime.scene),
        tick: kernel?.tickCount ?? null,
        eventCount: events.length,
        scenario: kernel?.scenario ?? null,
        replay: replay
          ? {
            metadata: replay.metadata,
            frameCount: replay.frameCount,
          }
          : null,
        finalStateHash: replay?.metadata?.finalStateHash ?? null,
        combatSchemaHash: replay?.metadata?.combatSchemaHash ?? null,
        eventTypes,
      },
      dynamicManifests: [],
    };
  });
}

test("combat scene boots, runs deterministic scenario, and exports runtime evidence", async ({ page }, testInfo) => {
  const diagnostics = attachDiagnostics(page);
  const results: { check: string; passed: boolean; [key: string]: unknown }[] = [];
  let passed = true;
  let runtimeEvidence: unknown = {};

  const record = (check: string, ok: boolean, extra: Record<string, unknown> = {}) => {
    results.push({ check, passed: ok, ...extra });
    if (!ok) passed = false;
  };

  mkdirSync(verificationDir, { recursive: true });

  await page.goto("/", { waitUntil: "domcontentloaded" });
  record("page_loaded", true);

  await expect(page.locator("canvas")).toBeVisible();
  record("canvas_present", true);

  await page.keyboard.press("Enter");
  await page.waitForFunction(() => Boolean((window as any).combatLab?.scene && (window as any).combatLab?.kernel));
  record("combat_scene_ready", true);

  await page.screenshot({ path: path.join(verificationDir, "browser-smoke.png") });
  record("screenshot_captured", true);

  await page.evaluate(() => {
    const runtime = (window as any).combatLab;
    runtime?.scene?.runScenario?.();
  });
  await page.waitForTimeout(500);

  const scenarioPath = path.join(verificationDir, "scenario-screenshot.png");
  await page.screenshot({ path: scenarioPath });
  const pixelHash = createHash("sha256").update(readFileSync(scenarioPath)).digest("hex").slice(0, 16);
  record("scenario_screenshot", true, { pixelHash });

  runtimeEvidence = await collectRuntimeEvidence(page);
  writeFileSync(path.join(verificationDir, "runtime-evidence.json"), JSON.stringify(runtimeEvidence, null, 2));

  const evidence = runtimeEvidence as {
    assets?: { missingKeys?: string[]; failed?: unknown[] };
    combat?: { sceneReady?: boolean; finalStateHash?: string | null };
  };
  const runtimePassed = Boolean(evidence.combat?.sceneReady)
    && Boolean(evidence.combat?.finalStateHash)
    && (evidence.assets?.missingKeys?.length ?? 0) === 0
    && (evidence.assets?.failed?.length ?? 0) === 0;
  record("runtime_evidence", runtimePassed, {
    sceneReady: evidence.combat?.sceneReady ?? false,
    finalStateHash: evidence.combat?.finalStateHash ?? null,
    missingAssetKeys: evidence.assets?.missingKeys ?? [],
    failedAssets: evidence.assets?.failed ?? [],
  });

  const diagnosticsClean = diagnostics.consoleErrors.length === 0
    && diagnostics.pageErrors.length === 0
    && diagnostics.failedRequests.length === 0
    && diagnostics.badResponses.length === 0;
  record("diagnostics_clean", diagnosticsClean, { diagnostics });

  const payload = buildBrowserSmokePayload({
    passed,
    url: page.url(),
    timestamp: new Date().toISOString(),
    results,
    runtimeEvidence,
    diagnostics,
  });
  writeFileSync(path.join(verificationDir, "browser-smoke.json"), JSON.stringify(payload, null, 2));
  await testInfo.attach("runtime-evidence", { path: path.join(verificationDir, "runtime-evidence.json"), contentType: "application/json" });
  await testInfo.attach("browser-smoke", { path: path.join(verificationDir, "browser-smoke.json"), contentType: "application/json" });

  expect(diagnostics.consoleErrors, "console errors").toEqual([]);
  expect(diagnostics.pageErrors, "page errors").toEqual([]);
  expect(diagnostics.failedRequests, "failed requests").toEqual([]);
  expect(diagnostics.badResponses, "bad responses").toEqual([]);
  expect(runtimePassed).toBe(true);
});
