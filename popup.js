(function () {
    'use strict';

    const currentDomainDiv = document.querySelector('.current-domain');
    const statusDiv = document.querySelector('.status');
    const openOptionsBtn = document.getElementById('openOptions');
    const runNowBtn = document.getElementById('runNow');

    // Initialize popup
    function initialize() {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const currentTab = tabs[0];
            const url = new URL(currentTab.url);
            const currentDomain = url.hostname;

            currentDomainDiv.textContent = `Current site: ${currentDomain}`;

            chrome.storage.sync.get(['allowedDomains'], (result) => {
                const allowedDomains = result.allowedDomains || [];
                const isAllowed = allowedDomains.some(domain => {
                    const cleanDomain = domain.replace(/^(https?:\/\/)?(www\.)?/, '');
                    return currentDomain === cleanDomain || currentDomain.endsWith('.' + cleanDomain);
                });

                if (isAllowed) {
                    statusDiv.textContent = 'Extension is active on this site';
                    statusDiv.className = 'status active';
                    runNowBtn.textContent = 'Refresh Classes';
                } else {
                    statusDiv.textContent = 'Extension is not active on this site';
                    statusDiv.className = 'status inactive';
                    runNowBtn.textContent = 'Add Domain to Enable';
                }
            });
        });
    }

    // Open options page
    openOptionsBtn.addEventListener('click', () => {
        chrome.runtime.openOptionsPage();
        window.close();
    });

    // Run extension on current page or add domain
    runNowBtn.addEventListener('click', () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const currentTab = tabs[0];
            const url = new URL(currentTab.url);
            const currentDomain = url.hostname;

            chrome.storage.sync.get(['allowedDomains'], (result) => {
                const allowedDomains = result.allowedDomains || [];
                const isAllowed = allowedDomains.some(domain => {
                    const cleanDomain = domain.replace(/^(https?:\/\/)?(www\.)?/, '');
                    return currentDomain === cleanDomain || currentDomain.endsWith('.' + cleanDomain);
                });

                if (isAllowed) {
                    // Refresh the content script
                    chrome.tabs.reload(currentTab.id);
                    window.close();
                } else {
                    // Add current domain to allowed domains
                    const updatedDomains = [...allowedDomains, currentDomain];
                    chrome.storage.sync.set({ allowedDomains: updatedDomains }, () => {
                        chrome.tabs.reload(currentTab.id);
                        window.close();
                    });
                }
            });
        });
    });

    // Initialize when popup opens
    document.addEventListener('DOMContentLoaded', initialize);
})();