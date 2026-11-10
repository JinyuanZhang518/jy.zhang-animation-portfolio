(() => {
  const body = document.body;
  if (!body.classList.contains("visual-page")) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const selector = [
    ".page-content-shell>main>.visual-film-project",
    ".page-content-shell>main .visual-showcase-list img",
    ".page-content-shell>main .seed-style-row img",
    ".page-content-shell>main figure.visual-motion"
  ].join(",");

  let panels = [];
  let raf = 0;
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const smoothstep = (start, end, value) => {
    const t = clamp((value - start) / (end - start), 0, 1);
    return t * t * (3 - 2 * t);
  };

  function collect() {
    panels = Array.from(document.querySelectorAll(selector));
    update();
  }

  function update() {
    raf = 0;
    if (reduceMotion.matches) {
      for (const panel of panels) {
        panel.style.removeProperty("--visual-scroll-x");
        panel.style.removeProperty("--visual-scroll-opacity");
      }
      return;
    }

    const vh = window.innerHeight || document.documentElement.clientHeight;
    const vw = window.innerWidth || document.documentElement.clientWidth;

    for (const panel of panels) {
      const rect = panel.getBoundingClientRect();
      const previousX = parseFloat(panel.style.getPropertyValue("--visual-scroll-x")) || 0;
      const baseLeft = rect.left - previousX;
      const progress = clamp((vh - rect.top) / (vh + rect.height), 0, 1);

      // Carry each individual panel from fully offscreen right to fully offscreen left.
      const x = (1 - progress) * vw - progress * rect.width - baseLeft;
      const fadeIn = smoothstep(0.12, 0.30, progress);
      const fadeOut = 1 - smoothstep(0.70, 0.88, progress);
      const opacity = clamp(Math.min(fadeIn, fadeOut), 0, 1);

      panel.style.setProperty("--visual-scroll-x", Math.round(x) + "px");
      panel.style.setProperty("--visual-scroll-opacity", opacity.toFixed(3));
    }
  }

  function requestUpdate() {
    if (!raf) raf = requestAnimationFrame(update);
  }

  collect();
  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", collect, { passive: true });
  window.addEventListener("pageshow", collect);
  reduceMotion.addEventListener?.("change", collect);

  if ("MutationObserver" in window) {
    const root = document.querySelector(".page-content-shell") || body;
    new MutationObserver(collect).observe(root, { childList: true, subtree: true });
  }
})();