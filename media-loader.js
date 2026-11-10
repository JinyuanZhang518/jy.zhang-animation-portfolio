(() => {
  const cache = window.__portfolioMediaCache || (window.__portfolioMediaCache = new Map());
  const heroKey = parts => "storyboard-hero:" + parts.join("|");

  document.querySelectorAll("[data-chunks]").forEach(async (element) => {
    const isVideo = element instanceof HTMLVideoElement;
    const isHero = isVideo && element.classList.contains("storyboard-hero-video");
    const wrapper = isVideo ? element.closest(".storyboard-hero-video-wrap") : null;
    let status = null;

    const say = (state, message) => {
      if (!wrapper) return;
      wrapper.dataset.mediaState = state;
      if (!status) {
        status = wrapper.querySelector(".storyboard-media-status");
        if (!status) {
          status = document.createElement("div");
          status.className = "storyboard-media-status";
          status.setAttribute("role", "status");
          status.setAttribute("aria-live", "polite");
          wrapper.append(status);
        }
      }
      status.textContent = message;
      status.hidden = !message;
    };
    const words = {
      loading: () => document.documentElement.lang.startsWith("zh")
        ? "正在准备开场动画…" : "Preparing opening animation…",
      ready: () => document.documentElement.lang.startsWith("zh")
        ? "正在启动播放…" : "Starting playback…",
      tap: () => document.documentElement.lang.startsWith("zh")
        ? "轻触画面播放" : "Tap the video to play",
      format: () => document.documentElement.lang.startsWith("zh")
        ? "此设备或浏览器不支持该 MOV 视频编码。" : "This device or browser does not support this MOV video codec.",
      loadError: () => document.documentElement.lang.startsWith("zh")
        ? "视频加载失败，请检查网络后刷新页面。" : "The video could not load. Check your connection and refresh the page."
    };

    try {
      const parts = element.dataset.chunks.split(",").map(part => part.trim());
      const key = isHero ? heroKey(parts) : "media:" + parts.join("|");
      if (wrapper) say("loading", words.loading());

      let mediaUrl = isHero && window.__portfolioHeroMediaUrl;
      if (!mediaUrl) {
        let pending = cache.get(key);
        if (!pending) {
          pending = (async () => {
            const blobs = new Array(parts.length);
            let nextIndex = 0;
            const worker = async () => {
              while (true) {
                const index = nextIndex++;
                if (index >= parts.length) return;
                let response;
                for (let attempt = 0; attempt < 2; attempt++) {
                  try {
                    response = await fetch(parts[index], { cache: "force-cache" });
                    if (!response.ok) throw new Error("A media segment could not be loaded.");
                    blobs[index] = await response.blob();
                    if (blobs[index].size > 0) break;
                    throw new Error("A media segment was empty.");
                  } catch (error) {
                    if (attempt === 1) throw error;
                    await new Promise(resolve => setTimeout(resolve, 350));
                  }
                }
              }
            };
            await Promise.all(Array.from({ length: Math.min(6, parts.length) }, worker));
            return URL.createObjectURL(new Blob(blobs, { type: element.dataset.mime || "video/mp4" }));
          })();
          cache.set(key, pending);
          pending.catch(() => cache.delete(key));
        }
        mediaUrl = await pending;
        if (isHero) window.__portfolioHeroMediaUrl = mediaUrl;
      }

      // The shared hero URL must outlive page swaps; page-transition.js only revokes
      // per-element object URLs stored in dataset.objectUrl.
      if (!isHero) element.dataset.objectUrl = mediaUrl;

      if (isVideo) {
        element.addEventListener("loadeddata", () => say("ready", words.ready()), { once: true });
        element.addEventListener("playing", () => say("playing", ""), { once: false });
        element.addEventListener("error", () => say("error", words.format()), { once: true });
        element.src = mediaUrl;
        element.load();
        const attempt = () => element.play().then(() => say("playing", "")).catch(() => say("tap", words.tap()));
        element.addEventListener("click", attempt);
        element.addEventListener("canplay", attempt, { once: true });
        if (element.readyState >= 2) attempt();
      } else {
        element.src = mediaUrl;
      }
    } catch (error) {
      console.error("Portfolio media could not be assembled.", error);
      say("error", words.loadError());
    }
  });
})();
