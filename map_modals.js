// Assumes positionModalCenter is defined globally or imported
// Assumes renderShopItems, renderInventoryItems are defined globally or imported

// --- Character Modal ---
function closeCharacterModal() {
    const modal = document.getElementById('character-modal');
    if (modal) modal.classList.add('hidden');
    // Reset selection state if needed (might be handled elsewhere)
    selectedCharacterName = null; // Assuming selectedCharacterName is accessible
     document.querySelectorAll('#location-characters .character-item.selected').forEach(btn => {
        btn.classList.remove('selected');
    });
}

// --- Shop Modal ---
function openShopModal() {
    const modal = document.getElementById('shop-modal');
    const dialog = modal?.querySelector('.shop-modal-dialog');
    if (modal && dialog) {
        renderShopItems(); // Re-render items every time it opens
        modal.classList.remove('hidden');
        requestAnimationFrame(() => positionModalCenter(dialog));
    } else {
        console.error("[Map Plugin] Shop modal or dialog not found.");
    }
}

function closeShopModal() {
    const modal = document.getElementById('shop-modal');
    if (modal) modal.classList.add('hidden');
}

// --- Inventory Modal ---
function openInventoryModal() {
    const modal = document.getElementById('inventory-modal');
    const dialog = modal?.querySelector('.inventory-modal-dialog');
    if (modal && dialog) {
        renderInventoryItems(); // Re-render items every time it opens
        document.getElementById('inventory-item-details').classList.add('hidden'); // Hide details initially
        modal.classList.remove('hidden');
        requestAnimationFrame(() => positionModalCenter(dialog));
    } else {
        console.error("[Map Plugin] Inventory modal or dialog not found.");
    }
}

function closeInventoryModal() {
    const modal = document.getElementById('inventory-modal');
    if (modal) modal.classList.add('hidden');
}

// --- Confirmation Modal (Generic Close/Cancel Logic) ---
// Note: Opening is handled by specific actions (confirmAction, confirmInteraction, buyItem, etc.)
function setupConfirmationModalListeners() {
    const confirmOverlay = document.getElementById('confirm-overlay');
    const cancelBtn = document.getElementById('cancel-action-btn');

    if (!confirmOverlay || !cancelBtn) {
        console.error("Confirmation modal overlay or cancel button not found.");
        return;
    }

    // Generic cancel button functionality
    cancelBtn.addEventListener('click', () => {
        confirmOverlay.classList.add('hidden');
        // Important: Specific execute listeners are added/removed dynamically in confirmAction/confirmInteraction etc.
        // We don't remove execute listeners here, as they are handled by the functions that add them.
    });

    // Generic overlay click to close
    confirmOverlay.addEventListener('click', (event) => {
        if (event.target === confirmOverlay) { // Click on overlay background
            confirmOverlay.classList.add('hidden');
            // Also ensure dynamic listeners are potentially cleaned up if needed, though usually handled by the cancel/execute paths.
        }
    });
}

// Call this function once during initialization (e.g., in init() in map_init.js)
// setupConfirmationModalListeners();
