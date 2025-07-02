(function() {
    'use strict';
    
    // Configuration
    const TARGET_CLASSES = ['test-item-child', 'blur', 'redirect-on-click'];
    const DEBOUNCE_DELAY = 50;
    
    // State
    let isEnabled = false;
    let enabledDomains = [];
    let redirectsBlocked = 0;
    let classesRemoved = 0;
    let originalURL = window.location.href;
    
    // Utility functions
    function getCurrentDomain() {
        return window.location.hostname;
    }
    
    function debounce(func, delay) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    }
    
    // ULTRA AGGRESSIVE redirect prevention
    function preventAllRedirectsUltraAggressive() {
        console.log('🛡️ Activating ULTRA AGGRESSIVE redirect prevention...');
        
        // 1. Override ALL window.location properties and methods
        const originalLocation = window.location;
        
        // Create a fake location object that blocks everything
        const blockedLocation = {
            href: originalURL,
            protocol: originalLocation.protocol,
            host: originalLocation.host,
            hostname: originalLocation.hostname,
            port: originalLocation.port,
            pathname: originalLocation.pathname,
            search: originalLocation.search,
            hash: originalLocation.hash,
            origin: originalLocation.origin,
            
            assign: function(url) {
                console.log('🚫 BLOCKED location.assign to:', url);
                redirectsBlocked++;
                return false;
            },
            replace: function(url) {
                console.log('🚫 BLOCKED location.replace to:', url);
                redirectsBlocked++;
                return false;
            },
            reload: function() {
                console.log('🚫 BLOCKED location.reload');
                redirectsBlocked++;
                return false;
            },
            toString: function() {
                return originalURL;
            }
        };
        
        // Override window.location completely
        try {
            Object.defineProperty(window, 'location', {
                get: function() {
                    return blockedLocation;
                },
                set: function(value) {
                    console.log('🚫 BLOCKED window.location assignment to:', value);
                    redirectsBlocked++;
                    return false;
                },
                configurable: false
            });
        } catch (e) {
            console.log('Partial location override failed, using alternative');
        }
        
        // 2. Override history methods
        const originalPushState = history.pushState;
        const originalReplaceState = history.replaceState;
        const originalBack = history.back;
        const originalForward = history.forward;
        const originalGo = history.go;
        
        history.pushState = function() {
            console.log('🚫 BLOCKED history.pushState');
            redirectsBlocked++;
            return false;
        };
        
        history.replaceState = function() {
            console.log('🚫 BLOCKED history.replaceState');
            redirectsBlocked++;
            return false;
        };
        
        history.back = function() {
            console.log('🚫 BLOCKED history.back');
            redirectsBlocked++;
            return false;
        };
        
        history.forward = function() {
            console.log('🚫 BLOCKED history.forward');
            redirectsBlocked++;
            return false;
        };
        
        history.go = function() {
            console.log('🚫 BLOCKED history.go');
            redirectsBlocked++;
            return false;
        };
        
        // 3. Override window.open and close
        const originalOpen = window.open;
        const originalClose = window.close;
        
        window.open = function() {
            console.log('🚫 BLOCKED window.open');
            redirectsBlocked++;
            return null;
        };
        
        window.close = function() {
            console.log('🚫 BLOCKED window.close');
            redirectsBlocked++;
            return false;
        };
        
        // 4. Block ALL setTimeout and setInterval that might cause redirects
        const originalSetTimeout = window.setTimeout;
        const originalSetInterval = window.setInterval;
        
        window.setTimeout = function(func, delay, ...args) {
            // Check if the function might cause a redirect
            const funcString = func.toString();
            if (funcString.includes('location') || 
                funcString.includes('redirect') || 
                funcString.includes('navigate') ||
                funcString.includes('window.open') ||
                funcString.includes('history.')) {
                console.log('🚫 BLOCKED setTimeout redirect function');
                redirectsBlocked++;
                return 0;
            }
            
            // Otherwise allow it
            return originalSetTimeout.call(window, func, delay, ...args);
        };
        
        window.setInterval = function(func, delay, ...args) {
            const funcString = func.toString();
            if (funcString.includes('location') || 
                funcString.includes('redirect') || 
                funcString.includes('navigate') ||
                funcString.includes('window.open') ||
                funcString.includes('history.')) {
                console.log('🚫 BLOCKED setInterval redirect function');
                redirectsBlocked++;
                return 0;
            }
            
            return originalSetInterval.call(window, func, delay, ...args);
        };
        
        // 5. Monitor for URL changes and prevent them
        let urlCheckInterval = setInterval(function() {
            if (window.location.href !== originalURL) {
                console.log('🚫 DETECTED URL change attempt, reverting...');
                try {
                    // Try to prevent the navigation
                    window.stop();
                    history.replaceState(null, '', originalURL);
                    redirectsBlocked++;
                } catch (e) {
                    console.log('Could not revert URL change');
                }
            }
        }, 100);
        
        // 6. Block ALL form submissions
        document.addEventListener('submit', function(e) {
            console.log('🚫 BLOCKED form submission');
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            redirectsBlocked++;
            return false;
        }, true);
        
        // 7. Block beforeunload and unload events
        window.addEventListener('beforeunload', function(e) {
            console.log('🚫 BLOCKED beforeunload');
            e.preventDefault();
            e.stopPropagation();
            redirectsBlocked++;
            return false;
        }, true);
        
        window.addEventListener('unload', function(e) {
            console.log('🚫 BLOCKED unload');
            e.preventDefault();
            e.stopPropagation();
            redirectsBlocked++;
            return false;
        }, true);
        
        // 8. Override document.write and innerHTML that might contain redirects
        const originalWrite = document.write;
        const originalWriteln = document.writeln;
        
        document.write = function(content) {
            if (content.includes('location') || content.includes('redirect') || content.includes('<meta')) {
                console.log('🚫 BLOCKED document.write with redirect content');
                redirectsBlocked++;
                return;
            }
            return originalWrite.call(document, content);
        };
        
        document.writeln = function(content) {
            if (content.includes('location') || content.includes('redirect') || content.includes('<meta')) {
                console.log('🚫 BLOCKED document.writeln with redirect content');
                redirectsBlocked++;
                return;
            }
            return originalWriteln.call(document, content);
        };
        
        // 9. Block AJAX redirects
        const originalFetch = window.fetch;
        const originalXHROpen = XMLHttpRequest.prototype.open;
        
        window.fetch = function(input, init) {
            console.log('🔍 Monitoring fetch request to:', input);
            // Allow fetch but don't let it redirect the page
            return originalFetch.call(window, input, init);
        };
        
        XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
            console.log('🔍 Monitoring XHR request to:', url);
            return originalXHROpen.call(this, method, url, async, user, password);
        };
        
        // 10. Remove ALL click event listeners and replace them with harmless ones
        function neutralizeAllClickEvents() {
            const allElements = document.querySelectorAll('*');
            allElements.forEach(element => {
                // Clone element to remove ALL event listeners
                if (element.onclick || element.getAttribute('onclick')) {
                    console.log('🧹 Neutralizing click events on:', element.tagName, element.className);
                    
                    // Remove onclick attribute
                    element.removeAttribute('onclick');
                    
                    // Remove all event listeners by cloning (if it's safe to do so)
                    if (!element.tagName.match(/^(HTML|HEAD|BODY|SCRIPT|STYLE)$/)) {
                        try {
                            const newElement = element.cloneNode(true);
                            element.parentNode.replaceChild(newElement, element);
                        } catch (e) {
                            // If cloning fails, just remove the onclick
                            console.log('Could not clone element, just removing onclick');
                        }
                    }
                }
                
                // Remove other event attributes
                const eventAttrs = ['onmousedown', 'onmouseup', 'onsubmit', 'onchange', 'onfocus', 'onblur'];
                eventAttrs.forEach(attr => {
                    if (element.hasAttribute(attr)) {
                        element.removeAttribute(attr);
                    }
                });
            });
        }
        
        // Run neutralization immediately and after DOM changes
        neutralizeAllClickEvents();
        
        // 11. Use MutationObserver to catch and neutralize new elements
        const neutralizeObserver = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(function(node) {
                        if (node.nodeType === 1) { // Element node
                            neutralizeAllClickEvents();
                        }
                    });
                }
            });
        });
        
        neutralizeObserver.observe(document.body || document.documentElement, {
            childList: true,
            subtree: true
        });
    }
    
    // Check if an element is a legitimate answer choice
    function isAnswerChoice(element) {
        return element.classList.contains('item-button-answer') || 
               element.closest('.item-button-answer') ||
               (element.tagName === 'LABEL' && element.getAttribute('for') && element.getAttribute('for').startsWith('ans')) ||
               (element.tagName === 'SPAN' && element.id && element.id.match(/^\d+$/)) ||
               element.closest('.item-answer-main');
    }
    
    // Add safe click handlers for answer choices only
    function addSafeAnswerHandlers() {
        const answerElements = document.querySelectorAll('.item-button-answer');
        answerElements.forEach(element => {
            // Remove any existing click handlers first
            element.onclick = null;
            element.removeAttribute('onclick');
            
            // Add a safe click handler that doesn't redirect
            element.addEventListener('click', function(e) {
                console.log('✅ Safe answer selection on:', element);
                
                // Visual feedback only - change appearance to show selection
                const allAnswers = document.querySelectorAll('.item-button-answer');
                allAnswers.forEach(ans => ans.style.backgroundColor = '');
                element.style.backgroundColor = '#e6f3ff';
                
                // Stop any propagation that might trigger redirects
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                
                return false;
            }, true);
        });
    }
    
    // Class removal function (unchanged)
    function removeTargetClasses() {
        if (!isEnabled) return;
        
        const allElements = document.querySelectorAll('*');
        let removedThisRound = 0;
        
        allElements.forEach(element => {
            TARGET_CLASSES.forEach(className => {
                if (element.classList.contains(className)) {
                    element.classList.remove(className);
                    removedThisRound++;
                    console.log('🧹 Removed class:', className, 'from', element.tagName);
                }
            });
        });
        
        classesRemoved += removedThisRound;
        if (removedThisRound > 0) {
            console.log(`✅ Removed ${removedThisRound} classes (total: ${classesRemoved})`);
        }
    }
    
    // Debounced class removal
    const debouncedClassRemoval = debounce(removeTargetClasses, DEBOUNCE_DELAY);
    
    // DOM observer for class removal
    let observer;
    
    function startClassObserver() {
        if (observer) observer.disconnect();
        
        observer = new MutationObserver(mutations => {
            let shouldRemoveClasses = false;
            
            mutations.forEach(mutation => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    shouldRemoveClasses = true;
                } else if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    shouldRemoveClasses = true;
                }
            });
            
            if (shouldRemoveClasses) {
                debouncedClassRemoval();
                // Also re-add safe handlers for new elements
                setTimeout(addSafeAnswerHandlers, 100);
            }
        });
        
        const target = document.body || document.documentElement;
        observer.observe(target, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class']
        });
        
        console.log('🔍 Started class removal observer');
    }
    
    // Settings management
    async function loadSettings() {
        try {
            const result = await chrome.storage.sync.get(['enabledDomains']);
            enabledDomains = result.enabledDomains || [];
            
            const currentDomain = getCurrentDomain();
            isEnabled = enabledDomains.includes(currentDomain);
            
            console.log(`🔧 Extension ${isEnabled ? 'ENABLED' : 'DISABLED'} for ${currentDomain}`);
            
            if (isEnabled) {
                // Use ultra aggressive redirect prevention
                preventAllRedirectsUltraAggressive();
                
                // Add safe answer handlers
                setTimeout(addSafeAnswerHandlers, 500);
                
                // Start class removal
                removeTargetClasses();
                startClassObserver();
                
                // Continue removing classes periodically
                setInterval(removeTargetClasses, 1000);
                
                // Re-add safe handlers periodically
                setInterval(addSafeAnswerHandlers, 2000);
            }
        } catch (error) {
            console.error('❌ Failed to load settings:', error);
        }
    }
    
    // Initialize everything
    function initialize() {
        console.log('🚀 Initializing ULTRA AGGRESSIVE CSS Class Remover & Redirect Blocker...');
        
        loadSettings();
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', loadSettings);
        }
        
        window.addEventListener('load', loadSettings);
    }
    
    // Expose status for popup
    window.extensionStatus = {
        isEnabled: () => isEnabled,
        redirectsBlocked: () => redirectsBlocked,
        classesRemoved: () => classesRemoved,
        currentDomain: getCurrentDomain
    };
    
    // Listen for storage changes
    if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.onChanged.addListener((changes, namespace) => {
            if (namespace === 'sync' && changes.enabledDomains) {
                console.log('📝 Settings changed, reloading...');
                loadSettings();
            }
        });
    }
    
    // Start everything immediately
    initialize();
    
})();