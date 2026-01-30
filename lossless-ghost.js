// lossless-ghost.js
// https://pasme.dev
(() => {
  "use strict";

  const NAME = "Lossless Ghost";
  const PREFIX = `[${NAME}]`;

  const SELECTORS = {
    nowPlaying: '[data-testid="now-playing-widget"]',
    trackInfo: ".main-trackInfo-container",
  };

  const LABELS = new Set(["lossless"]); // keep simple, can add variants later

  const log = {
    info: (...a) => console.log(PREFIX, ...a),
    warn: (...a) => console.warn(PREFIX, ...a),
    error: (...a) => console.error(PREFIX, ...a),
  };

  const state = {
    bootObserver: null,
    scopeObserver: null,
    lastScope: null,
    scheduled: false,
  };

  const normalize = (s) =>
    (s ?? "")
      .replace(/\u00A0/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();

  const getScope = () => {
    const np = document.querySelector(SELECTORS.nowPlaying);
    if (!np) return null;
    return np.querySelector(SELECTORS.trackInfo) ?? null;
  };

  const hideLossless = (scope) => {
    try {
      if (!scope) return 0;

      // Strategy A: hide any button whose visible label matches "Lossless"
      let hidden = 0;
      const buttons = scope.querySelectorAll("button");

      for (const btn of buttons) {
        const text = normalize(btn.textContent);
        if (!LABELS.has(text)) continue;

        if (btn.dataset.losslessGhostHidden !== "1") {
          btn.style.setProperty("display", "none", "important");
          btn.dataset.losslessGhostHidden = "1";
          hidden++;
        }

        // Also hide the smallest stable wrapper around it to avoid spacing/marquee artifacts
        const wrapper =
          btn.closest(".eBxEUeZhLhMiwCvoQAOj") ||
          btn.closest("[data-encore-id='text']") ||
          btn.parentElement;

        if (wrapper && wrapper.dataset.losslessGhostHidden !== "1") {
          wrapper.style.setProperty("display", "none", "important");
          wrapper.dataset.losslessGhostHidden = "1";
        }
      }

      return hidden;
    } catch (err) {
      log.error("hideLossless failed:", err);
      return 0;
    }
  };

  const schedule = () => {
    if (state.scheduled) return;
    state.scheduled = true;

    requestAnimationFrame(() => {
      state.scheduled = false;

      const scope = getScope();
      if (!scope) return;

      const hidden = hideLossless(scope);
      attachScopeObserver(scope);

      if (hidden > 0) log.info(`Hidden ${hidden} Lossless label(s).`);
    });
  };

  const attachScopeObserver = (scope) => {
    try {
      if (!scope) return;
      if (state.lastScope === scope && state.scopeObserver) return;

      state.lastScope = scope;

      if (state.scopeObserver) state.scopeObserver.disconnect();
      state.scopeObserver = new MutationObserver(schedule);

      state.scopeObserver.observe(scope, {
        childList: true,
        subtree: true,
        characterData: true,
      });

      // immediate pass
      hideLossless(scope);
    } catch (err) {
      log.error("attachScopeObserver failed:", err);
    }
  };

  const start = () => {
    try {
      // Boot observer: waits until now-playing widget exists / re-renders
      state.bootObserver = new MutationObserver(schedule);
      state.bootObserver.observe(document.body, { childList: true, subtree: true });

      schedule();
      log.info("Loaded.");
    } catch (err) {
      log.error("start failed:", err);
    }
  };

  const wait = setInterval(() => {
    try {
      if (!window.Spicetify || !document.body) return;
      clearInterval(wait);
      start();
    } catch (err) {
      log.error("bootstrap failed:", err);
    }
  }, 250);
})();