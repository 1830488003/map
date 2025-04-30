// Assumes selectedMain, selectedSub, selectedCharacterName are global or accessible
// Assumes sendGameActionRequest, positionModalCenter, resetSelection are defined globally or imported

function updateActionButtonState() {
    const actionBtn = document.getElementById('action-btn');
    if (!actionBtn) return; // Exit if button doesn't exist

    if (selectedSub) {
         actionBtn.innerHTML = `<i class="fas fa-walking"></i> 前往此处`;
         actionBtn.disabled = false;
         actionBtn.classList.remove('hidden'); // Ensure visible
         // Remove previous listener before adding new one
         const newActionBtn = actionBtn.cloneNode(true);
         actionBtn.parentNode.replaceChild(newActionBtn, actionBtn);
         newActionBtn.addEventListener('click', confirmAction);
    } else {
         actionBtn.innerHTML = `<i class="fas fa-map-signs"></i> 选择地点`;
         actionBtn.disabled = true;
         actionBtn.classList.remove('hidden'); // Ensure visible
         // Remove listener if disabled
         const newActionBtn = actionBtn.cloneNode(true);
         actionBtn.parentNode.replaceChild(newActionBtn, actionBtn);
         // No listener added when disabled
    }
}

function confirmAction() {
    // Don't allow 'go to' if a character is selected within the sub-location details
    if (!selectedSub || selectedCharacterName) {
        console.log("ConfirmAction prevented: No sub-location selected or character interaction pending.");
        return;
    }

    const locationName = `${selectedMain.name} - ${selectedSub.name}`;
    const confirmOverlay = document.getElementById('confirm-overlay');
    const confirmTitle = document.getElementById('confirm-title');
    const confirmMessage = document.getElementById('confirm-message');
    const executeBtn = document.getElementById('execute-action-btn');
    const cancelBtn = document.getElementById('cancel-action-btn'); // Get cancel button too

    if (!confirmOverlay || !confirmTitle || !confirmMessage || !executeBtn || !cancelBtn) {
        console.error("Confirmation dialog elements not found.");
        return;
    }

    confirmTitle.textContent = '确认前往';
    const characters = selectedSub.characters || [];
    const characterNames = characters.map(c => c.name).filter(name => name);
    confirmMessage.textContent = characterNames.length > 0
        ? `前往 ${locationName}？你可能会遇见：${characterNames.join(', ')}`
        : `前往 ${locationName}？那里好像没有人。`;
    executeBtn.innerHTML = `<i class="fas fa-check"></i> 出发吧`;

    // Define handlers
    const executeGoHandler = () => {
        executeAction();
        cleanupConfirmListeners(); // Clean up after execution
    };
    const cancelGoHandler = () => {
        confirmOverlay.classList.add('hidden');
        cleanupConfirmListeners(); // Clean up on cancel
    };
    const cleanupConfirmListeners = () => {
        newExecuteBtn.removeEventListener('click', executeGoHandler);
        newCancelBtn.removeEventListener('click', cancelGoHandler);
        confirmOverlay.removeEventListener('click', overlayClickHandler);
    };
    const overlayClickHandler = (event) => {
        if (event.target === confirmOverlay) {
            cancelGoHandler();
        }
    };


    // Clone buttons to remove previous listeners and attach new ones
    const newExecuteBtn = executeBtn.cloneNode(true);
    executeBtn.parentNode.replaceChild(newExecuteBtn, executeBtn);
    newExecuteBtn.addEventListener('click', executeGoHandler, { once: true }); // Use once for execute

    const newCancelBtn = cancelBtn.cloneNode(true);
    cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
    newCancelBtn.addEventListener('click', cancelGoHandler);

    // Add overlay click listener
    confirmOverlay.addEventListener('click', overlayClickHandler);


    const confirmDialog = confirmOverlay.querySelector('.confirm-dialog');
    confirmOverlay.classList.remove('hidden');
    requestAnimationFrame(() => positionModalCenter(confirmDialog)); // Assumes positionModalCenter is available
}

