const fs = require('fs');
const path = 'src-tauri/src/main.rs';

if (fs.existsSync(path)) {
    let content = fs.readFileSync(path, 'utf8');
    
    // Inietta i limiti RAM e processi per WebView2 (Chromium)
    const optimization = `fn main() {
    #[cfg(target_os = "windows")]
    {
        std::env::set_var(
            "WEBVIEW2_ADDITIONAL_BROWSER_ARGS",
            concat!(
                "--renderer-process-limit=1 ",
                "--in-process-gpu ",
                "--js-flags=--max-old-space-size=256 ",
                "--disable-features=CalculateNativeWinOcclusion,MediaRouter,OptimizationHints,Translate ",
                "--disable-background-networking ",
                "--disable-component-update ",
                "--disable-domain-reliability ",
                "--disk-cache-size=31457280"
            ),
        );
    }
`;

    if (!content.includes("WEBVIEW2_ADDITIONAL_BROWSER_ARGS")) {
        content = content.replace('fn main() {', optimization);
        fs.writeFileSync(path, content, 'utf8');
        console.log("Ottimizzazioni globali WebView2 applicate con successo per la build!");
    }
} else {
    console.warn("File main.rs non trovato, build standard.");
}