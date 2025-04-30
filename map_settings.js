// Assumes positionModalCenter is defined globally or imported

// --- Settings Panel Logic ---
const defaultSettings = {
    fontFamily: '"ZCOOL XiaoWei", "Microsoft YaHei", sans-serif',
    titleFontFamily: '"ZCOOL QingKe HuangYou", "Microsoft YaHei", sans-serif',
    fontSize: '13px',
    fontColor: '#e6e6e6',
    uiColor: '#e8a85e', // Accent Orange
    uiBgColor: '#2c313a', // Dark Background
    buttonColor: '#7cb342', // Green Button
    shadowsEnabled: true,
    showQuickCommands: true,
    showBulletChat: true // Default bullet chat to visible
};

const presetColorSchemes = [
    { name: "默认深色", fontColor: "#e6e6e6", uiColor: "#e8a85e", uiBgColor: "#2c313a", buttonColor: "#7cb342" },
    { name: "清新蓝", fontColor: "#d0e0f0", uiColor: "#64b5f6", uiBgColor: "#37474f", buttonColor: "#4dd0e1" },
    { name: "活力橙", fontColor: "#fff3e0", uiColor: "#ffb74d", uiBgColor: "#4e342e", buttonColor: "#ff8a65" },
    { name: "典雅紫", fontColor: "#ede7f6", uiColor: "#ba68c8", uiBgColor: "#4527a0", buttonColor: "#7e57c2" },
    { name: "科技青", fontColor: "#e0f2f1", uiColor: "#4db6ac", uiBgColor: "#263238", buttonColor: "#80cbc4" },
    { name: "简约灰", fontColor: "#37474f", uiColor: "#90a4ae", uiBgColor: "#eceff1", buttonColor: "#78909c" }
];

function saveSettings(settings) {
    try { localStorage.setItem('mapPluginSettings', JSON.stringify(settings)); }
    catch (e) { console.error("Failed to save settings to localStorage:", e); }
}

function loadSettings() {
    try {
        const saved = localStorage.getItem('mapPluginSettings');
        if (saved) return { ...defaultSettings, ...JSON.parse(saved) };
    } catch (e) { console.error("Failed to load settings from localStorage:", e); }
    return { ...defaultSettings };
}

