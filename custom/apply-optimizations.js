import fs from 'fs';

const windowRsPath = 'src-tauri/src/app/window.rs';

if (fs.existsSync(windowRsPath)) {
    let content = fs.readFileSync(windowRsPath, 'utf8');
    const target = 'let mut windows_browser_args = String::from("--disable-features=msWebOOUI,msPdfOOUI,msSmartScreenProtection --disable-blink-features=AutomationControlled");';

    // Flag RAM-MINIMA (DRM-SAFE: niente --disable-plugins / --disable-component-update,
    // Widevine CDM è un "plugin" aggiornato via component updater)
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