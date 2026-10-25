(() => {
  const videos = [...document.querySelectorAll('video[data-scroll-play]')];
  const visible = new Set();
  const play = video => {
    video.muted = true;
    if (!document.hidden) video.play().catch(() => {});
  };
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const video = entry.target;
      if (entry.isIntersecting && entry.intersectionRatio >= .35) {
        visible.add(video);
        play(video);
      } else {
        visible.delete(video);
        video.pause();
      }
    });
  }, {threshold: [0, .35]});
  videos.forEach(video => {
    video.defaultMuted = video.muted = true;
    observer.observe(video);
    video.addEventListener('loadeddata', () => { if (visible.has(video)) play(video); });
  });
  document.addEventListener('visibilitychange', () => {
    videos.forEach(video => {
      if (document.hidden) video.pause();
      else if (visible.has(video)) play(video);
    });
  });
  document.addEventListener('WeixinJSBridgeReady', () => visible.forEach(play));
})();