function applySettings(settings, rootElement) {
    if (!rootElement) rootElement = document.documentElement;
    rootElement.style.setProperty('--font-main', settings.fontFamily);
    rootElement.style.setProperty('--font-title', settings.titleFontFamily);
    rootElement.style.setProperty('--font-size-base', settings.fontSize);
    // Convert font size px to number for root html font size adjustment
    const baseSize = parseInt(settings.fontSize, 10);
    if (!isNaN(baseSize)) {
        document.documentElement.style.fontSize = `${baseSize}px`;
    }
    rootElement.style.setProperty('--theme-text-light', settings.fontColor);
    rootElement.style.setProperty('--theme-accent-orange', settings.uiColor);
    // Calculate lighter accent color (simple brightness increase)
    // This is a basic approximation and might not work well for all colors
    try {
         let hex = settings.uiColor.replace('#', '');
         let r = parseInt(hex.substring(0, 2), 16);
         let g = parseInt(hex.substring(2, 4), 16);
         let b = parseInt(hex.substring(4, 6), 16);
         r = Math.min(255, r + 30); // Increase brightness
         g = Math.min(255, g + 30);
         b = Math.min(255, b + 30);
         const lightAccent = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
         rootElement.style.setProperty('--theme-accent-orange-light', lightAccent);
         // Set RGB version for opacity usage
         rootElement.style.setProperty('--theme-accent-orange-rgb', `${r},${g},${b}`); 
    } catch (e) {
         console.error("Error calculating light accent color:", e);
         rootElement.style.setProperty('--theme-accent-orange-light', settings.uiColor); // Fallback
         rootElement.style.setProperty('--theme-accent-orange-rgb', `232,168,94`); // Default fallback RGB
    }
    rootElement.style.setProperty('--theme-bg-dark', settings.uiBgColor);
    // Calculate medium and light background colors (simple brightness increase)
     try {
         let hex = settings.uiBgColor.replace('#', '');
         let r = parseInt(hex.substring(0, 2), 16);
         let g = parseInt(hex.substring(2, 4), 16);
         let b = parseInt(hex.substring(4, 6), 16);
         let r_med = Math.min(255, r + 20);
         let g_med = Math.min(255, g + 20);
         let b_med = Math.min(255, b + 20);
         let r_light = Math.min(255, r_med + 18);
         let g_light = Math.min(255, g_med + 18);
         let b_light = Math.min(255, b_med + 18);
         const medBg = `#${r_med.toString(16).padStart(2, '0')}${g_med.toString(16).padStart(2, '0')}${b_med.toString(16).padStart(2, '0')}`;
         const lightBg = `#${r_light.toString(16).padStart(2, '0')}${g_light.toString(16).padStart(2, '0')}${b_light.toString(16).padStart(2, '0')}`;
         rootElement.style.setProperty('--theme-bg-medium', medBg);
         rootElement.style.setProperty('--theme-bg-light', lightBg);
     } catch (e) {
         console.error("Error calculating background colors:", e);
         rootElement.style.setProperty('--theme-bg-medium', '#3e4451'); // Fallback
         rootElement.style.setProperty('--theme-bg-light', '#505663'); // Fallback
     }
    rootElement.style.setProperty('--theme-button-color', settings.buttonColor);
     // Calculate button hover color
     try {
         let hex = settings.buttonColor.replace('#', '');
         let r = parseInt(hex.substring(0, 2), 16);
         let g = parseInt(hex.substring(2, 4), 16);
         let b = parseInt(hex.substring(4, 6), 16);
         r = Math.min(255, r + 20);
         g = Math.min(255, g + 20);
         b = Math.min(255, b + 20);
         const hoverColor = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
         rootElement.style.setProperty('--theme-button-hover-color', hoverColor);
     } catch (e) {
         console.error("Error calculating button hover color:", e);
         rootElement.style.setProperty('--theme-button-hover-color', '#8fd352'); // Fallback
     }

    // Toggle shadow classes based on setting
    const shadowElements = document.querySelectorAll('.map-interface, .location-grid, #visual-map-container, .location-details, .sub-location-grid, .game-action-button, .modal-dialog, .settings-panel-content, .confirm-dialog, .character-modal-dialog, .partner-button, .sub-location-button, .character-item, .action-button, .switch-area-button, .bullet-chat-container, .settings-action-button, .preset-scheme-button, .shop-item, .inventory-item, .custom-send-button, .dialog-button, .interaction-button');
     if (settings.shadowsEnabled) {
         shadowElements.forEach(el => el.classList.add('shadow-enabled')); // Use a class to manage shadows
         rootElement.style.setProperty('--shadow-subtle', '0 2px 5px rgba(0, 0, 0, 0.2)');
         rootElement.style.setProperty('--shadow-medium', '0 4px 10px rgba(0, 0, 0, 0.25)');
         rootElement.style.setProperty('--shadow-strong', '0 8px 20px rgba(0, 0, 0, 0.3)');
     } else {
         shadowElements.forEach(el => el.classList.remove('shadow-enabled'));
         rootElement.style.setProperty('--shadow-subtle', 'none');
         rootElement.style.setProperty('--shadow-medium', 'none');
         rootElement.style.setProperty('--shadow-strong', 'none');
     }

     // Toggle quick commands section visibility
     const quickCommandsSection = document.getElementById('game-actions-section');
     if (quickCommandsSection) {
         quickCommandsSection.style.display = settings.showQuickCommands ? 'grid' : 'none';
     }
     
     // Toggle bullet chat visibility
     const bulletChatContainer = document.getElementById('bullet-chat-container');
     if (bulletChatContainer) {
          bulletChatContainer.classList.toggle('hidden', !settings.showBulletChat);
     }
}

