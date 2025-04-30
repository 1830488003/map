// --- Global Variables ---
let mapData = null;
let selectedMain = null;
let selectedSub = null;
let selectedCharacterName = null;
let hasMoveBlock = false;
let currentMoney = 100; // Example starting money
let shopItems = [ // Example shop items
    { id: 'item001', name: '小面包', description: '恢复少量体力。', price: 10, category: 'consumable', actions: ['使用', '丢弃'] },
    { id: 'item002', name: '红玫瑰', description: '赠送给心仪的人？', price: 50, category: 'gift', actions: ['赠送', '丢弃'] },
    { id: 'item003', name: '神秘钥匙', description: '似乎能打开什么东西。', price: 200, category: 'key', actions: ['查看', '丢弃'] }
];
let inventoryItems = [ // Example starting inventory
    { id: 'inv-start-01', name: '旧地图碎片', description: '一张古老的地图残片。', category: 'quest', actions: ['查看', '丢弃'] }
];
let selectedInventoryItem = null;

// --- Communication Placeholder ---
// Function to send game action requests (replace with actual TavernAI/SillyTavern communication method)
function sendGameActionRequest(message, failureMessage = "操作失败") {
    console.log("Attempting to send game action:", message);
    // In a real scenario, this would likely involve:
    // 1. Finding the correct API or method provided by TavernAI/SillyTavern to send input.
    // 2. Formatting the message according to the API requirements.
    // Example using a hypothetical function (replace with actual implementation):
    if (typeof parent.send_user_input === 'function') { // Check if a common ST function exists
         parent.send_user_input(message); // Send message through parent window if possible
         console.log("Game action sent via parent.send_user_input.");
    } else if (window.send_user_input) {
         window.send_user_input(message);
         console.log("Game action sent via window.send_user_input.");
    } else if (window.SimpleTavern) {
         // Example for a hypothetical SimpleTavern API
         try {
             window.SimpleTavern.sendMessage({ text: message });
             console.log("Game action sent via SimpleTavern API.");
         } catch (e) {
             console.error("Failed to send via SimpleTavern API:", e);
             alert(failureMessage + "\\n无法与游戏通信。");
         }
    } else {
        // Fallback or specific logic for the target environment
        console.warn("No known method to send game action request found. Please adapt 'sendGameActionRequest' for your environment.");
        // Attempt to use postMessage as a generic fallback, host needs to listen
        try {
            window.parent.postMessage({ type: 'gameAction', payload: message }, '*');
            console.log("Game action sent via window.parent.postMessage (requires host listener).");
        } catch(e) {
             console.error("Failed to send via postMessage:", e);
             // alert(failureMessage + "\\n未找到合适的通信方式。"); // Optional: Alert user if no method works
        }
    }
}

// --- General Event Listeners Setup ---
function setupEventListeners() {
    console.log("[Map Plugin] Setting up general event listeners...");

    // Header Buttons (Shop, Inventory, Settings, Bullet Toggle are handled in their respective modules)
    // Add listeners for any other header buttons if they exist.

    // Modal Close Buttons (Specific modals handled in map_modals.js and map_settings.js)
    document.getElementById('close-modal-btn')?.addEventListener('click', closeCharacterModal); // Character modal close
    document.getElementById('character-modal')?.addEventListener('click', (event) => { // Character modal overlay click
         if (event.target === event.currentTarget) {
             closeCharacterModal();
         }
    });
    document.getElementById('close-shop-modal-btn')?.addEventListener('click', closeShopModal);
    document.getElementById('shop-modal')?.addEventListener('click', (event) => { // Shop modal overlay click
         if (event.target === event.currentTarget) {
             closeShopModal();
         }
    });
    document.getElementById('close-inventory-modal-btn')?.addEventListener('click', closeInventoryModal);
     document.getElementById('inventory-modal')?.addEventListener('click', (event) => { // Inventory modal overlay click
         if (event.target === event.currentTarget) {
             closeInventoryModal();
         }
    });

    // Setup listeners for dynamically added elements or specific interactions
    setupGameActionListeners(); // Setup listeners for the bottom action buttons
    setupConfirmationModalListeners(); // Setup generic cancel/overlay close for confirm modal

    // Custom Interaction Input (Character Modal)
    document.getElementById('send-custom-interaction-btn')?.addEventListener('click', sendCustomInteraction);
    document.getElementById('custom-interaction-input')?.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            sendCustomInteraction();
        }
    });

    // Window Message Listener (for potential external updates)
    // window.addEventListener('message', receiveMessage); // Define receiveMessage if needed

    console.log("[Map Plugin] General event listeners setup complete.");
}


// --- Initialization ---
function init() {
    console.log("[Map Plugin] Initializing...");
    // Apply settings first to set CSS variables
    try {
        const settings = loadSettings();
        applySettings(settings, document.querySelector('.map-interface') || document.documentElement);
    } catch(e) {
        console.error("Error applying initial settings:", e);
    }

    // Setup UI components and features
    setupEventListeners(); // Setup general listeners
    setupBulletChatFeatures(); // Setup bullet chat UI and drag/drop
    setupSettingsPanel(); // Setup settings panel UI and listeners

    // Process map data last, as it might rely on UI elements being ready
    processMapData(); // Parse data and render the map

    console.log("[Map Plugin] Initialization complete.");
}

// --- DOM Ready ---
document.addEventListener('DOMContentLoaded', init);
