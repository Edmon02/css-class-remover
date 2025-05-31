(function () {
    'use strict';

    // Configuration
    const TARGET_CLASSES = ['test-item-child', 'blur'];
    const DEBOUNCE_DELAY = 100;

    let allowedDomains = [];
    let observer = null;
    let debounceTimer = null;

    // Check if current domain is allowed
    function isCurrentDomainAllowed() {
        const currentDomain = window.location.hostname;
        return allowedDomains.some(domain => {
            // Remove protocol and www if present
            const cleanDomain = domain.replace(/^(https?:\/\/)?(www\.)?/, '');
            return currentDomain === cleanDomain || currentDomain.endsWith('.' + cleanDomain);
        });
    }

    // Remove target classes from div elements
    function removeTargetClasses(root = document) {
        const selector = TARGET_CLASSES.map(cls => `div.${cls}`).join(', ');
        const elements = root.querySelectorAll(selector);

        let removedCount = 0;
        elements.forEach(element => {
            TARGET_CLASSES.forEach(className => {
                if (element.classList.contains(className)) {
                    element.classList.remove(className);
                    removedCount++;
                }
            });
        });

        if (removedCount > 0) {
            console.log(`CSS Class Remover: Removed ${removedCount} class instances`);
        }

        return removedCount;
    }

    // Debounced function to handle mutations
    function debouncedMutationHandler(mutations) {
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }

        debounceTimer = setTimeout(() => {
            let processedNodes = new Set();

            mutations.forEach(mutation => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === Node.ELEMENT_NODE && !processedNodes.has(node)) {
                            processedNodes.add(node);

                            // Check if the node itself is a div with target classes
                            if (node.tagName === 'DIV') {
                                TARGET_CLASSES.forEach(className => {
                                    if (node.classList.contains(className)) {
                                        node.classList.remove(className);
                                    }
                                });
                            }

                            // Check children
                            removeTargetClasses(node);
                        }
                    });
                } else if (mutation.type === 'attributes' &&
                    mutation.attributeName === 'class' &&
                    mutation.target.tagName === 'DIV') {
                    // Handle class attribute changes
                    TARGET_CLASSES.forEach(className => {
                        if (mutation.target.classList.contains(className)) {
                            mutation.target.classList.remove(className);
                        }
                    });
                }
            });
        }, DEBOUNCE_DELAY);
    }

    // Initialize MutationObserver
    function initializeObserver() {
        if (observer) {
            observer.disconnect();
        }

        observer = new MutationObserver(debouncedMutationHandler);

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class']
        });
    }

    // Initialize the extension
    function initialize() {
        chrome.storage.sync.get(['allowedDomains'], (result) => {
            allowedDomains = result.allowedDomains || [];

            if (isCurrentDomainAllowed()) {
                console.log('CSS Class Remover: Active on', window.location.hostname);

                // Initial cleanup
                removeTargetClasses();

                // Set up observer for dynamic content
                if (document.body) {
                    initializeObserver();
                } else {
                    // Wait for body to be available
                    const bodyObserver = new MutationObserver((mutations, obs) => {
                        if (document.body) {
                            obs.disconnect();
                            initializeObserver();
                        }
                    });
                    bodyObserver.observe(document.documentElement, { childList: true });
                }
            }
        });
    }

    // Listen for storage changes
    chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === 'sync' && changes.allowedDomains) {
            allowedDomains = changes.allowedDomains.newValue || [];

            if (isCurrentDomainAllowed()) {
                if (!observer) {
                    removeTargetClasses();
                    initializeObserver();
                }
            } else {
                if (observer) {
                    observer.disconnect();
                    observer = null;
                }
            }
        }
    });

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        if (observer) {
            observer.disconnect();
        }
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }
    });

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
})();