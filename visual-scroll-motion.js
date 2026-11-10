(() => {
  if (!document.body.classList.contains("visual-page")) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const lists = Array.from(document.querySelectorAll(".visual-showcase-list, .seed-style-row"));

  for (const list of lists) {
    if (list.dataset.horizontalShowcase === "true") continue;
    const images = Array.from(list.children).filter((node) => node instanceof HTMLImageElement);
    if (images.length < 2) continue;

    list.dataset.horizontalShowcase = "true";
    list.classList.add("visual-marquee");
    const track = document.createElement("div");
    track.className = "visual-marquee-track";
    const originalGroup = document.createElement("div");
    originalGroup.className = "visual-marquee-group";
    originalGroup.setAttribute("role", "list");

    for (const [index, image] of images.entries()) {
      image.loading = index < 2 ? "eager" : "lazy";
      image.decoding = "async";
      image.setAttribute("role", "listitem");
      originalGroup.append(image);
    }

    const duplicateGroup = originalGroup.cloneNode(true);
    duplicateGroup.classList.add("visual-marquee-copy");
    duplicateGroup.setAttribute("aria-hidden", "true");
    duplicateGroup.inert = true;
    duplicateGroup.querySelectorAll("img").forEach((image) => {
      image.alt = "";
      image.removeAttribute("role");
      image.removeAttribute("tabindex");
      image.removeAttribute("data-enlarge");
      image.loading = "lazy";
      image.style.pointerEvents = "none";
    });

    track.append(originalGroup, duplicateGroup);
    list.replaceChildren(track);

    const updateSpeed = () => {
      const width = originalGroup.getBoundingClientRect().width;
      if (width > 0) track.style.setProperty("--marquee-duration", Math.max(24, width / 64) + "s");
    };
    originalGroup.querySelectorAll("img").forEach((image) => image.addEventListener("load", updateSpeed, { once: true }));
    updateSpeed();
    if ("ResizeObserver" in window) new ResizeObserver(updateSpeed).observe(originalGroup);
    if (reduceMotion.matches) list.classList.add("motion-paused");
    list.addEventListener("mouseenter", () => list.classList.add("motion-paused"));
    list.addEventListener("mouseleave", () => { if (!reduceMotion.matches) list.classList.remove("motion-paused"); });
    list.addEventListener("focusin", () => list.classList.add("motion-paused"));
    list.addEventListener("focusout", () => { if (!reduceMotion.matches) list.classList.remove("motion-paused"); });
    if ("IntersectionObserver" in window) {
      list.classList.add("motion-offscreen");
      let introStarted = false;
      const observer = new IntersectionObserver(([entry]) => {
        list.classList.toggle("motion-offscreen", !entry.isIntersecting);
        if (entry.isIntersecting && !introStarted && !reduceMotion.matches) {
          introStarted = true;
          track.classList.add("marquee-enter");
          track.addEventListener("animationend", (event) => {
            if (event.animationName === "visual-marquee-enter") track.classList.remove("marquee-enter");
          });
        }
      }, { threshold: 0, rootMargin: "120px 0px" });
      observer.observe(list);
    }
  }

  reduceMotion.addEventListener?.("change", (event) => {
    document.querySelectorAll(".visual-marquee").forEach((list) => {
      list.classList.toggle("motion-paused", event.matches || list.matches(":hover, :focus-within"));
    });
  });
})();