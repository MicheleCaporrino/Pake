import fs from 'fs';

const windowRsPath = 'src-tauri/src/app/window.rs';

if (fs.existsSync(windowRsPath)) {
    let content = fs.readFileSync(windowRsPath, 'utf8');

    const target = 'let mut windows_browser_args = String::from("--disable-features=msWebOOUI,msPdfOOUI,msSmartScreenProtection --disable-blink-features=AutomationControlled");';

    // Rimosso low-end-mode e background-networking che "soffocavano" lo streaming audio
    const flags = [
        "--disable-features=msWebOOUI,msPdfOOUI,msSmartScreenProtection,AudioServiceSandbox,CalculateNativeWinOcclusion,MediaRouter,OptimizationHints,Translate",
        "--disable-blink-features=AutomationControlled",
        "--disable-site-isolation-trials",
        "--renderer-process-limit=1",
        "--in-process-gpu",
        "--js-flags=--max-old-space-size=256 --expose-gc",
        "--disk-cache-size=31457280"
    ].join(' ');

    const optimized = `let mut windows_browser_args = String::from("${flags}");\n    window_builder = window_builder.devtools(true);`;

    if (content.includes(target)) {
        content = content.replace(target, optimized);
        fs.writeFileSync(windowRsPath, content, 'utf8');
        console.log("Ottimizzazioni applicate (Buffer Audio Sbloccato)!");
    } else {
        const regex = /let\s+mut\s+windows_browser_args\s*=\s*String::from\("([^"]+)"\);/;
        if (regex.test(content)) {
            content = content.replace(regex, () => {
                return `let mut windows_browser_args = String::from("${flags}");\n    window_builder = window_builder.devtools(true);`;
            });
            fs.writeFileSync(windowRsPath, content, 'utf8');
            console.log("Ottimizzazioni applicate via regex!");
        }
    }
}