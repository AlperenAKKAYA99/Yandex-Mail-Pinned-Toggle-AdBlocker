(function() {
    'use strict';

    const ADS_API_URL = 'https://ads.alperenakkaya.dev/url_ads/index.php';

    // Harici sunucu bağlantısı yalnızca reklam içeriği için. Kimlik bilgileri gönderilmez.
    function fetchAdsData() {
        return fetch(ADS_API_URL, { credentials: 'omit', mode: 'cors' })
            .then(response => response.ok ? response.json() : null)
            .catch(() => null);
    }

    function getRandomAd(adsData) {
        if (!adsData || !Array.isArray(adsData.ads) || adsData.ads.length === 0) return null;
        return adsData.ads[Math.floor(Math.random() * adsData.ads.length)];
    }

    function safeUrl(value) {
        if (typeof value !== 'string') return '';
        try {
            const parsed = new URL(value, location.href);
            return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? parsed.href : '';
        } catch (e) {
            return '';
        }
    }

    function renderAdContent(adsWrapper, currentAd) {
        adsWrapper.textContent = '';

        if (!currentAd) {
            const fallback = document.createElement('div');
            fallback.className = 'ad-null-state';
            fallback.textContent = 'Reklam yüklenemedi';
            adsWrapper.appendChild(fallback);
            return;
        }

        const card = document.createElement('a');
        card.className = 'ym-custom-ad-card';
        card.href = safeUrl(currentAd.url) || '#';
        card.target = '_blank';
        card.rel = 'noopener noreferrer';

        if (currentAd.type === 'image' && typeof currentAd.img === 'string') {
            const imgContainer = document.createElement('div');
            imgContainer.className = 'ad-img-container';

            const img = document.createElement('img');
            const imageUrl = safeUrl(currentAd.img);
            if (imageUrl) {
                img.src = imageUrl;
            }
            img.alt = typeof currentAd.title === 'string' ? currentAd.title : 'Sponsorlu reklam';
            imgContainer.appendChild(img);
            card.appendChild(imgContainer);
        }

        const contentBox = document.createElement('div');
        contentBox.className = 'ad-content-box';

        const headerRow = document.createElement('div');
        headerRow.className = 'ad-header-row';

        const badge = document.createElement('span');
        badge.className = 'ad-badge';
        badge.textContent = 'Sponsorlu';

        const title = document.createElement('span');
        title.className = 'ad-title';
        title.textContent = typeof currentAd.title === 'string' ? currentAd.title : '';

        headerRow.appendChild(badge);
        headerRow.appendChild(title);
        contentBox.appendChild(headerRow);

        const desc = document.createElement('span');
        desc.className = 'ad-desc';
        desc.textContent = typeof currentAd.description === 'string' ? currentAd.description : '';
        contentBox.appendChild(desc);

        card.appendChild(contentBox);

        const cta = document.createElement('div');
        cta.className = 'ad-cta-btn';
        cta.textContent = typeof currentAd.cta === 'string' && currentAd.cta.trim().length > 0 ? currentAd.cta : 'İncele';
        card.appendChild(cta);

        adsWrapper.appendChild(card);
    }

    function createToggleHeader() {
        if (document.getElementById('pinned-toggle-container') || document.querySelector('.pinned-list-wrapper')) return;

        const pinnedList = document.querySelector('.qa-MessagesListPinned');
        if (!pinnedList) return;

        const style = document.createElement('style');
        style.id = 'pinned-toggle-style';
        style.textContent = `
            #pinned-toggle-container {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 12px 16px;
                margin: 12px 16px 6px 12px;
                border-radius: 14px;
                cursor: pointer;
                user-select: none;
                background: var(--color-mg-surface-elevated-lvl-1, rgba(255, 255, 255, 0.70));
                backdrop-filter: blur(20px);
                -webkit-backdrop-filter: blur(20px);
                border: 1px solid var(--color-mg-stroke-default-base, rgba(0, 0, 0, 0.06));
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
                transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                font-family: var(--typography-font-family, system-ui, sans-serif);
                color: var(--color-mg-typo-primary, #1a1a1a);
            }
            #pinned-toggle-container:hover {
                background: var(--color-mg-surface-elevated-lvl-2, rgba(255, 255, 255, 0.85));
                border-color: var(--color-mg-stroke-default-hover, rgba(0, 0, 0, 0.12));
                box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
            }
            .pinned-left { display: flex; align-items: center; gap: 10px; }
            .pinned-svg-icon { width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1); }
            .pinned-svg-icon.arrow-icon { width: 12px; height: 12px; color: var(--color-mg-typo-secondary, #8c8c8c); }
            .pinned-svg-icon.arrow-icon.closed { transform: rotate(-90deg); }
            .pinned-svg-icon.main-icon { color: #ffb400; fill: rgba(255, 180, 0, 0.15); filter: drop-shadow(0 2px 4px rgba(255, 180, 0, 0.2)); }
            .pinned-label { font-size: 13px; font-weight: 600; letter-spacing: -0.1px; color: var(--color-mg-typo-primary, #262626); }
            .pinned-badge { background: var(--color-mg-accent-error-base, #ff4d4f); color: #fff; border-radius: 8px; padding: 2px 8px; font-size: 11px; font-weight: 700; min-width: 18px; text-align: center; box-shadow: 0 2px 6px rgba(255, 77, 79, 0.3); }
            .pinned-ads-wrapper { margin: 6px 16px 12px 12px; font-family: var(--typography-font-family, system-ui, sans-serif); display: block; }
            .ym-custom-ad-card { display: flex; flex-direction: row; align-items: center; text-decoration: none; background: var(--color-mg-surface-elevated-lvl-1, rgba(255, 255, 255, 0.4)); border: 1px dashed var(--color-mg-stroke-default-base, rgba(0, 0, 0, 0.1)); border-radius: 12px; padding: 10px 14px; gap: 12px; position: relative; overflow: hidden; transition: all 0.2s ease; }
            .ym-custom-ad-card:hover { background: var(--color-mg-surface-elevated-lvl-2, rgba(255, 255, 255, 0.7)); border-style: solid; border-color: var(--color-mg-accent-brand, #ffb400); }
            .ad-img-container { width: 48px; height: 48px; border-radius: 8px; overflow: hidden; flex-shrink: 0; background: rgba(0,0,0,0.03); }
            .ad-img-container img { width: 100%; height: 100%; object-fit: cover; }
            .ad-content-box { display: flex; flex-direction: column; flex-grow: 1; min-width: 0; }
            .ad-header-row { display: flex; align-items: center; gap: 6px; }
            .ad-badge { font-size: 9px; text-transform: uppercase; background: rgba(0, 0, 0, 0.06); color: var(--color-mg-typo-secondary, #777); padding: 1px 4px; border-radius: 4px; font-weight: 700; letter-spacing: 0.3px; flex-shrink: 0; }
            .ad-title { font-size: 13px; font-weight: 600; color: var(--color-mg-typo-primary, #1a1a1a); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
            .ad-desc { font-size: 11px; color: var(--color-mg-typo-secondary, #666); margin-top: 2px; display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
            .ad-cta-btn { font-size: 11px; font-weight: 600; color: #fff; background: var(--color-mg-accent-brand, #ffb400); padding: 6px 12px; border-radius: 8px; white-space: nowrap; flex-shrink: 0; box-shadow: 0 2px 6px rgba(255, 180, 0, 0.2); }
            .ad-null-state { font-size: 11px; color: var(--color-mg-typo-secondary, #999); text-align: center; padding: 6px; font-style: italic; }
            @media (max-width: 768px) { #pinned-toggle-container, .pinned-ads-wrapper { margin-left: 8px; margin-right: 8px; } .ad-cta-btn { display: none; } }
            .pinned-list-wrapper { overflow: hidden; transition: max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease; transform-origin: top; }
            .hidden { max-height: 0 !important; opacity: 0; transform: scaleY(0.97); pointer-events: none; }
            .visible { max-height: 1200px; opacity: 1; transform: scaleY(1); }
        `;
        document.head.appendChild(style);

        const wrapper = document.createElement('div');
        wrapper.className = 'pinned-list-wrapper';
        pinnedList.parentNode.insertBefore(wrapper, pinnedList);
        wrapper.appendChild(pinnedList);

        const container = document.createElement('div');
        container.id = 'pinned-toggle-container';

        const left = document.createElement('div');
        left.className = 'pinned-left';

        const arrowIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        arrowIcon.setAttribute('viewBox', '0 0 24 24');
        arrowIcon.setAttribute('class', 'pinned-svg-icon arrow-icon');
        arrowIcon.innerHTML = '<path d="M6 9l6 6 6-6"/>';

        const mainIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        mainIcon.setAttribute('viewBox', '0 0 24 24');
        mainIcon.setAttribute('class', 'pinned-svg-icon main-icon');
        mainIcon.innerHTML = '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>';

        const label = document.createElement('span');
        label.className = 'pinned-label';
        label.textContent = 'Önemli E-postalar';

        left.appendChild(arrowIcon);
        left.appendChild(mainIcon);
        left.appendChild(label);

        const badge = document.createElement('span');
        badge.className = 'pinned-badge';
        badge.textContent = '0';

        container.appendChild(left);
        container.appendChild(badge);

        const adsWrapper = document.createElement('div');
        adsWrapper.className = 'pinned-ads-wrapper';
        const loadingState = document.createElement('div');
        loadingState.className = 'ad-null-state';
        loadingState.textContent = 'Yükleniyor...';
        adsWrapper.appendChild(loadingState);

        wrapper.parentNode.insertBefore(container, wrapper);
        wrapper.parentNode.insertBefore(adsWrapper, wrapper);

        fetchAdsData().then(apiData => {
            const currentAd = getRandomAd(apiData);
            renderAdContent(adsWrapper, currentAd);
        });

        function getPinnedCount() {
            return pinnedList.querySelectorAll('[data-lid]').length || pinnedList.children.length;
        }

        const savedState = localStorage.getItem('pinned-hidden') === 'true';

        function updateUI(hidden) {
            const count = getPinnedCount();
            badge.textContent = String(count);

            if (count === 0) {
                container.style.display = 'none';
                adsWrapper.style.display = 'none';
            } else {
                container.style.display = 'flex';
                adsWrapper.style.display = 'block';
            }

            if (hidden) {
                wrapper.classList.add('hidden');
                wrapper.classList.remove('visible');
                arrowIcon.classList.add('closed');
            } else {
                wrapper.classList.remove('hidden');
                wrapper.classList.add('visible');
                arrowIcon.classList.remove('closed');
            }
        }

        updateUI(savedState);

        container.addEventListener('click', () => {
            const isHidden = wrapper.classList.contains('hidden');
            const newState = !isHidden;
            localStorage.setItem('pinned-hidden', String(newState));
            updateUI(newState);
        });

        const countObserver = new MutationObserver(() => {
            updateUI(wrapper.classList.contains('hidden'));
        });
        countObserver.observe(pinnedList, { childList: true, subtree: true });
    }

    let isEnabled = true;
    let mainObserver = null;

    function startToggleFeature() {
        if (!isEnabled) return;
        if (document.getElementById('pinned-toggle-container')) return;

        const pinnedArea = document.querySelector('.qa-MessagesListPinned');
        if (pinnedArea) {
            createToggleHeader();
        }

        if (!mainObserver) {
            mainObserver = new MutationObserver(() => {
                const area = document.querySelector('.qa-MessagesListPinned');
                if (area && !document.getElementById('pinned-toggle-container')) {
                    createToggleHeader();
                }
            });
            mainObserver.observe(document.body, { childList: true, subtree: true });
        }
    }

    function stopToggleFeature() {
        if (mainObserver) {
            mainObserver.disconnect();
            mainObserver = null;
        }
        
        // Remove style sheet
        const style = document.getElementById('pinned-toggle-style');
        if (style) style.remove();

        // Remove container
        const container = document.getElementById('pinned-toggle-container');
        if (container) container.remove();

        // Remove ads wrapper
        const ads = document.querySelector('.pinned-ads-wrapper');
        if (ads) ads.remove();

        // Unwrap pinned list
        const wrapper = document.querySelector('.pinned-list-wrapper');
        const pinnedList = document.querySelector('.qa-MessagesListPinned');
        if (wrapper && pinnedList) {
            wrapper.parentNode.insertBefore(pinnedList, wrapper);
            wrapper.remove();
        }
    }

    function init() {
        chrome.storage.local.get({ pinnedToggleEnabled: true }, (result) => {
            isEnabled = result.pinnedToggleEnabled;
            if (isEnabled) {
                startToggleFeature();
            }
        });
    }

    init();

    chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === 'local' && changes.pinnedToggleEnabled) {
            isEnabled = changes.pinnedToggleEnabled.newValue;
            if (isEnabled) {
                startToggleFeature();
            } else {
                stopToggleFeature();
            }
        }
    });
})();
