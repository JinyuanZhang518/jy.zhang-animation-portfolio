document.querySelectorAll("[data-chunks]").forEach(async (element) => {
  try {
    const parts = element.dataset.chunks.split(",").map((part) => part.trim());
    const loadPart = (part) => {
      if (typeof window.fetch === "function") {
        return window.fetch(part).then((response) => {
          if (!response.ok) throw new Error("A media file could not be loaded.");
          return response.blob();
        });
      }
      return new Promise((resolve, reject) => {
        const request = new XMLHttpRequest();
        request.open("GET", part, true);
        request.responseType = "blob";
        request.onload = () => {
          if (request.status >= 200 && request.status < 300) resolve(request.response);
          else reject(new Error("A media file could not be loaded."));
        };
        request.onerror = () => reject(new Error("A media file could not be loaded."));
        request.send();
      });
    };
    const blobs = await Promise.all(parts.map(loadPart));
    const media = new Blob(blobs, { type: element.dataset.mime });
    const mediaUrl = URL.createObjectURL(media);
    if (element instanceof HTMLVideoElement) {
      element.src = mediaUrl;
      element.load();
      if (element.autoplay) element.play().catch(() => {});
    } else {
      element.src = mediaUrl;
    }
  } catch (error) {
    console.error("Portfolio media could not be assembled.", error);
  }
});
