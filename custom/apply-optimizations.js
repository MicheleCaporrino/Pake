import fs from 'fs';

const windowRsPath = 'src-tauri/src/app/window.rs';

if (fs.existsSync(windowRsPath)) {
    let content = fs.readFileSync(windowRsPath, 'utf8');
    const target = 'let mut windows_browser_args = String::from("--disable-features=msWebOOUI,msPdfOOUI,msSmartScreenProtection --disable-blink-features=AutomationControlled");';

    // Flag ESTREMI: Tetto JS a 128MB, GC Aggressivo, Spegnimento moduli inutili
    const flags = [
        "--disable-features=msWebOOUI,msPdfOOUI,msSmartScreenProtection,AudioServiceSandbox,CalculateNativeWinOcclusion,MediaRouter,OptimizationHints,Translate,WinUseBrowserSpellChecker",
        "--disable-blink-features=AutomationControlled",
        "--disable-site-isolation-trials",
        "--disable-extensions",
        "--disable-plugins",
        "--disable-printing",
        "--disable-speech-api",
        "--renderer-process-limit=1",
        "--in-process-gpu",
        "--js-flags=\"--max-old-space-size=128 --expose-gc --gc-global\"",
        "--disk-cache-size=10485760" // Cache a 10MB
    ].join(' ');

    const optimized = `let mut windows_browser_args = String::from("${flags}");\n    window_builder = window_builder.devtools(true);`;

    if (content.includes(target)) {
        content = content.replace(target, optimized);
        fs.writeFileSync(windowRsPath, content, 'utf8');
        console.log("Ottimizzazioni ESTREME applicate!");
    } else {
        const regex = /let\s+mut\s+windows_browser_args\s*=\s*String::from\("([^"]+)"\);/;
        if (regex.test(content)) {
            content = content.replace(regex, () => {
                return `let mut windows_browser_args = String::from("${flags}");\n    window_builder = window_builder.devtools(true);`;
            });
            fs.writeFileSync(windowRsPath, content, 'utf8');
            console.log("Ottimizzazioni ESTREME applicate via regex!");
        }
    }
}