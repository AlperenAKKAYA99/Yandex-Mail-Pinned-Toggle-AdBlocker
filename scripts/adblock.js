// Hide Yandex Email Ad by Zahir — content script
(function () {
  "use strict";

  let isEnabled = true;
  let observer = null;
  let throttleTimer = null;

  // --- STRATEGY 1: CSS Injection (Fast & Stable) ---
  const CSS_RULES = `
    [data-testid^="page-layout_right-column_container"],
    .DirectLine,
    [class*="BannersBlockAdaptiveWidth"],
    [id^="js-main-rtb"],
    [id^="js-messages-direct"],
    a[href*="premium-plans"] {
      display: none !important;
      width: 0 !important;
      height: 0 !important;
      opacity: 0 !important;
      pointer-events: none !important;
      visibility: hidden !important;
    }
  `;

  function injectStyles() {
    if (!isEnabled) return;
    if (document.getElementById('yandex-adblock-style')) return;
    const style = document.createElement('style');
    style.id = 'yandex-adblock-style';
    style.textContent = CSS_RULES;
    (document.head || document.documentElement).appendChild(style);
  }

  function removeStyles() {
    const style = document.getElementById('yandex-adblock-style');
    if (style) {
      style.remove();
    }
  }

  // --- STRATEGY 2: XPath Scanner (For Obfuscated/Randomized Ads) ---
  function removeObfuscatedAds() {
    if (!isEnabled) return;
    try {
      const xpath = "//*[@*[starts-with(name(), 'data-r-i-')]]";
      const result = document.evaluate(xpath, document, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);

      for (let i = 0; i < result.snapshotLength; i++) {
        const node = result.snapshotItem(i);
        if (node && node.parentElement && node.parentElement.parentElement) {
            const grandParent = node.parentElement.parentElement;
            if (grandParent.tagName !== 'BODY' && grandParent.tagName !== 'HTML') {
                grandParent.style.display = 'none';
                grandParent.setAttribute('data-ad-removed', 'true');
            }
        }
      }
    } catch (e) {
      // Fail silently
    }
  }

  // --- STRATEGY 3: Standard DOM Removal (Cleanup) ---
  function cleanStandardNodes() {
    if (!isEnabled) return;
    const selectors = [
        '[data-testid^="page-layout_right-column_container"]',
        '.DirectLine'
    ];
    selectors.forEach(sel => {
        document.querySelectorAll(sel).forEach(el => el.remove());
    });
  }

  // --- MAIN EXECUTION ---
  function runAdBlocker() {
    if (!isEnabled) return;
    injectStyles();
    cleanStandardNodes();
    removeObfuscatedAds();
  }

  // Throttle scanner to execute at most once every 400ms to save CPU cycles
  function runAdBlockerThrottled() {
    if (throttleTimer) return;
    throttleTimer = setTimeout(() => {
      runAdBlocker();
      throttleTimer = null;
    }, 400);
  }

  function startObserver() {
    if (observer) return;
    observer = new MutationObserver(() => {
      runAdBlockerThrottled();
    });
    observer.observe(document.body || document.documentElement, {
      childList: true,
      subtree: true,
    });
  }

  function stopObserver() {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
    if (throttleTimer) {
      clearTimeout(throttleTimer);
      throttleTimer = null;
    }
  }

  function init() {
    chrome.storage.local.get({ adblockEnabled: true }, (result) => {
      isEnabled = result.adblockEnabled;
      if (isEnabled) {
        runAdBlocker();
        startObserver();
      } else {
        removeStyles();
        stopObserver();
      }
    });
  }

  // Initial load
  init();

  // Listen for navigation changes
  window.addEventListener("popstate", () => { if (isEnabled) runAdBlockerThrottled(); }, true);
  window.addEventListener("hashchange", () => { if (isEnabled) runAdBlockerThrottled(); }, true);

  // Listen for status changes from popup
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes.adblockEnabled) {
      isEnabled = changes.adblockEnabled.newValue;
      if (isEnabled) {
        runAdBlocker();
        startObserver();
      } else {
        removeStyles();
        stopObserver();
      }
    }
  });
})();
