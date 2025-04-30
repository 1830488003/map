// Assumes currentMoney, shopItems, inventoryItems, selectedInventoryItem are global or accessible
// Assumes sendGameActionRequest, positionModalCenter are defined globally or imported

// --- Shop System Functions ---
function renderShopItems() {
     const shopList = document.getElementById('shop-item-list');
     const moneyDisplay = document.getElementById('shop-player-money');
     if (!shopList || !moneyDisplay) {
         console.error("[Map Plugin] Shop list or money display element not found.");
         return;
     }

     moneyDisplay.textContent = currentMoney; // Assumes currentMoney is accessible
     shopList.innerHTML = ''; // Clear previous items

     if (!shopItems || shopItems.length === 0) { // Assumes shopItems is accessible
         shopList.innerHTML = '<p class="info-message">商店里现在没有商品。</p>';
         return;
     }

     shopItems.forEach((item, index) => { // Assumes shopItems is accessible
         const itemElement = document.createElement('div');
         itemElement.className = 'shop-item';
         // Use a unique identifier if item.id exists, otherwise use index as fallback
         const itemId = item.id || `shop-item-${index}`;
         const quantityInputId = `shop-quantity-${itemId}`;
         itemElement.innerHTML = `
             <div class="shop-item-name">${item.name || '未知商品'}</div>
             <div class="shop-item-desc">${item.description || '没有描述'}</div>
             <div class="shop-item-price"><i class="fas fa-coins"></i> ${item.price !== undefined ? item.price : '?'}</div>
             <div class="shop-item-actions">
                 <input type="number" class="shop-item-quantity" id="${quantityInputId}" value="1" min="1">
                 <button class="shop-buy-button" data-item-id="${itemId}" data-quantity-input-id="${quantityInputId}">
                     <i class="fas fa-shopping-cart"></i> 购买
                 </button>
             </div>
         `;
         
         // Add event listener to the buy button
         const buyButton = itemElement.querySelector('.shop-buy-button');
         if (buyButton) {
             buyButton.addEventListener('click', () => {
                 // Pass the actual item object or its ID to buyItem
                 const foundItem = shopItems.find(i => (i.id || `shop-item-${shopItems.indexOf(i)}`) === buyButton.dataset.itemId);
                 if (foundItem) {
                    buyItem(foundItem, buyButton.dataset.quantityInputId);
                 } else {
                    console.error("Could not find item object for ID:", buyButton.dataset.itemId);
                    alert("购买失败：内部错误，找不到物品。");
                 }
             });
         } else {
              console.warn("[Map Plugin] Buy button not found for item:", item.name);
         }

         shopList.appendChild(itemElement);
     });
}