function executeAction() {
    if (!selectedSub) { // No need to check selectedCharacterName here, confirmAction prevents it
         document.getElementById('confirm-overlay').classList.add('hidden');
         console.log("ExecuteAction prevented: No sub-location selected.");
         return;
    }

    const locationName = `${selectedMain.name} - ${selectedSub.name}`;
    const cleanLocationName = locationName.replace(/[<>]/g, ''); // Basic sanitization
    const characterNames = Array.isArray(selectedSub.characters) ? selectedSub.characters.map(c=>c.name).filter(n=>n) : [];
    const cleanCharacters = characterNames.join(',').replace(/[<>]/g, ''); // Basic sanitization

    let message = `<request:{{user}}前往了${cleanLocationName}.`;
    if (cleanCharacters) message += `${cleanCharacters}在那里`;
    message += ">";

    sendGameActionRequest(message, "前往失败"); // Assumes sendGameActionRequest is available
    document.getElementById('confirm-overlay').classList.add('hidden');
    resetSelection(true); // Reset selection after moving, assumes resetSelection is available
}


function confirmInteraction(optionText) {
     if (!selectedCharacterName || !selectedSub || !selectedMain) {
         console.log("ConfirmInteraction prevented: Missing character, sub-location, or main location selection.");
         return;
     }

     const locationName = `${selectedMain.name} - ${selectedSub.name}`;
     const confirmOverlay = document.getElementById('confirm-overlay');
     const confirmTitle = document.getElementById('confirm-title');
     const confirmMessage = document.getElementById('confirm-message');
     const executeBtn = document.getElementById('execute-action-btn');
     const cancelBtn = document.getElementById('cancel-action-btn');

     if (!confirmOverlay || !confirmTitle || !confirmMessage || !executeBtn || !cancelBtn) {
        console.error("Confirmation dialog elements not found.");
        return;
     }

     confirmTitle.textContent = '确认互动';
     confirmMessage.textContent = `要对 ${selectedCharacterName} 执行互动："${optionText}" 吗？ (地点：${locationName})`;
     executeBtn.innerHTML = `<i class="fas fa-check"></i> 确认互动`;

     // Define handlers
     const interactionHandler = () => {
         executeInteraction(optionText);
         cleanupConfirmListeners();
     };
     const cancelInteractionHandler = () => {
         confirmOverlay.classList.add('hidden');
         cleanupConfirmListeners();
     };
     const cleanupConfirmListeners = () => {
         newExecuteBtn.removeEventListener('click', interactionHandler);
         newCancelBtn.removeEventListener('click', cancelInteractionHandler);
         confirmOverlay.removeEventListener('click', overlayClickHandler);
     };
     const overlayClickHandler = (event) => {
         if (event.target === confirmOverlay) {
             cancelInteractionHandler();
         }
     };

     // Clone and re-attach listeners
     const newExecuteBtn = executeBtn.cloneNode(true);
     executeBtn.parentNode.replaceChild(newExecuteBtn, executeBtn);
     newExecuteBtn.addEventListener('click', interactionHandler, { once: true });

     const newCancelBtn = cancelBtn.cloneNode(true);
     cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
     newCancelBtn.addEventListener('click', cancelInteractionHandler);

     confirmOverlay.addEventListener('click', overlayClickHandler);

     const confirmDialog = confirmOverlay.querySelector('.confirm-dialog');
     confirmOverlay.classList.remove('hidden');
     requestAnimationFrame(() => positionModalCenter(confirmDialog)); // Assumes positionModalCenter is available
}

function executeInteraction(optionText) {
     if (!selectedCharacterName || !selectedSub || !selectedMain) {
         document.getElementById('confirm-overlay').classList.add('hidden');
         console.log("ExecuteInteraction prevented: Missing character, sub-location, or main location selection.");
         return;
     }

     const locationName = `${selectedMain.name} - ${selectedSub.name}`;
     const cleanLocationName = locationName.replace(/[<>]/g, '');
     const cleanCharacterName = selectedCharacterName.replace(/[<>]/g, '');
     const cleanOptionText = optionText.replace(/[<>]/g, '');
     const message = `<request:{{user}}对${cleanCharacterName}执行了互动："${cleanOptionText}". 在${cleanLocationName}>`;

     sendGameActionRequest(message, "互动失败"); // Assumes sendGameActionRequest is available
     document.getElementById('confirm-overlay').classList.add('hidden');
     // Optionally reset selection or close character modal after interaction
     // resetSelection(false); // Example: Reset sub-selection but keep main location
     closeCharacterModal(); // Close the character modal after interaction
}

