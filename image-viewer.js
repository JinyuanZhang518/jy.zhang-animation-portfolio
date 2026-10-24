(() => {
  const images = [...document.querySelectorAll('main img')];
  if (!images.length) return;
  const style = document.createElement('style');
  style.textContent = `main img[data-enlarge]{cursor:zoom-in}main img[data-enlarge]:focus-visible{outline:3px solid #ed5264;outline-offset:4px}.image-viewer{width:100vw;height:100dvh;max-width:100vw;max-height:100dvh;margin:0;padding:0;border:0;background:#151515;color:white;overflow:hidden}.image-viewer::backdrop{background:#151515}.viewer-tools{height:64px;display:flex;align-items:center;justify-content:center;gap:10px;padding:10px;background:#222;flex-wrap:wrap}.viewer-tools button,.viewer-tools a{font:14px Arial,sans-serif;color:white;background:#333;border:1px solid #666;border-radius:4px;padding:8px 12px;cursor:pointer}.viewer-tools a{display:inline-block;text-decoration:none}.viewer-stage{height:calc(100% - 64px);overflow:auto;display:grid;place-items:safe center;overscroll-behavior:contain;touch-action:pan-x pan-y pinch-zoom}.viewer-stage img{display:block;width:auto;height:auto;max-width:100%;max-height:100%;object-fit:contain;cursor:zoom-in}.viewer-stage.zoomed{display:block}.viewer-stage.zoomed img{max-width:none;max-height:none;cursor:zoom-out}.viewer-status{font:12px Arial,sans-serif;color:#ddd}@media(max-width:480px){.viewer-tools{gap:5px}.viewer-tools button,.viewer-tools a{font-size:12px;padding:8px}.viewer-status{font-size:11px}}`;
  document.head.append(style);
  const viewer = document.createElement('dialog');
  viewer.className = 'image-viewer';
  viewer.setAttribute('aria-label', 'High-resolution image viewer');
  viewer.innerHTML = `<div class="viewer-tools"><button type="button" data-prev aria-label="Previous image">←</button><span class="viewer-status" aria-live="polite"></span><button type="button" data-next aria-label="Next image">→</button><button type="button" data-zoom>Zoom in</button><a target="_blank" rel="noopener" data-original>Original</a><button type="button" data-close>Close ×</button></div><div class="viewer-stage"><img alt=""></div>`;
  document.body.append(viewer);
  const stage = viewer.querySelector('.viewer-stage');
  const enlarged = stage.querySelector('img');
  const zoom = viewer.querySelector('[data-zoom]');
  let current = 0;
  let savedOverflow = '';
  let trigger;
  const show = index => {
    current = (index + images.length) % images.length;
    const source = images[current];
    enlarged.src = source.dataset.fullsize || source.currentSrc || source.src;
    enlarged.alt = source.alt || 'Portfolio image';
    viewer.querySelector('[data-original]').href = enlarged.src;
    viewer.querySelector('.viewer-status').textContent = `${current + 1} / ${images.length}`;
    stage.classList.remove('zoomed');
    enlarged.style.width = '';
    zoom.textContent = 'Zoom in';
    stage.scrollTop = stage.scrollLeft = 0;
  };
  const toggleZoom = () => {
    const active = stage.classList.toggle('zoomed');
    enlarged.style.width = active ? `${enlarged.naturalWidth}px` : '';
    zoom.textContent = active ? 'Fit to screen' : 'Zoom in';
  };
  images.forEach((img, index) => {
    img.dataset.enlarge = '';
    img.tabIndex = 0;
    img.setAttribute('role', 'button');
    img.setAttribute('aria-label', `Enlarge: ${img.alt || 'Portfolio image'}`);
    const open = () => {
      trigger = img;
      show(index);
      savedOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      viewer.showModal();
      viewer.querySelector('[data-close]').focus();
    };
    img.addEventListener('click', open);
    img.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); open(); }
    });
  });
  viewer.querySelector('[data-close]').onclick = () => viewer.close();
  viewer.querySelector('[data-prev]').onclick = () => show(current - 1);
  viewer.querySelector('[data-next]').onclick = () => show(current + 1);
  zoom.onclick = toggleZoom;
  enlarged.onclick = toggleZoom;
  viewer.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); show(current - 1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); show(current + 1); }
  });
  viewer.addEventListener('close', () => {
    document.body.style.overflow = savedOverflow;
    trigger?.focus({preventScroll:true});
  });
})();
