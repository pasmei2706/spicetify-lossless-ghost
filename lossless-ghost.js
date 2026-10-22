// lossless-ghost.js
// https://pasme.dev
(() => {
  "use strict";

  const NAME = "Lossless Ghost";
  const PREFIX = `[${NAME}]`;
  const WIDGET_SELECTORS = [
    '[data-testid="now-playing-widget"]',
    '[data-testid="now-playing-bar"]',
    ".Root__now-playing-bar",
  ];
  const LABELS = new Set(["lossless"]);
  const log = {
    info: (...args) => console.log(PREFIX, ...args),
    warn: (...args) => console.warn(PREFIX, ...args),
    error: (...args) => console.error(PREFIX, ...args),
  };
  const state = { bootObserver: null, scopeObserver: null, lastScope: null, scheduled: false };

  const normalize = (value) => (value ?? "")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

  const getWidget = () => {
    for (const selector of WIDGET_SELECTORS) {
      const widget = document.querySelector(selector);
      if (widget) return widget;
    }
    return null;
  };

  const getBadgeTarget = (element) => {
    // Badges have appeared as buttons and as plain text. Prefer a clickable control;
    // otherwise hide the exact-label element so its surrounding track info stays intact.
    const button = element.closest("button, [role='button']");
    return button && LABELS.has(normalize(button.textContent)) ? button : element;
  };

  const hideLossless = (widget) => {
    if (!widget) return 0;
    let hidden = 0;
    const candidates = widget.querySelectorAll("*");
    for (const element of candidates) {
      const labels = [
        element.textContent,
        element.getAttribute("aria-label"),
        element.getAttribute("title"),
      ].map(normalize);
      if (!labels.some((label) => LABELS.has(label))) continue;

      // Ignore ancestors whose text also includes other track metadata. This keeps
      // the change scoped to the badge even when Spotify changes its markup.
      if ([...element.children].some((child) => normalize(child.textContent) === "lossless")) continue;

      const target = getBadgeTarget(element);
      if (target.dataset.losslessGhostHidden === "1") continue;
      target.style.setProperty("display", "none", "important");
      target.dataset.losslessGhostHidden = "1";
      hidden++;
    }
    return hidden;
  };

  const attachScopeObserver = (widget) => {
    if (!widget || (state.lastScope === widget && state.scopeObserver)) return;
    state.lastScope = widget;
    if (state.scopeObserver) state.scopeObserver.disconnect();
    state.scopeObserver = new MutationObserver(schedule);
    state.scopeObserver.observe(widget, { childList: true, subtree: true, characterData: true });
    hideLossless(widget);
  };

  const schedule = () => {
    if (state.scheduled) return;
    state.scheduled = true;
    requestAnimationFrame(() => {
      state.scheduled = false;
      const widget = getWidget();
      if (!widget) return;
      const hidden = hideLossless(widget);
      attachScopeObserver(widget);
      if (hidden) log.info(`Hidden ${hidden} Lossless label(s).`);
    });
  };

  const start = () => {
    try {
      state.bootObserver = new MutationObserver(schedule);
      state.bootObserver.observe(document.body, { childList: true, subtree: true });
      schedule();
      log.info("Loaded.");
    } catch (error) {
      log.error("start failed:", error);
    }
  };

  const wait = setInterval(() => {
    try {
      if (!window.Spicetify || !document.body) return;
      clearInterval(wait);
      start();
    } catch (error) {
      log.error("bootstrap failed:", error);
    }
  }, 250);
})();
