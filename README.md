# CSS Class Remover Chrome Extension

A lightweight Chrome extension that automatically removes specific CSS classes (`test-item-child` and `blur`) from div elements on user-specified websites.

## Features

- 🎯 **Targeted Removal**: Removes only `test-item-child` and `blur` classes from `<div>` elements
- 🔄 **Real-time Monitoring**: Uses MutationObserver to handle dynamically added content
- ⚙️ **Domain Management**: Simple interface to add/remove allowed domains
- 🚀 **Performance Optimized**: Debounced operations and efficient DOM queries
- 🔒 **Secure**: Manifest V3 compliant with minimal permissions
- 💾 **Persistent Settings**: Domain preferences saved to Chrome storage

## Installation

1. **Download/Clone** this repository
2. **Open Chrome** and navigate to `chrome://extensions/`
3. **Enable Developer Mode** (toggle in top-right corner)
4. **Click "Load unpacked"** and select the extension folder
5. **Pin the extension** to your toolbar for easy access

## Usage

### Setting Up Domains

1. **Click the extension icon** in your toolbar
2. **Click "Open Settings"** or right-click the icon and select "Options"
3. **Enter domains** in the text area (one per line):
   ```
   example.com
   subdomain.example.org
   another-site.net
   ```
4. **Click "Save Settings"**

### Quick Domain Addition

1. **Visit any website** you want to enable the extension on
2. **Click the extension icon**
3. **Click "Add Domain to Enable"** to quickly add the current site

### Verification

- The extension icon shows the current status
- Green status = Extension is active on current site
- Red status = Extension is not active on current site

## Technical Details

### Files Structure
```
css-class-remover/
├── manifest.json          # Extension configuration
├── content.js            # Main functionality script
├── options.html          # Settings page
├── options.js           # Settings page logic  
├── popup.html           # Extension popup
├── popup.js            # Popup functionality
└── README.md           # Documentation
```

### Key Features

- **Manifest V3**: Uses the latest Chrome extension standard
- **Minimal Permissions**: Only requests `storage` and `activeTab`
- **Debounced MutationObserver**: Efficient real-time DOM monitoring
- **Domain Validation**: Ensures proper domain format
- **CSP Compliant**: No inline scripts or unsafe practices

### Browser Compatibility

- **Chrome 100+**: Full support
- **Edge 100+**: Full support (Chromium-based)
- **Other Chromium browsers**: Should work with manifest V3 support

## Development

To modify or extend the extension:

1. **Edit the source files** as needed
2. **Reload the extension** in `chrome://extensions/`
3. **Test on target websites**

### Adding New Classes

To remove additional CSS classes, modify the `TARGET_CLASSES` array in `content.js`:

```javascript
const TARGET_CLASSES = ['test-item-child', 'blur', 'your-new-class'];
```

## Troubleshooting

**Extension not working?**
- Check if the current domain is in your allowed domains list
- Reload the page after adding a new domain
- Check the browser console for any error messages

**Performance issues?**
- The extension uses debounced operations to minimize performance impact
- Consider reducing the number of monitored domains if issues persist

## Privacy & Security

- No data is sent to external servers
- All settings are stored locally in Chrome storage
- No access to sensitive page content beyond removing specified classes
- Minimal permission requirements

## License

This extension is provided as-is for educational and practical use. Feel free to modify and distribute according to your needs.