function updateSettingsUI(settings, elements) {
     if (!elements) { console.error("Elements object not provided to updateSettingsUI"); return; }
     // Helper to safely set value
     const setValue = (el, value) => { if (el) el.value = value; else console.warn("Element is null in updateSettingsUI for value:", value); };
     const setChecked = (el, checked) => { if (el) el.checked = checked; else console.warn("Element is null in updateSettingsUI for checked:", checked); };
     const setText = (el, text) => { if (el) el.textContent = text; else console.warn("Element is null in updateSettingsUI for text:", text); };

     setValue(elements.fontStyleSelect, settings.fontFamily);
     setValue(elements.titleFontStyleSelect, settings.titleFontFamily);
     setValue(elements.fontSizeSlider, parseInt(settings.fontSize, 10));
     setText(elements.fontSizeValue, settings.fontSize);
     setValue(elements.fontColorPicker, settings.fontColor);
     setValue(elements.uiColorPicker, settings.uiColor);
     setValue(elements.uiBgColorPicker, settings.uiBgColor);
     setValue(elements.buttonColorPicker, settings.buttonColor);
     setChecked(elements.shadowToggle, settings.shadowsEnabled);
     setChecked(elements.quickCommandsToggle, settings.showQuickCommands);
     setChecked(elements.bulletChatToggle, settings.showBulletChat); // Update bullet chat toggle
}

