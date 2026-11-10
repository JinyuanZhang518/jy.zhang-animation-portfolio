(() => {
  const hero = document.querySelector(".storyboard-hero-video");
  if (!hero) return;

  const darkenPage = () => document.body.classList.add("storyboard-video-visible");
  const observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) darkenPage();
  }, { threshold: 0.08 });
  observer.observe(hero);

  hero.addEventListener("canplay", () => {
    hero.play().catch(() => {});
  }, { once: true });
})();
