(() => {
  const translations = {
    "JINYUAN ZHANG | Portfolio": "JINYUAN ZHANG | 作品集",
    "Storyboard | JINYUAN ZHANG": "故事板 | JINYUAN ZHANG",
    "Visual Development | JINYUAN ZHANG": "视觉开发 | JINYUAN ZHANG",
    "AI Artwork | JINYUAN ZHANG": "AI 艺术 | JINYUAN ZHANG",
    "More | JINYUAN ZHANG": "更多 | JINYUAN ZHANG",
    "Home": "首页", "Storyboard": "故事板", "Visual Development": "视觉开发",
    "AI Artwork": "AI 艺术", "More": "更多", "Main navigation": "主导航",
    "Character avatar": "角色头像", "Animation Postgraduate": "动画研究生",
    "Storyboard Artist": "故事板艺术家", "Animation Director": "动画导演",
    "Visual Creator": "视觉创作者", "Animation Postgraduate | Storyboard Artist | Animation Director | Visual Creator": "动画研究生 | 故事板艺术家 | 动画导演 | 视觉创作者", "Welcome to My Portfolio": "欢迎来到我的作品集",
    "Hi, I am an outgoing artist who loves connecting with people. I am curious about distinctive creative communities of all kinds. I hope to bridge reality and imagination through my work, bringing stories that exist only in fantasy to life so they can be seen and felt. I will pursue this dream with unwavering passion.": "嗨，我是一名性格开朗、热爱与人交流的艺术家。我对各种独特的艺术社群始终充满好奇。我希望通过创作打破现实与想象的边界，让那些只存在于幻想中的故事也能被看见、被感受，并为此永远饱含激情。",
    "STORYBOARD": "故事板", "Storyboard": "故事板", "Boards, process, animatics, and finished films": "分镜、创作过程、动态分镜与完成作品",
    "VISUAL DEVELOPMENT": "视觉开发", "Visual Development": "视觉开发", "Character, environment, color, and composition": "角色、场景、色彩与构图",
    "AI ARTWORK": "AI 艺术", "AI Artwork": "AI 艺术", "Visual experiments and creative process": "视觉实验与创作过程",
    "Boards, process, animatics, and finished films": "分镜、创作过程、动态分镜与完成作品",
    "AI-assisted visual experiments, process, and final selections.": "AI 辅助视觉实验、创作过程与最终作品。",
    "IMAGE EXPLORATION": "图像探索", "Image Exploration": "图像探索", "Concept experiments and prompt iteration · Placeholder": "概念实验与提示词迭代 · 示例内容",
    "PROCESS": "创作过程", "Selection, refinement, and post-production · Placeholder": "筛选、完善与后期制作 · 示例内容",
    "FINAL SELECTION": "最终作品", "Final Selection": "最终作品", "Artwork and project notes · Placeholder": "作品与项目说明 · 示例内容",
    "More": "更多", "Animation studies, animatics, resume, and contact information.": "动画练习、动态分镜、简历与联系方式。",
    "I’m working hard to update and build this section. Stay tuned!": "主人正在加班加点更新建设中，敬请期待！",
    "Animatic / Motion Study": "动态分镜 / 动作练习", "Video placeholder": "视频示例",
    "Animation Studies": "动画练习", "Timing, acting tests, and process clips": "节奏、表演测试与创作过程",
    "RESUME / CV": "简历", "Resume": "简历", "Add a downloadable resume here": "可在此添加可下载的简历",
    "CONTACT": "联系", "Contact": "联系",
    "Visual Development": "视觉开发", "Character, environment, mood, and color exploration.": "角色、场景、氛围与色彩探索。",
    "CHARACTER DESIGN": "角色设计", "Character Design": "角色设计", "Silhouette, expression, and costume exploration · Placeholder": "轮廓、表情与服装探索 · 示例内容",
    "ENVIRONMENT": "场景设计", "Environment Design": "场景设计", "Locations and atmosphere for story worlds · Placeholder": "故事世界中的地点与氛围 · 示例内容",
    "COLOR SCRIPT": "色彩脚本", "Color Script": "色彩脚本", "Emotional shifts and color rhythm · Placeholder": "情绪变化与色彩节奏 · 示例内容",
    "© 2026 JINYUAN ZHANG · PORTFOLIO": "© 2026 JINYUAN ZHANG · 作品集",
    "Storyboard portfolio": "故事板作品集"
  };
  const reverse = Object.fromEntries(Object.entries(translations).map(([en, zh]) => [zh, en]));
  const dictionaries = { en: reverse, zh: translations };
  const button = document.querySelector(".language-toggle");
  if (!button) return;

  const setLanguage = (language) => {
    const dictionary = dictionaries[language];
    const walker = document.createTreeWalker(document.documentElement, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      const text = node.nodeValue;
      const trimmed = text.trim();
      if (dictionary[trimmed]) {
        node.nodeValue = text.replace(trimmed, dictionary[trimmed]);
      }
    }
    for (const element of document.querySelectorAll("[aria-label], [alt]")) {
      for (const attribute of ["aria-label", "alt"]) {
        const value = element.getAttribute(attribute);
        if (value && dictionary[value]) element.setAttribute(attribute, dictionary[value]);
      }
    }
    document.documentElement.lang = language;
    button.textContent = language === "zh" ? "English" : "中文";
    button.setAttribute("aria-label", language === "zh" ? "Switch to English" : "切换为中文");
    try { localStorage.setItem("portfolio-language", language); } catch (_) {}
  };

  let language = "en";
  try { language = localStorage.getItem("portfolio-language") === "zh" ? "zh" : "en"; } catch (_) {}
  setLanguage(language);
  button.addEventListener("click", () => setLanguage(document.documentElement.lang === "zh" ? "en" : "zh"));
})();
