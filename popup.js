document.addEventListener('DOMContentLoaded', async function () {
    const currentStatusDiv = document.getElementById('currentStatus');
    const statusText = document.getElementById('statusText');
    const currentDomainSpan = document.getElementById('currentDomain');
    const addDomainBtn = document.getElementById('addDomain');
    const openOptionsBtn = document.getElementById('openOptions');
    const additionalInfo = document.getElementById('additionalInfo');

    try {
        // Get current tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        const currentDomain = new URL(tab.url).hostname;
        currentDomainSpan.textContent = currentDomain;

        // Load settings
        const result = await chrome.storage.sync.get(['enabledDomains']);
        const enabledDomains = result.enabledDomains || [];
        const isEnabled = enabledDomains.includes(currentDomain);

        // Update UI
        if (isEnabled) {
            currentStatusDiv.className = 'status active';
            statusText.textContent = 'Active on this site';
            addDomainBtn.textContent = 'Remove Current Domain';
            addDomainBtn.className = 'btn btn-primary';

            // Try to get stats
            try {
                const results = await chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    func: () => {
                        if (window.extensionStatus) {
                            return {
                                redirectsBlocked: window.extensionStatus.redirectsBlocked(),
                                classesRemoved: window.extensionStatus.classesRemoved()
                            };
                        }
                        return null;
                    }
                });

                if (results && results[0] && results[0].result) {
                    const stats = results[0].result;
                    additionalInfo.innerHTML = `
                        <div style="color: #28a745; font-size: 12px;">
                            ✓ Redirects blocked: ${stats.redirectsBlocked}<br>
                            ✓ Classes removed: ${stats.classesRemoved}
                        </div>
                    `;
                }
            } catch (e) {
                console.log('Could not get stats:', e);
            }
        } else {
            currentStatusDiv.className = 'status inactive';
            statusText.textContent = 'Inactive on this site';
            addDomainBtn.textContent = 'Add Current Domain';
            addDomainBtn.className = 'btn btn-success';
        }

        // Add/Remove domain
        addDomainBtn.addEventListener('click', async function () {
            let updatedDomains;

            if (isEnabled) {
                updatedDomains = enabledDomains.filter(domain => domain !== currentDomain);
            } else {
                updatedDomains = [...enabledDomains, currentDomain];
            }

            await chrome.storage.sync.set({ enabledDomains: updatedDomains });
            chrome.tabs.reload(tab.id);
            window.close();
        });

        // Open options
        openOptionsBtn.addEventListener('click', function () {
            chrome.runtime.openOptionsPage();
            window.close();
        });

    } catch (error) {
        statusText.textContent = 'Error loading extension';
        console.error('Popup error:', error);
    }
});