function buyItem(item, quantityInputId) { // Accept the item object directly
    const quantityInput = document.getElementById(quantityInputId);
    
    if (!item || !quantityInput) {
         console.error("[Map Plugin] Could not find item or quantity input for purchase.", {item, quantityInputId});
         alert("购买失败：找不到物品或数量输入框。");
         return;
    }

    const quantity = parseInt(quantityInput.value, 10);
    if (isNaN(quantity) || quantity <= 0) {
        alert("请输入有效的购买数量。");
        return;
    }

    const totalPrice = item.price * quantity;
    if (currentMoney < totalPrice) { // Assumes currentMoney is accessible
        alert("金币不足，无法购买！");
        return;
    }

    // Confirmation Dialog
     const confirmOverlay = document.getElementById('confirm-overlay');
     const confirmTitle = document.getElementById('confirm-title');
     const confirmMessage = document.getElementById('confirm-message');
     const executeBtn = document.getElementById('execute-action-btn');
     const cancelBtn = document.getElementById('cancel-action-btn');

     if (!confirmOverlay || !confirmTitle || !confirmMessage || !executeBtn || !cancelBtn) {
        console.error("Confirmation dialog elements not found for purchase.");
        alert("购买确认失败：缺少对话框元素。");
        return;
     }

     confirmTitle.textContent = '确认购买';
     confirmMessage.textContent = `确定要花费 ${totalPrice} 金币购买 ${quantity} 个 ${item.name} 吗？`;
     executeBtn.innerHTML = `<i class="fas fa-check"></i> 确认购买`;

     const buyHandler = () => {
         console.log(`[Map Plugin] User confirmed purchase: ${quantity}x ${item.name} for ${totalPrice}`);
         currentMoney -= totalPrice; // Update global money
         
         // Add item(s) to inventory (front-end simulation)
         for (let i = 0; i < quantity; i++) {
             // Create a new unique ID for the inventory item
             const newItemId = `inv-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`; 
             inventoryItems.push({ // Assumes inventoryItems is accessible
                 id: newItemId, 
                 name: item.name, 
                 description: item.description, 
                 category: item.category || 'misc', // Carry over category if exists
                 actions: item.actions || ['使用', '丢弃'] // Carry over actions or use default
             });
         }
         console.log("[Map Plugin] Inventory updated (front-end):", inventoryItems);

         // Update UI
         renderShopItems(); // Re-render shop to update money display
         // Potentially re-render inventory if it's open, or just update the data array

         // Send request to game
         const message = `<request:{{user}}花费${totalPrice}金币购买了${quantity}个${item.name}>`;
         sendGameActionRequest(message, "购买信息发送失败"); // Assumes sendGameActionRequest is available
         
         confirmOverlay.classList.add('hidden');
         cleanupConfirmListeners(); // Clean up listeners
     };

     const cancelBuyHandler = () => {
         confirmOverlay.classList.add('hidden');
         cleanupConfirmListeners();
     };

     const cleanupConfirmListeners = () => {
         newExecuteBtn.removeEventListener('click', buyHandler);
         newCancelBtn.removeEventListener('click', cancelBuyHandler);
         confirmOverlay.removeEventListener('click', overlayClickHandler);
     };
     const overlayClickHandler = (event) => {
         if (event.target === confirmOverlay) {
             cancelBuyHandler();
         }
     };

     // Re-attach listener
     const newExecuteBtn = executeBtn.cloneNode(true);
     executeBtn.parentNode.replaceChild(newExecuteBtn, executeBtn);
     newExecuteBtn.addEventListener('click', buyHandler, { once: true });

     const newCancelBtn = cancelBtn.cloneNode(true);
     cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
     newCancelBtn.addEventListener('click', cancelBuyHandler);

     confirmOverlay.addEventListener('click', overlayClickHandler);

     const confirmDialog = confirmOverlay.querySelector('.confirm-dialog');
     confirmOverlay.classList.remove('hidden');
     requestAnimationFrame(() => positionModalCenter(confirmDialog)); // Assumes positionModalCenter is available
}

// --- Inventory System Functions ---
function renderInventoryItems() {
    const inventoryList = document.getElementById('inventory-item-list');
     if (!inventoryList) {
         console.error("[Map Plugin] Inventory list element not found.");
         return;
     }

     inventoryList.innerHTML = ''; // Clear previous items

     if (!inventoryItems || inventoryItems.length === 0) { // Assumes inventoryItems is accessible
         inventoryList.innerHTML = '<p class="info-message">背包是空的。</p>';
         return;
     }

     inventoryItems.forEach(item => { // Assumes inventoryItems is accessible
         const itemElement = document.createElement('div');
         itemElement.className = 'inventory-item';
         itemElement.textContent = item.name || '未知物品';
         itemElement.dataset.itemId = item.id; // Use the unique ID
         // Add click listener directly here
         itemElement.addEventListener('click', () => {
             selectInventoryItem(item, itemElement);
         });
         inventoryList.appendChild(itemElement);
     });
     
     // Ensure details are hidden when re-rendering the list
     const detailsPanel = document.getElementById('inventory-item-details');
     if (detailsPanel) detailsPanel.classList.add('hidden');
     selectedInventoryItem = null; // Assumes selectedInventoryItem is accessible
}

function selectInventoryItem(item, itemElement) {
    if (!item) return;
    selectedInventoryItem = item; // Assumes selectedInventoryItem is accessible
    
    // Update selection highlight
    document.querySelectorAll('#inventory-item-list .inventory-item.selected').forEach(el => el.classList.remove('selected'));
    if (itemElement) itemElement.classList.add('selected');
    
    // Populate and show details panel
    const detailsPanel = document.getElementById('inventory-item-details');
    const nameEl = document.getElementById('item-detail-name');
    const descEl = document.getElementById('item-detail-desc');
    const actionsEl = document.getElementById('item-detail-actions');

    if (detailsPanel && nameEl && descEl && actionsEl) {
         nameEl.textContent = item.name || '未知物品';
         descEl.textContent = item.description || '没有描述。';
         actionsEl.innerHTML = ''; // Clear previous actions
         
         // Use actions defined in the item object, or default
         const itemActions = item.actions && Array.isArray(item.actions) && item.actions.length > 0 
                             ? item.actions 
                             : ['使用', '丢弃']; 
         
         itemActions.forEach(actionName => {
             const actionButton = document.createElement('button');
             actionButton.className = 'item-action-button';
             actionButton.textContent = actionName;
             actionButton.addEventListener('click', () => executeItemAction(actionName));
             actionsEl.appendChild(actionButton);
         });
         
         detailsPanel.classList.remove('hidden');
    } else {
         console.error("[Map Plugin] Inventory item detail elements not found.");
    }
}

