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
    let introStarted = false;
    const startMarquee = () => {
      if (introStarted || reduceMotion.matches) {
        if (reduceMotion.matches) track.classList.add("marquee-entered");
        return;
      }
      introStarted = true;
      track.classList.remove("marquee-entered");
      track.classList.add("marquee-enter");
      track.addEventListener("animationend", (event) => {
        if (event.animationName !== "visual-marquee-enter") return;
        track.classList.remove("marquee-enter");
        track.classList.add("marquee-entered");
      }, { once: true });
    };
    if ("IntersectionObserver" in window) {
      list.classList.add("motion-offscreen");
      const observer = new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting) return;
        list.classList.remove("motion-offscreen");
        startMarquee();
        observer.disconnect();
      }, { threshold: 0, rootMargin: "0px" });
      observer.observe(list);
    } else {
      startMarquee();
    }
  }

  reduceMotion.addEventListener?.("change", (event) => {
    document.querySelectorAll(".visual-marquee").forEach((list) => {
      list.classList.toggle("motion-paused", event.matches || list.matches(":hover, :focus-within"));
      const track = list.querySelector(".visual-marquee-track");
      if (event.matches) {
        track?.classList.remove("marquee-enter");
        track?.classList.add("marquee-entered");
      }
    });
  });
})();