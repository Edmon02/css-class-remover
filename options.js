(function () {
    'use strict';

    const domainsTextarea = document.getElementById('domains');
    const saveButton = document.getElementById('save');
    const clearButton = document.getElementById('clear');
    const statusDiv = document.getElementById('status');
    const domainList = document.getElementById('domainList');

    // Load saved domains
    function loadDomains() {
        chrome.storage.sync.get(['allowedDomains'], (result) => {
            const domains = result.allowedDomains || [];
            domainsTextarea.value = domains.join('\n');
            updateDomainList(domains);
        });
    }

    // Update the displayed domain list
    function updateDomainList(domains) {
        domainList.innerHTML = '';

        if (domains.length === 0) {
            const li = document.createElement('li');
            li.textContent = 'No domains configured';
            li.style.color = '#666';
            li.style.fontStyle = 'italic';
            domainList.appendChild(li);
        } else {
            domains.forEach(domain => {
                const li = document.createElement('li');
                li.textContent = domain;
                domainList.appendChild(li);
            });
        }
    }

    // Validate domain format
    function isValidDomain(domain) {
        const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        return domainRegex.test(domain);
    }

    // Show status message
    function showStatus(message, isError = false) {
        statusDiv.textContent = message;
        statusDiv.className = `status ${isError ? 'error' : 'success'}`;
        statusDiv.style.display = 'block';

        setTimeout(() => {
            statusDiv.style.display = 'none';
        }, 3000);
    }

    // Save domains
    function saveDomains() {
        const input = domainsTextarea.value.trim();

        if (!input) {
            showStatus('Please enter at least one domain.', true);
            return;
        }

        const domains = input
            .split('\n')
            .map(domain => domain.trim().toLowerCase())
            .filter(domain => domain.length > 0)
            .filter((domain, index, arr) => arr.indexOf(domain) === index); // Remove duplicates

        // Validate all domains
        const invalidDomains = domains.filter(domain => !isValidDomain(domain));

        if (invalidDomains.length > 0) {
            showStatus(`Invalid domain format: ${invalidDomains.join(', ')}`, true);
            return;
        }

        // Save to storage
        saveButton.disabled = true;
        saveButton.textContent = 'Saving...';

        chrome.storage.sync.set({ allowedDomains: domains }, () => {
            if (chrome.runtime.lastError) {
                showStatus('Error saving settings: ' + chrome.runtime.lastError.message, true);
            } else {
                showStatus(`Successfully saved ${domains.length} domain(s)!`);
                updateDomainList(domains);
            }

            saveButton.disabled = false;
            saveButton.textContent = 'Save Settings';
        });
    }

    // Clear all domains
    function clearDomains() {
        if (confirm('Are you sure you want to clear all domains?')) {
            chrome.storage.sync.set({ allowedDomains: [] }, () => {
                domainsTextarea.value = '';
                updateDomainList([]);
                showStatus('All domains cleared.');
            });
        }
    }

    // Event listeners
    saveButton.addEventListener('click', saveDomains);
    clearButton.addEventListener('click', clearDomains);

    // Auto-save on Ctrl+S
    domainsTextarea.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            saveDomains();
        }
    });

    // Load domains on page load
    document.addEventListener('DOMContentLoaded', loadDomains);
})();