function executeItemAction(action) {
    if (!selectedInventoryItem || !action) return; // Assumes selectedInventoryItem is accessible
    
    const item = selectedInventoryItem;
    const actionLower = action.toLowerCase();
    
    console.log(`[Map Plugin] Attempting action '${action}' on item:`, item);

    if (actionLower === '丢弃') {
         // Confirmation Dialog for dropping
         const confirmOverlay = document.getElementById('confirm-overlay');
         const confirmTitle = document.getElementById('confirm-title');
         const confirmMessage = document.getElementById('confirm-message');
         const executeBtn = document.getElementById('execute-action-btn');
         const cancelBtn = document.getElementById('cancel-action-btn');

         if (!confirmOverlay || !confirmTitle || !confirmMessage || !executeBtn || !cancelBtn) {
            console.error("Confirmation dialog elements not found for drop.");
            alert("丢弃确认失败：缺少对话框元素。");
            return;
         }

         confirmTitle.textContent = '确认丢弃';
         confirmMessage.textContent = `确定要丢弃 ${item.name} 吗？此操作无法撤销。`;
         executeBtn.innerHTML = `<i class="fas fa-trash-alt"></i> 确认丢弃`;

         const dropHandler = () => {
             console.log(`[Map Plugin] User confirmed drop: ${item.name}`);
             // Remove item from inventory (front-end simulation)
             const itemIndex = inventoryItems.findIndex(i => i.id === item.id); // Assumes inventoryItems is accessible
             if (itemIndex > -1) {
                 inventoryItems.splice(itemIndex, 1);
                 console.log("[Map Plugin] Item removed from inventory (front-end):");
             } else {
                  console.warn("[Map Plugin] Could not find item to remove from front-end inventory array.");
             }

             // Update UI
             renderInventoryItems(); // Re-render the list
             // Details panel will be hidden by renderInventoryItems

             // Send request to game
             const message = `<request:{{user}}丢弃了${item.name}>`;
             sendGameActionRequest(message, "丢弃信息发送失败"); // Assumes sendGameActionRequest is available
             
             confirmOverlay.classList.add('hidden');
             selectedInventoryItem = null; // Clear selection after action
             cleanupConfirmListeners(); // Clean up listeners
         };

         const cancelDropHandler = () => {
             confirmOverlay.classList.add('hidden');
             cleanupConfirmListeners();
         };

         const cleanupConfirmListeners = () => {
             newExecuteBtn.removeEventListener('click', dropHandler);
             newCancelBtn.removeEventListener('click', cancelDropHandler);
             confirmOverlay.removeEventListener('click', overlayClickHandler);
         };
         const overlayClickHandler = (event) => {
             if (event.target === confirmOverlay) {
                 cancelDropHandler();
             }
         };

         // Re-attach listener
         const newExecuteBtn = executeBtn.cloneNode(true);
         executeBtn.parentNode.replaceChild(newExecuteBtn, executeBtn);
         newExecuteBtn.addEventListener('click', dropHandler, { once: true });

         const newCancelBtn = cancelBtn.cloneNode(true);
         cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
         newCancelBtn.addEventListener('click', cancelDropHandler);

         confirmOverlay.addEventListener('click', overlayClickHandler);

         const confirmDialog = confirmOverlay.querySelector('.confirm-dialog');
         confirmOverlay.classList.remove('hidden');
         requestAnimationFrame(() => positionModalCenter(confirmDialog)); // Assumes positionModalCenter is available

    } else {
         // Handle other potential actions (like '使用', '装备', etc.)
         console.log(`[Map Plugin] Sending generic action request: ${action} on ${item.name}`);
         const message = `<request:{{user}}对${item.name}执行了操作：${action}>`;
         sendGameActionRequest(message, "操作信息发送失败"); // Assumes sendGameActionRequest is available
         
         // Deselect after any action for simplicity, game state might change
          document.querySelectorAll('#inventory-item-list .inventory-item.selected').forEach(el => el.classList.remove('selected'));
          document.getElementById('inventory-item-details').classList.add('hidden');
          selectedInventoryItem = null; // Assumes selectedInventoryItem is accessible
    }
}