// --- Game Action Buttons (Lower Section) ---
function setupGameActionListeners() {
    console.log("[Map Plugin] Setting up game action listeners...");
    const gameActionButtons = document.querySelectorAll('.game-action-button');
    if (!gameActionButtons || gameActionButtons.length === 0) {
        console.warn("[Map Plugin] No game action buttons found to attach listeners.");
        return;
    }

    gameActionButtons.forEach(button => {
        // Remove existing listener to prevent duplicates if this runs multiple times
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);

        newButton.addEventListener('click', () => {
            const actionId = newButton.id; // e.g., action-initiate-talk
            if (!actionId) {
                console.error("[Map Plugin] Game action button clicked, but has no ID:", newButton);
                return;
            }
            
            // Simple conversion from ID to action text (can be made more sophisticated)
            // Extracts text after "action-" and converts to a basic phrase
            let actionText = actionId.startsWith('action-') ? actionId.substring(7) : actionId;
            // Basic mapping for clearer messages (extend as needed)
            const actionMap = {
                'wait-moment': '等待片刻',
                'wait-hour': '等待1小时',
                'skip-timeblock': '跳到下个时段',
                'skip-day': '快进到明天',
                'skip-weekend': '快进到周末',
                'skip-date': '快进到指定日期', // Placeholder, needs more context usually
                'skip-plot': '跳过剧情',
                'end-activity': '结束当前活动',
                'initiate-talk': '发起对话',
                'ask-info': '询问信息',
                'observe-char': '观察对方',
                'give-gift': '赠送礼物',
                'make-request': '提出请求',
                'invite-join': '邀请同行',
                'ask-date': '邀请约会',
                'date-interact': '进行约会互动',
                'flirt': '调情',
                'hold-hands': '牵手',
                'hug': '拥抱',
                'kiss': '亲吻',
                'comfort': '安慰对方',
                'apologize': '道歉',
                'thank': '感谢',
                'goodbye': '告别',
                'call': '打电话',
                'send-message': '发送消息',
                'check-relation': '查看关系',
                'check-inventory': '查看背包', // Or link to openInventoryModal?
                'use-item': '使用物品',
                'equip-item': '装备物品',
                'buy-item': '购买物品', // Or link to openShopModal?
                'sell-item': '出售物品',
                'examine-env': '检查环境',
                'interact-object': '与物品互动',
                'check-status': '查看状态',
                'work': '工作',
                'study': '学习',
                'relax': '休息放松',
                'check-map': '查看地图',
                'check-quests': '查看任务',
                'save-game': '保存游戏'
            };
            const friendlyActionText = actionMap[actionText] || actionText.replace(/[-_]/g, ' '); // Default fallback
            
            // Special handling for shop/inventory if needed, though they have dedicated buttons now
            if (actionId === 'action-check-inventory') {
                openInventoryModal(); // Assumes openInventoryModal is available
                console.log("[Map Plugin] Game action button 'check-inventory' clicked, opening inventory modal.");
                return; // Don't send request if opening modal
            }
            if (actionId === 'action-buy-item') {
                openShopModal(); // Assumes openShopModal is available
                console.log("[Map Plugin] Game action button 'buy-item' clicked, opening shop modal.");
                return; // Don't send request if opening modal
            }
            
            const message = `<request:{{user}}尝试${friendlyActionText}>`;
            console.log(`[Map Plugin] Game action button '${actionId}' clicked. Sending request: ${message}`);
            sendGameActionRequest(message, `${friendlyActionText}失败`); // Assumes sendGameActionRequest is available
        });
    });
    console.log(`[Map Plugin] Attached listeners to ${gameActionButtons.length} game action buttons.`);
}

// --- Custom Interaction Input (Character Modal) ---
function sendCustomInteraction() {
    const inputElement = document.getElementById('custom-interaction-input');
    const customText = inputElement.value.trim();
    if (!customText || !selectedCharacterName || !selectedSub || !selectedMain) return;

    const locationName = `${selectedMain.name} - ${selectedSub.name}`;
    const cleanLocationName = locationName.replace(/[<>]/g, '');
    const cleanCharacterName = selectedCharacterName.replace(/[<>]/g, '');
    const cleanCustomText = customText.replace(/[<>]/g, '');
    const message = `<request:{{user}}对${cleanCharacterName}说："${cleanCustomText}". 在${cleanLocationName}>`;

    sendGameActionRequest(message, "发送失败"); // Assumes sendGameActionRequest is available
    inputElement.value = ''; // Clear input
    closeCharacterModal(); // Assumes closeCharacterModal is available
}
