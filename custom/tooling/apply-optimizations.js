/*
 * PAKE v4 conservative WebView policy.
 * Intentionally does not rewrite upstream window.rs or add Chromium flags.
 * Keep this script idempotent and safe to run in CI.
 */
import fs from "node:fs";

const candidates = [
  "src-tauri/src/app/window.rs",
  "src-tauri/src/app/window/mod.rs"
];
const found = candidates.find(path => fs.existsSync(path));

if (!found) {
  console.log("[PAKE v4] Tauri window source not found; no upstream files changed.");
} else {
  const source = fs.readFileSync(found, "utf8");
  const riskyFlags = [
    "--disable-site-isolation-trials",
    "--renderer-process-limit",
    "--in-process-gpu",
    "--disable-features=.*AudioServiceSandbox",
    "--disable-features=.*BackForwardCache",
    "--js-flags=.*expose-gc"
  ];
  const detected = riskyFlags.filter(flag => new RegExp(flag).test(source));
  if (detected.length) {
    console.warn("[PAKE v4] Review potentially risky WebView flags in", found, detected);
  } else {
    console.log("[PAKE v4] No known risky WebView flags detected in", found);
  }
  console.log("[PAKE v4] No source patch applied. Preserve upstream defaults for sandbox, process isolation, GPU, audio and DRM.");
}
