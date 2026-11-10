(() => {
  const hero = document.querySelector(".storyboard-hero-video");
  if (!hero) return;

  const body = document.body;
  const heroObserver = new IntersectionObserver((entries) => {
    const visible = entries.some(entry => entry.isIntersecting);
    body.classList.toggle("storyboard-video-visible", visible);
  }, { threshold: 0.01 });
  heroObserver.observe(hero);

  const projects = [...document.querySelectorAll(
    "#story-project-1, #story-project-2, #story-project-3, #story-project-4, #story-project-5"
  )];
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("portfolio-scroll-reveal", "is-in-view");
      observer.unobserve(entry.target);
    });
  }, { rootMargin: "0px 0px -7% 0px", threshold: 0.01 });

  projects.forEach(project => {
    project.classList.add("portfolio-scroll-reveal");
    revealObserver.observe(project);
  });

  const startPlayback = () => {
    if (document.visibilityState === "hidden") return;
    hero.play().catch(() => {});
  };
  hero.addEventListener("canplay", startPlayback, { once: true });
  document.addEventListener("visibilitychange", startPlayback);
  if (hero.readyState >= 3) startPlayback();
})();