function setupSettingsPanel() {
    const elements = {
        settingsPanel: document.getElementById('settings-panel'),
        settingsToggleBtn: document.getElementById('settings-toggle-btn'),
        settingsCloseBtn: document.getElementById('settings-close-btn'),
        fontStyleSelect: document.getElementById('font-style-select'),
        titleFontStyleSelect: document.getElementById('title-font-style-select'),
        fontSizeSlider: document.getElementById('font-size-slider'),
        fontSizeValue: document.getElementById('font-size-value'),
        fontColorPicker: document.getElementById('font-color-picker'),
        uiColorPicker: document.getElementById('ui-color-picker'),
        uiBgColorPicker: document.getElementById('ui-bg-color-picker'),
        buttonColorPicker: document.getElementById('button-color-picker'),
        shadowToggle: document.getElementById('shadow-toggle'),
        quickCommandsToggle: document.getElementById('quick-commands-toggle'),
        bulletChatToggle: document.getElementById('bullet-chat-toggle'), // Add bullet chat toggle element
        applyBtn: document.getElementById('settings-apply-btn'),
        resetBtn: document.getElementById('settings-reset-btn'),
        mapInterface: document.querySelector('.map-interface'), // Target the main container for applying styles
        presetContainer: document.getElementById('preset-schemes-container'),
        settingsPanelContent: document.querySelector('#settings-panel .settings-panel-content') // Get content panel for centering
    };

    // Check if essential elements exist
    if (!elements.settingsPanel || !elements.settingsToggleBtn || !elements.settingsCloseBtn || !elements.applyBtn || !elements.resetBtn || !elements.mapInterface || !elements.settingsPanelContent) {
        console.error("Essential settings panel elements not found! Aborting setup.");
        // Attempt to find the toggle button anyway to prevent errors if only panel is missing
        if (elements.settingsToggleBtn) {
            elements.settingsToggleBtn.disabled = true;
            elements.settingsToggleBtn.title = "设置面板加载失败";
        }
        return;
    }

    let currentSettings = loadSettings();
    applySettings(currentSettings, elements.mapInterface); // Apply initial settings to the map interface
    updateSettingsUI(currentSettings, elements); // Update controls to match loaded settings

    function openSettingsPanelLocal() {
        if (!elements.settingsPanel || !elements.settingsToggleBtn || !elements.settingsPanelContent) return;
        elements.settingsPanel.classList.remove('hidden');
        elements.settingsToggleBtn.classList.add('active');
        requestAnimationFrame(() => positionModalCenter(elements.settingsPanelContent)); // Center the content panel
    }

    function closeSettingsPanelLocal() {
        if (!elements.settingsPanel || !elements.settingsToggleBtn) return;
        elements.settingsPanel.classList.add('hidden');
        elements.settingsToggleBtn.classList.remove('active');
    }

    elements.settingsToggleBtn.addEventListener('click', openSettingsPanelLocal);
    elements.settingsCloseBtn.addEventListener('click', closeSettingsPanelLocal);
    elements.settingsPanel.addEventListener('click', (event) => {
        if (event.target === elements.settingsPanel) closeSettingsPanelLocal(); // Close if clicking overlay
    });

    if (elements.fontSizeSlider && elements.fontSizeValue) {
        elements.fontSizeSlider.addEventListener('input', () => {
            elements.fontSizeValue.textContent = `${elements.fontSizeSlider.value}px`;
        });
    }

     elements.applyBtn.addEventListener('click', () => {
         // Check elements before accessing value
         const getChecked = (el) => el ? el.checked : false;
         const getValue = (el, defaultValue = '') => el ? el.value : defaultValue;

         const newSettings = {
             fontFamily: getValue(elements.fontStyleSelect, defaultSettings.fontFamily),
             titleFontFamily: getValue(elements.titleFontStyleSelect, defaultSettings.titleFontFamily),
             fontSize: elements.fontSizeSlider ? `${elements.fontSizeSlider.value}px` : defaultSettings.fontSize,
             fontColor: getValue(elements.fontColorPicker, defaultSettings.fontColor),
             uiColor: getValue(elements.uiColorPicker, defaultSettings.uiColor),
             uiBgColor: getValue(elements.uiBgColorPicker, defaultSettings.uiBgColor),
             buttonColor: getValue(elements.buttonColorPicker, defaultSettings.buttonColor),
             shadowsEnabled: getChecked(elements.shadowToggle),
             showQuickCommands: getChecked(elements.quickCommandsToggle),
             showBulletChat: getChecked(elements.bulletChatToggle) // Get bullet chat setting
          };
          currentSettings = newSettings; // Update current settings state
          applySettings(newSettings, elements.mapInterface); // Apply to the map interface
          saveSettings(newSettings);
          closeSettingsPanelLocal();
    });

    elements.resetBtn.addEventListener('click', () => {
        currentSettings = { ...defaultSettings };
        applySettings(currentSettings, elements.mapInterface); // Apply to the map interface
        updateSettingsUI(currentSettings, elements);
        saveSettings(currentSettings);
    });

    // Populate Preset Schemes
    if (elements.presetContainer) {
        elements.presetContainer.innerHTML = ''; // Clear existing presets
        presetColorSchemes.forEach(scheme => {
            const presetButton = document.createElement('button');
            presetButton.className = 'preset-scheme-button';
            presetButton.title = scheme.name;
            presetButton.innerHTML = `
                <div class="preset-color-preview" style="background-color: ${scheme.uiBgColor};">
                    <div style="position: absolute; top: 5px; right: 5px; width: 18px; height: 18px; background-color: ${scheme.uiColor}; border-radius: 50%; box-shadow: 0 0 3px rgba(0,0,0,0.3);"></div>
                    <div style="position: absolute; bottom: 5px; left: 5px; width: 18px; height: 18px; background-color: ${scheme.buttonColor}; border-radius: 50%; box-shadow: 0 0 3px rgba(0,0,0,0.3);"></div>
                    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 10px; color: ${scheme.fontColor}; text-shadow: 0 0 2px rgba(0,0,0,0.5);">Aa</div>
                </div>
                <span class="preset-name">${scheme.name}</span>
            `;
            presetButton.addEventListener('click', () => {
                // Update only the color-related settings in the UI controls
                if(elements.fontColorPicker) elements.fontColorPicker.value = scheme.fontColor;
                if(elements.uiColorPicker) elements.uiColorPicker.value = scheme.uiColor;
                if(elements.uiBgColorPicker) elements.uiBgColorPicker.value = scheme.uiBgColor;
                if(elements.buttonColorPicker) elements.buttonColorPicker.value = scheme.buttonColor;
                // Note: This only updates the controls. User must click "Apply" to save and apply fully.
                // Optionally, could directly apply here:
                // currentSettings = { ...currentSettings, fontColor: scheme.fontColor, uiColor: scheme.uiColor, uiBgColor: scheme.uiBgColor, buttonColor: scheme.buttonColor };
                // applySettings(currentSettings, elements.mapInterface);
                // updateSettingsUI(currentSettings, elements); // Re-sync all controls if applied directly
            });
            elements.presetContainer.appendChild(presetButton);
        });
    } else {
        console.error("Preset container not found.");
    }
}
// --- End Settings Panel Logic ---
