const DONATION_URL = 'https://pay.alperenakkaya.dev/';

chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: DONATION_URL });
});
