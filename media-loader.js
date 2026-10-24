document.querySelectorAll("[data-chunks]").forEach(async (element) => {
  try {
    const parts = element.dataset.chunks.split(",").map((part) => part.trim());
    const responses = await Promise.all(parts.map((part) => fetch(part)));
    if (responses.some((response) => !response.ok)) {
      throw new Error("A media file could not be loaded.");
    }
    const blobs = await Promise.all(responses.map((response) => response.blob()));
    const media = new Blob(blobs, { type: element.dataset.mime });
    const mediaUrl = URL.createObjectURL(media);
    if (element instanceof HTMLVideoElement) {
      element.src = mediaUrl;
      element.load();
    } else {
      element.src = mediaUrl;
    }
  } catch (error) {
    console.error("Portfolio media could not be assembled.", error);
  }
});
