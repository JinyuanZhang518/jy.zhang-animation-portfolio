(() => {
  const header = document.querySelector(".site-header");
  if (!header) return;

  const body = document.body;
  const makeShell = () => {
    const shell = document.createElement("div");
    shell.className = "page-content-shell";
    const movable = [];
    for (let node = header.nextSibling; node; ) {
      const next = node.nextSibling;
      if (node.nodeType === Node.ELEMENT_NODE && node.tagName === "SCRIPT") {
        node.dataset.routeScript = "true";
      } else {
        movable.push(node);
      }
      node = next;
    }
    for (const node of movable) shell.append(node);
    header.after(shell);
    return shell;
  };

  let shell = document.querySelector(".page-content-shell") || makeShell();
  let busy = false;
  document.head.querySelectorAll("style").forEach(style => style.dataset.routeStyle = "true");

  const cleanOldPage = () => {
    shell.querySelectorAll("video").forEach(video => { try { video.pause(); } catch (_) {} });
    document.querySelectorAll("dialog.image-viewer, .image-viewer").forEach(node => node.remove());
    document.querySelectorAll("script[data-route-script]").forEach(node => node.remove());
    document.head.querySelectorAll("style[data-route-style]").forEach(node => node.remove());
  };

  const runPageScripts = async (parsedBody, pageUrl) => {
    const scripts = [...parsedBody.querySelectorAll(":scope > script")];
    for (const oldScript of scripts) {
      const script = document.createElement("script");
      script.dataset.routeScript = "true";
      for (const attr of oldScript.attributes) {
        if (attr.name === "src") script.src = new URL(attr.value, pageUrl).href;
        else if (attr.name !== "data-route-script") script.setAttribute(attr.name, attr.value);
      }
      if (!oldScript.src) script.textContent = oldScript.textContent;
      if (script.src) {
        script.async = false;
        await new Promise(resolve => {
          script.onload = resolve;
          script.onerror = resolve;
          document.body.append(script);
        });
      } else {
        document.body.append(script);
      }
    }
    document.head.querySelectorAll("style:not([data-route-style])").forEach(style => style.dataset.routeStyle = "true");
  };

  const transitionTo = async (url, push) => {
    if (busy) return;
    busy = true;
    try {
      const response = await fetch(url.href, { headers: { "X-Portfolio-Navigation": "1" } });
      if (!response.ok) throw new Error("Page request failed");
      const html = await response.text();
      const parsed = new DOMParser().parseFromString(html, "text/html");
      const nextHeader = parsed.querySelector(".site-header");
      if (!nextHeader) throw new Error("Page header missing");
      const incomingNodes = [...parsed.body.childNodes].filter(node =>
        !(node.nodeType === Node.ELEMENT_NODE && node.tagName === "HEADER") &&
        !(node.nodeType === Node.ELEMENT_NODE && node.tagName === "SCRIPT")
      );
      const incomingStyles = [...parsed.head.querySelectorAll("style")].map(style => style.cloneNode(true));

      const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (!reduceMotion) {
        await shell.animate(
          [{ opacity: 1, transform: "translateX(0)" }, { opacity: 0, transform: "translateX(-20px)" }],
          { duration: 180, easing: "ease", fill: "forwards" }
        ).finished;
      }

      cleanOldPage();
      shell.replaceChildren(...incomingNodes);
      body.className = parsed.body.className;
      document.title = parsed.title;
      if (push) history.pushState({ portfolio: true }, "", url.href);
      incomingStyles.forEach(style => {
        style.dataset.routeStyle = "true";
        document.head.append(style);
      });
      const selectedLanguage = document.documentElement.lang.startsWith("zh") ? "zh" : "en";
      if (window.portfolioSetLanguage) window.portfolioSetLanguage(selectedLanguage);
      window.scrollTo({ top: 0, behavior: "instant" });

      shell.style.opacity = reduceMotion ? "1" : "0";
      shell.style.transform = reduceMotion ? "none" : "translateX(24px)";
      await runPageScripts(parsed.body, url);
      if (window.portfolioSetLanguage) window.portfolioSetLanguage(selectedLanguage);

      if (!reduceMotion) {
        shell.animate(
          [{ opacity: 0, transform: "translateX(24px)" }, { opacity: 1, transform: "translateX(0)" }],
          { duration: 460, easing: "cubic-bezier(.22,1,.36,1)", fill: "both" }
        ).onfinish = () => { shell.style.opacity = ""; shell.style.transform = ""; };
      } else {
        shell.style.opacity = "";
        shell.style.transform = "";
      }
    } catch (error) {
      location.assign(url.href);
    } finally {
      busy = false;
    }
  };

  document.addEventListener("click", event => {
    const link = event.target.closest(".site-nav a, .avatar-frame");
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target) return;
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin || !/\.html?$/.test(url.pathname)) return;
    event.preventDefault();
    if (url.pathname === location.pathname) return;
    transitionTo(url, true);
  });

  window.addEventListener("popstate", () => transitionTo(new URL(location.href), false));
})();