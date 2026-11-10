(() => {
  const body = document.body;
  if (!body.classList.contains("visual-page")) return;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (reduceMotion.matches) return;
  const selector = [
    ".page-content-shell>main>.visual-film-project",
    ".page-content-shell>main>.visual-showcase",
    ".page-content-shell>main>figure.visual-motion",
    ".page-content-shell>main>.process-divider"
  ].join(",");
  let panels = [];
  let raf = 0;
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  function collect() {
    panels = Array.from(document.querySelectorAll(selector));
    update();
  }
  function update() {
    raf = 0;
    const vh = window.innerHeight || document.documentElement.clientHeight;
    const vw = window.innerWidth || document.documentElement.clientWidth;
    for (const panel of panels) {
      const rect = panel.getBoundingClientRect();
      const progress = clamp((vh - rect.top) / (vh + rect.height), 0, 1);
      const x = (1 - progress * 2) * vw;
      let opacity;
      if (progress < .16) opacity = progress / .16;
      else if (progress > .84) opacity = (1 - progress) / .16;
      else opacity = 1;
      panel.style.setProperty("--visual-scroll-x", Math.round(x) + "px");
      panel.style.setProperty("--visual-scroll-opacity", String(clamp(opacity, 0, 1)));
    }
  }
  function requestUpdate() {
    if (!raf) raf = requestAnimationFrame(update);
  }
  collect();
  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", collect, { passive: true });
  window.addEventListener("pageshow", collect);
  reduceMotion.addEventListener?.("change", event => {
    if (event.matches) {
      for (const panel of panels) {
        panel.style.removeProperty("--visual-scroll-x");
        panel.style.removeProperty("--visual-scroll-opacity");
      }
    } else collect();
  });
  if ("MutationObserver" in window) {
    new MutationObserver(collect).observe(document.querySelector(".page-content-shell") || body, { childList: true, subtree: true });
  }
})();