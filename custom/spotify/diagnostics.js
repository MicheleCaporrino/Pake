/* Load manually in DevTools only. Read-only diagnostics; no page modifications. */
(() => {
  const selectors = [
    ["player", '[data-testid="now-playing-bar"]'],
    ["cover", '[data-testid="cover-art-image"]'],
    ["track", '[data-testid="track"]'],
    ["player controls", '[data-testid="player-controls"]'],
    ["play/pause", '[data-testid="control-button-playpause"]'],
    ["progress", '[data-testid="playback-progressbar"]'],
    ["volume", '[data-testid="volume-bar"]'],
    ["queue", '[data-testid="control-button-queue"]'],
    ["lyrics", '[data-testid="lyrics-button"]']
  ];
  const report = selectors.map(([name, selector]) => {
    const node = document.querySelector(selector);
    return { name, selector, found: Boolean(node), tag: node?.tagName ?? "", role: node?.getAttribute("role") ?? "", ariaLabel: node?.getAttribute("aria-label") ?? "" };
  });
  console.table(report);
  console.info("[PAKE v4] selector coverage:", `${report.filter(x => x.found).length}/${report.length}`);
  if (performance.memory) {
    console.info("[PAKE v4] JS heap MB:", +(performance.memory.usedJSHeapSize / 1048576).toFixed(1));
  } else {
    console.info("[PAKE v4] performance.memory unavailable in this WebView context.");
  }
  return report;
})();
