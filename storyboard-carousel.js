(() => {
  const groups = [...document.querySelectorAll(".storyboard-panels .post-industrial-board-grid, .storyboard-panels .storyboard-panels-list")];
  if (!groups.length) return;

  const labels = {
    en: { previous: "Previous storyboard image", next: "Next storyboard image" },
    zh: { previous: "上一张分镜图", next: "下一张分镜图" }
  };

  groups.forEach((group) => {
    const images = [...group.querySelectorAll(":scope > img")];
    if (images.length < 2) return;

    const carousel = document.createElement("div");
    carousel.className = "storyboard-carousel";
    group.classList.remove("post-industrial-board-grid", "storyboard-panels-list");
    group.classList.add("storyboard-carousel-frame");

    const controls = document.createElement("div");
    controls.className = "storyboard-carousel-controls";

    const previous = document.createElement("button");
    previous.type = "button";
    previous.className = "storyboard-carousel-arrow";
    previous.textContent = "←";

    const status = document.createElement("span");
    status.className = "storyboard-carousel-status";
    status.setAttribute("aria-live", "polite");
    status.setAttribute("aria-atomic", "true");

    const next = document.createElement("button");
    next.type = "button";
    next.className = "storyboard-carousel-arrow";
    next.textContent = "→";

    controls.append(previous, status, next);
    group.before(carousel);
    carousel.append(group, controls);

    let index = 0;
    const render = () => {
      images.forEach((image, i) => {
        const active = i === index;
        image.hidden = !active;
        image.setAttribute("aria-hidden", String(!active));
        if ("inert" in image) image.inert = !active;
      });
      status.textContent = `${index + 1} / ${images.length}`;
    };

    previous.addEventListener("click", () => {
      index = (index - 1 + images.length) % images.length;
      render();
    });
    next.addEventListener("click", () => {
      index = (index + 1) % images.length;
      render();
    });
    carousel.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") previous.click();
      if (event.key === "ArrowRight") next.click();
    });

    const updateLabels = () => {
      const language = document.documentElement.lang === "zh" ? "zh" : "en";
      previous.setAttribute("aria-label", labels[language].previous);
      next.setAttribute("aria-label", labels[language].next);
      previous.title = labels[language].previous;
      next.title = labels[language].next;
    };
    updateLabels();
    new MutationObserver(updateLabels).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
    render();
  });
})();