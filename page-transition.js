(() => {
  const selectors = ["main", ".page-quick-nav", ".site-footer"];
  const content = () => selectors.flatMap((selector) =>
    Array.from(document.querySelectorAll(selector))
  );
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const supportsTransitions = CSS.supports("view-transition-name: root");
  const nativeNavigationTransitions = supportsTransitions && !reduceMotion;

  // Modern browsers animate cross-page navigation natively. The header remains
  // a shared, static element; the named page regions below the divider fade.
  if (!nativeNavigationTransitions) {
    const entering = content();
    entering.forEach((element) => element.classList.add("page-transition-entering"));
    window.setTimeout(() => {
      entering.forEach((element) => element.classList.remove("page-transition-entering"));
    }, 380);
  }

  window.addEventListener("pageshow", () => {
    content().forEach((element) => element.classList.remove("page-transition-leaving"));
  });

  document.addEventListener("click", (event) => {
    if (nativeNavigationTransitions || event.defaultPrevented || event.button !== 0 ||
        event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const target = event.target instanceof Element ? event.target : event.target?.parentElement;
    const link = target?.closest("a[href]");
    if (!link || link.target || link.hasAttribute("download")) return;

    const destination = new URL(link.href, window.location.href);
    const sameDocument = destination.origin === window.location.origin &&
      destination.pathname === window.location.pathname &&
      destination.search === window.location.search;
    if (destination.origin !== window.location.origin || sameDocument) return;

    event.preventDefault();
    content().forEach((element) => element.classList.add("page-transition-leaving"));
    window.setTimeout(() => window.location.assign(destination.href), 180);
  });
})();
