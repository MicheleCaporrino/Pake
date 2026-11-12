/*
 * PAKE v5 build policy — idempotente, fail-soft sul patch, fail-hard solo sugli input.
 * Env: PAKE_PROFILE = lean | fluid   (default lean)
 *      PAKE_INJECT  = lista file separati da virgola (la stessa passata a --inject)
 * lean : nessun patch, nessun flag extra (minima RAM, comportamento upstream).
 * fluid: aggiunge solo flag GPU conservativi agli argomenti WebView2 esistenti (se trovati).
 */
import fs from "node:fs";

const profile = (process.env.PAKE_PROFILE || "lean").toLowerCase();
const inject = (process.env.PAKE_INJECT || "").split(",").map(s => s.trim()).filter(Boolean);
const FLUID_FLAGS = ["--enable-gpu-rasterization", "--enable-zero-copy"];
const RISKY = [
  "--disable-site-isolation-trials", "--renderer-process-limit", "--in-process-gpu",
  "--disable-features=.*AudioServiceSandbox", "--disable-features=.*BackForwardCache", "--js-flags=.*expose-gc"
];

// 1) Valida i file da iniettare: meglio fallire qui che ottenere un'app senza tema.
const missing = inject.filter(p => !fs.existsSync(p));
if (missing.length) {
  console.error("::error::File inject non trovati:", missing.join(", "));
  process.exit(1);
}
if (profile === "lean" && inject.length) {
  console.warn("::warning::Profilo lean con inject attivo: per la RAM minima lascia 'inject' vuoto.");
}
console.log(`[PAKE v5] profilo=${profile} inject=${inject.length ? inject.join(",") : "nessuno"}`);

// 2) Individua il sorgente della finestra.
const file = ["src-tauri/src/app/window.rs", "src-tauri/src/app/window/mod.rs"].find(p => fs.existsSync(p));
if (!file) {
  console.log("[PAKE v5] window.rs non trovato: nessun file upstream modificato.");
  process.exit(0);
}
let src = fs.readFileSync(file, "utf8");

// 3) Audit flag rischiosi (solo avviso).
const risky = RISKY.filter(f => new RegExp(f).test(src));
if (risky.length) console.warn("::warning::Flag WebView potenzialmente rischiosi in", file, risky);

// 4) Profilo fluid: appende flag GPU agli argomenti esistenti, senza toccare il resto.
if (profile === "fluid") {
  const re = /(additional_browser_args\(\s*")([^"]*)(")/;
  const m = src.match(re);
  if (!m) {
    console.log("[PAKE v5] additional_browser_args non trovato: nessun flag aggiunto (build invariata).");
  } else {
    const toAdd = FLUID_FLAGS.filter(f => !m[2].includes(f));
    if (!toAdd.length) {
      console.log("[PAKE v5] Flag GPU già presenti.");
    } else {
      src = src.replace(re, `$1${m[2].trimEnd()} ${toAdd.join(" ")}$3`);
      fs.writeFileSync(file, src);
      console.log("[PAKE v5] Aggiunti flag GPU:", toAdd.join(" "));
    }
  }
} else {
  console.log("[PAKE v5] Nessun patch applicato: default upstream (sandbox, isolamento, GPU, audio, DRM).");
}
