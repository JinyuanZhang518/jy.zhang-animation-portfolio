document.querySelectorAll("[data-chunks]").forEach(async (element) => {
  const isVideo = element instanceof HTMLVideoElement;
  const wrapper = isVideo ? element.closest(".storyboard-hero-video-wrap") : null;
  let status = null;

  const say = (state, message) => {
    if (!wrapper) return;
    wrapper.dataset.mediaState = state;
    if (!status) {
      status = document.createElement("div");
      status.className = "storyboard-media-status";
      status.setAttribute("role", "status");
      status.setAttribute("aria-live", "polite");
      wrapper.append(status);
    }
    status.textContent = message;
    status.hidden = !message;
  };
  const words = {
    loading: (done, total) => document.documentElement.lang.startsWith("zh")
      ? `正在加载开场动画 · ${done}/${total}`
      : `Loading opening animation · ${done}/${total}`,
    ready: () => document.documentElement.lang.startsWith("zh") ? "正在启动播放…" : "Starting playback…",
    tap: () => document.documentElement.lang.startsWith("zh") ? "轻触画面播放" : "Tap the video to play",
    format: () => document.documentElement.lang.startsWith("zh")
      ? "此设备无法播放这段视频，请尝试使用支持 MOV 的浏览器。"
      : "This device cannot play this video. Try a browser that supports MOV playback.",
    loadError: () => document.documentElement.lang.startsWith("zh")
      ? "视频加载失败，请检查网络后刷新页面。"
      : "The video could not load. Check your connection and refresh the page."
  };

  try {
    const parts = element.dataset.chunks.split(",").map((part) => part.trim());
    const blobs = new Array(parts.length);
    let nextIndex = 0;
    let finished = 0;
    const worker = async () => {
      while (true) {
        const index = nextIndex++;
        if (index >= parts.length) return;
        const response = await fetch(parts[index]);
        if (!response.ok) throw new Error("A media segment could not be loaded.");
        blobs[index] = await response.blob();
        finished++;
        say("loading", words.loading(finished, parts.length));
      }
    };
    if (wrapper) say("loading", words.loading(0, parts.length));
    await Promise.all(Array.from({ length: Math.min(3, parts.length) }, worker));
    const media = new Blob(blobs, { type: element.dataset.mime || "video/mp4" });
    const mediaUrl = URL.createObjectURL(media);

    if (isVideo) {
      element.addEventListener("loadeddata", () => say("ready", words.ready()), { once: true });
      element.addEventListener("playing", () => say("playing", ""), { once: false });
      element.addEventListener("error", () => say("error", words.format()), { once: true });
      element.src = mediaUrl;
      element.load();
      const attempt = () => element.play().then(() => say("playing", "")).catch(() => say("tap", words.tap()));
      element.addEventListener("click", attempt);
      element.addEventListener("canplay", attempt, { once: true });
    } else {
      element.src = mediaUrl;
    }
  } catch (error) {
    console.error("Portfolio media could not be assembled.", error);
    say("error", words.loadError());
  }
});