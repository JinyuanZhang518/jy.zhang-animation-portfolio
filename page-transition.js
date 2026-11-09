(() => {
  const root = document.documentElement;
  root.classList.add("page-transitions");

  window.addEventListener("pageshow", () => {
    root.classList.remove("is-leaving");
  });

  document.addEventListener("click", (event) => {
    if (event.defaultPrevented || event.button !== 0 ||
        event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const link = event.target.closest("a[href]");
    if (!link || link.target || link.hasAttribute("download")) return;

    const destination = new URL(link.href, window.location.href);
    if (destination.origin !== window.location.origin ||
        destination.pathname === window.location.pathname &&
        destination.search === window.location.search) return;

    event.preventDefault();
    root.classList.add("is-leaving");
    window.setTimeout(() => window.location.assign(destination.href), 220);
  });
})();