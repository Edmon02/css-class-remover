document.addEventListener('DOMContentLoaded', function () {
    const domainsTextarea = document.getElementById('domains');
    const saveBtn = document.getElementById('save');
    const resetBtn = document.getElementById('reset');
    const statusDiv = document.getElementById('status');

    // Load current settings
    chrome.storage.sync.get(['enabledDomains'], function (result) {
        const domains = result.enabledDomains || [];
        domainsTextarea.value = domains.join('\n');
    });

    // Save settings
    saveBtn.addEventListener('click', function () {
        const domains = domainsTextarea.value
            .split('\n')
            .map(domain => domain.trim())
            .filter(domain => domain.length > 0);

        chrome.storage.sync.set({ enabledDomains: domains }, function () {
            showStatus('Settings saved successfully!', 'success');
        });
    });

    // Reset settings
    resetBtn.addEventListener('click', function () {
        domainsTextarea.value = '';
        chrome.storage.sync.set({ enabledDomains: [] }, function () {
            showStatus('Settings reset successfully!', 'success');
        });
    });

    function showStatus(message, type) {
        statusDiv.textContent = message;
        statusDiv.className = `status ${type}`;
        statusDiv.style.display = 'block';

        setTimeout(() => {
            statusDiv.style.display = 'none';
        }, 3000);
    }
});