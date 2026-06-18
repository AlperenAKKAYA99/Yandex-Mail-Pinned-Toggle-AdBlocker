document.addEventListener('DOMContentLoaded', () => {
  const adblockToggle = document.getElementById('adblock-toggle');
  const statusLabel = document.getElementById('status-label');
  
  const pinnedToggle = document.getElementById('pinned-toggle');
  const pinnedStatusLabel = document.getElementById('pinned-status-label');

  const speedToggle = document.getElementById('speed-toggle');
  const speedStatusLabel = document.getElementById('speed-status-label');

  const reloadPrompt = document.getElementById('reload-prompt');
  const reloadBtn = document.getElementById('reload-btn');
  const donateBtn = document.getElementById('donate-btn');

  const DONATION_URL = 'https://pay.alperenakkaya.dev/';

  // 1. Get initial states
  chrome.storage.local.get({ 
    adblockEnabled: true, 
    pinnedToggleEnabled: true,
    speedBoosterEnabled: true
  }, (result) => {
    adblockToggle.checked = result.adblockEnabled;
    updateAdblockUI(result.adblockEnabled);

    pinnedToggle.checked = result.pinnedToggleEnabled;
    updatePinnedUI(result.pinnedToggleEnabled);

    speedToggle.checked = result.speedBoosterEnabled;
    updateSpeedUI(result.speedBoosterEnabled);
  });

  // Check if we should display the reload prompt (only for Yandex Mail pages)
  function checkAndShowReloadPrompt() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs[0]) {
        const tab = tabs[0];
        const url = tab.url || '';
        if (url.includes('mail.yandex.ru') || 
            url.includes('mail.yandex.com') || 
            url.includes('mail.yandex.by') || 
            url.includes('mail.yandex.kz') || 
            url.includes('mail.yandex.ua') || 
            url.includes('mail.yandex.com.tr') || 
            url.includes('mail.yandex.uz')) {
          reloadPrompt.classList.remove('hidden');
        }
      }
    });
  }

  // 2. Handle AdBlock Toggle Change
  adblockToggle.addEventListener('change', () => {
    const isEnabled = adblockToggle.checked;
    chrome.storage.local.set({ adblockEnabled: isEnabled }, () => {
      updateAdblockUI(isEnabled);
      checkAndShowReloadPrompt();
    });
  });

  // 3. Handle Pinned Toggle Change
  pinnedToggle.addEventListener('change', () => {
    const isEnabled = pinnedToggle.checked;
    chrome.storage.local.set({ pinnedToggleEnabled: isEnabled }, () => {
      updatePinnedUI(isEnabled);
    });
  });

  // 4. Handle Speed Booster Toggle Change
  speedToggle.addEventListener('change', () => {
    const isEnabled = speedToggle.checked;
    chrome.storage.local.set({ speedBoosterEnabled: isEnabled }, () => {
      updateSpeedUI(isEnabled);
    });
  });

  // 5. Handle Reload Button
  reloadBtn.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs[0]) {
        chrome.tabs.reload(tabs[0].id, {}, () => {
          reloadPrompt.classList.add('hidden');
        });
      }
    });
  });

  // 6. Handle Donation Link Click
  donateBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: DONATION_URL });
  });

  // Helper functions to update UI elements
  function updateAdblockUI(isEnabled) {
    if (isEnabled) {
      statusLabel.textContent = 'Aktif';
      statusLabel.className = 'status-active';
    } else {
      statusLabel.textContent = 'Pasif';
      statusLabel.className = 'status-disabled';
    }
  }

  function updatePinnedUI(isEnabled) {
    if (isEnabled) {
      pinnedStatusLabel.textContent = 'Aktif';
      pinnedStatusLabel.className = 'status-active';
    } else {
      pinnedStatusLabel.textContent = 'Pasif';
      pinnedStatusLabel.className = 'status-disabled';
    }
  }

  function updateSpeedUI(isEnabled) {
    if (isEnabled) {
      speedStatusLabel.textContent = 'Aktif';
      speedStatusLabel.className = 'status-active';
    } else {
      speedStatusLabel.textContent = 'Pasif';
      speedStatusLabel.className = 'status-disabled';
    }
  }
});
