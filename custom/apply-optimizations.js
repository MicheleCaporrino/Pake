import fs from 'fs';

// --- 1. Flag RAM-MINIMA WebView2 (window.rs) ---
const windowRsPath = 'src-tauri/src/app/window.rs';

if (fs.existsSync(windowRsPath)) {
    let content = fs.readFileSync(windowRsPath, 'utf8');
    const target = 'let mut windows_browser_args = String::from("--disable-features=msWebOOUI,msPdfOOUI,msSmartScreenProtection --disable-blink-features=AutomationControlled");';

    // DRM-SAFE: niente --disable-plugins / --disable-component-update (Widevine)
    const flags = [
        "--disable-features=msWebOOUI,msPdfOOUI,msSmartScreenProtection,AudioServiceSandbox,BackForwardCache,MediaRouter,OptimizationHints,Translate,WinUseBrowserSpellChecker",
        "--disable-blink-features=AutomationControlled",
        "--disable-site-isolation-trials",
        "--disable-printing",
        "--disable-speech-api",
        "--disable-sync",
        "--renderer-process-limit=1",
        "--in-process-gpu",
        "--enable-low-end-device-mode",
        '--js-flags="--max-old-space-size=384 --expose-gc"',
        "--disk-cache-size=33554432"
    ].join(' ');

    const optimized = `let mut windows_browser_args = String::from(r#"${flags}"#);`;

    if (content.includes(target)) {
        content = content.replace(target, optimized);
        fs.writeFileSync(windowRsPath, content, 'utf8');
        console.log("Ottimizzazioni applicate (match esatto).");
    } else {
        const regex = /let\s+mut\s+windows_browser_args\s*=\s*String::from\("([^"]+)"\);/;
        if (regex.test(content)) {
            content = content.replace(regex, () => optimized);
            fs.writeFileSync(windowRsPath, content, 'utf8');
            console.log("Ottimizzazioni applicate (regex).");
        } else {
            console.log("WARN: pattern 'windows_browser_args' non trovato in window.rs — nessuna modifica applicata.");
        }
    }
} else {
    console.log("WARN: src-tauri/src/app/window.rs non trovato — nessuna modifica applicata.");
}

// --- 2. DevTools in build release (Cargo.toml, feature tauri "devtools") ---
const cargoPath = 'src-tauri/Cargo.toml';

if (fs.existsSync(cargoPath)) {
    let cargo = fs.readFileSync(cargoPath, 'utf8');
    if (/"devtools",/.test(cargo)) {
        console.log('Devtools già presente in Cargo.toml.');
    } else {
        const anchor = '"image-png",';
        if (cargo.includes(anchor)) {
            cargo = cargo.replace(anchor, '"image-png",\n  "devtools",');
            fs.writeFileSync(cargoPath, cargo, 'utf8');
            console.log('Devtools abilitato in Cargo.toml.');
        } else {
            console.log('WARN: anchor features tauri non trovato in Cargo.toml — devtools NON abilitato.');
        }
    }
} else {
    console.log('WARN: src-tauri/Cargo.toml non trovato.');
}