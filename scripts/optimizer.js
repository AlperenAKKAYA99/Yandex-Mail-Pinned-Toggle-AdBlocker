// Yandex Mail Speed & Performance Optimizer Content Script
(function () {
  "use strict";

  let isEnabled = true;

  // Selective layout animation bypass for instant loads and menu changes
  const SPEEDUP_RULES = `
    /* Disable slow transition/animation components on layout elements */
    .mail-Layout,
    .mail-Layout-Content,
    .mail-MessagesList,
    .mail-Message,
    .ns-view-react-left-column,
    .mail-NestedLayout-Main,
    .qa-LeftColumn,
    .qa-MessagesList,
    .qa-MessageVal,
    [class*="popup"], 
    [class*="modal"], 
    [class*="dropdown"], 
    [class*="dialog"] {
      transition: none !important;
      animation: none !important;
      transition-duration: 0s !important;
      animation-duration: 0s !important;
      transition-delay: 0s !important;
      animation-delay: 0s !important;
    }
  `;

  function injectSpeedupStyles() {
    if (!isEnabled) return;
    if (document.getElementById('yandex-speedup-style')) return;
    const style = document.createElement('style');
    style.id = 'yandex-speedup-style';
    style.textContent = SPEEDUP_RULES;
    (document.head || document.documentElement).appendChild(style);
  }

  function removeSpeedupStyles() {
    const style = document.getElementById('yandex-speedup-style');
    if (style) {
      style.remove();
    }
  }

  function init() {
    chrome.storage.local.get({ speedBoosterEnabled: true }, (result) => {
      isEnabled = result.speedBoosterEnabled;
      if (isEnabled) {
        injectSpeedupStyles();
      }
    });
  }

  init();

  // Listen for real-time changes from the popup
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes.speedBoosterEnabled) {
      isEnabled = changes.speedBoosterEnabled.newValue;
      if (isEnabled) {
        injectSpeedupStyles();
      } else {
        removeSpeedupStyles();
      }
    }
  });
})();
