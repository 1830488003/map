// Assumes sendGameActionRequest, loadSettings, saveSettings are defined globally or imported

// --- Bullet Chat Logic ---
function handleBulletClick(type, content) {
    // Placeholder for actual interaction logic (e.g., opening a modal provided by host environment)
    console.log(`Clicked bullet - Type: ${type}, Content: ${content}`);
    const cleanType = type.replace(/[<>]/g, '');
    const cleanContent = content.replace(/[<>]/g, '');
    // Simulate opening dialog with an alert
    alert(`模拟打开对话框\n类型: ${cleanType}\n内容: ${cleanContent}\n\n(在此处应调用实际的对话功能)`);
    // Example: If a function `openSillyTavernDialog` existed:
    // openSillyTavernDialog({ type: cleanType, content: cleanContent });
}

function displayBulletComment(text, container) {
    if (!container) return;
    const commentElement = document.createElement('div');
    commentElement.className = 'bullet-comment';

    // Match clickable bullets like [弹幕:吐槽] or [弹幕:建议]
    const bulletMatch = text.match(/^\[弹幕:(吐槽|建议)\](.*)/);

    if (bulletMatch) {
        const type = bulletMatch[1];
        const content = bulletMatch[2].trim();
        commentElement.textContent = `[${type}] ${content}`; // Display with type prefix
        commentElement.classList.add('clickable-bullet'); // Mark as clickable
        commentElement.dataset.bulletType = type;
        commentElement.dataset.bulletContent = content;
        commentElement.title = "点击与弹幕互动"; // Tooltip
        commentElement.addEventListener('click', () => {
            handleBulletClick(type, content);
        });
    } else {
        // Handle non-clickable bullets or regular text
        commentElement.textContent = text;
    }

    container.appendChild(commentElement);
    container.scrollTop = container.scrollHeight; // Scroll to bottom

    // Optional: Add fade-in animation
    requestAnimationFrame(() => {
        commentElement.style.opacity = '1'; // Assuming CSS handles transition
    });

    // Removed auto-removal timeout for persistence
}


// Function to display bullets parsed from map data
function displayParsedBullets(bulletArray) {
    const bulletContainer = document.getElementById('bullet-chat-content');
    if (!bulletContainer || !Array.isArray(bulletArray)) return;

    // Optional: Clear previous bullets if desired when loading new data
    // bulletContainer.innerHTML = '';

    bulletArray.forEach((bullet, index) => {
        // Display bullets with a slight delay between each for visual effect
        setTimeout(() => {
            displayBulletComment(bullet, bulletContainer);
        }, index * 500); // Stagger display slightly (adjust timing as needed)
    });
}

function generateAndDisplayPlaceholderBullets() {
    const bulletContainer = document.getElementById('bullet-chat-content');
    if (!bulletContainer) return;

    const placeholderBullets = [
        "这里看起来有点意思...",
        "[弹幕:吐槽] 这也太巧合了吧？我不信！", // Clickable example
        "接下来会发生什么呢？",
        "感觉会有大事发生！",
        "[弹幕:建议] 要不去左边看看？感觉那边有东西。", // Clickable example
        "这个选择看起来很关键。",
        "哇，这个地方好漂亮！",
        "[弹幕:吐槽] 主角光环又来了...", // Clickable example
        "有点紧张...",
        "希望一切顺利。",
        "[弹幕:建议] 和这个人搞好关系可能有用。", // Clickable example
        "是时候展现真正的技术了！"
    ];

    // Optional: Clear existing placeholders if needed
    // bulletContainer.innerHTML = '';

    // Display bullets with a slight delay between each
    placeholderBullets.forEach((bullet, index) => {
        setTimeout(() => {
            displayBulletComment(bullet, bulletContainer);
        }, index * 700); // Stagger the display
    });
}

function sendBulletReply() {
    const inputElement = document.getElementById('bullet-reply-input');
    const replyText = inputElement.value.trim();
    if (!replyText) return;

    const cleanReplyText = replyText.replace(/[<>]/g, ''); // Basic sanitization
    const message = `<request:{{user}}发送弹幕：${cleanReplyText}>`;

    sendGameActionRequest(message, "弹幕发送失败"); // Assumes sendGameActionRequest is available

    // Display the sent bullet locally immediately
    const bulletContainer = document.getElementById('bullet-chat-content');
    if (bulletContainer) {
        const selfComment = document.createElement('div');
        selfComment.className = 'bullet-comment self'; // Add 'self' class
        selfComment.textContent = cleanReplyText;
        bulletContainer.appendChild(selfComment);
        bulletContainer.scrollTop = bulletContainer.scrollHeight; // Scroll to bottom
    }

    inputElement.value = ''; // Clear input
}

// --- Draggable Element Logic ---
function makeDraggable(element, handle) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    let isDragging = false;
    let parentRect = null; // Cache parent bounds on drag start

    const dragMouseDown = (e) => {
        e = e || window.event;
        // Allow dragging only with left mouse button or touch
        if (e.type === 'mousedown' && e.button !== 0) return;
        // Prevent drag if clicking on input/button inside the handle
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON' || e.target.closest('button')) {
            return;
        }
        e.preventDefault(); // Prevent text selection during drag

        pos3 = e.clientX || e.touches[0].clientX;
        pos4 = e.clientY || e.touches[0].clientY;
        isDragging = true;
        element.classList.add('dragging'); // Add class for visual feedback
        parentRect = element.parentElement.getBoundingClientRect(); // Get bounds of container

        document.addEventListener('mouseup', closeDragElement);
        document.addEventListener('touchend', closeDragElement);
        document.addEventListener('mousemove', elementDrag);
        document.addEventListener('touchmove', elementDrag, { passive: false }); // Need passive: false to prevent scroll
    };

    const elementDrag = (e) => {
        if (!isDragging) return;
        e = e || window.event;
        e.preventDefault(); // Prevent scrolling on touch devices

        const currentX = e.clientX || e.touches[0].clientX;
        const currentY = e.clientY || e.touches[0].clientY;

        pos1 = pos3 - currentX;
        pos2 = pos4 - currentY;
        pos3 = currentX;
        pos4 = currentY;

        // Calculate new position, constrained within parent bounds
        const elementRect = element.getBoundingClientRect();

        // Calculate proposed new top/left relative to the parent's origin
        let newTop = element.offsetTop - pos2;
        let newLeft = element.offsetLeft - pos1;

        // Constrain within parent boundaries
        newTop = Math.max(0, newTop); // Don't go above parent top
        newTop = Math.min(parentRect.height - elementRect.height, newTop); // Don't go below parent bottom

        newLeft = Math.max(0, newLeft); // Don't go left of parent left
        newLeft = Math.min(parentRect.width - elementRect.width, newLeft); // Don't go right of parent right

        element.style.top = newTop + "px";
        element.style.left = newLeft + "px";
    };

    const closeDragElement = () => {
        if (!isDragging) return;
        isDragging = false;
        element.classList.remove('dragging'); // Remove dragging class
        parentRect = null; // Clear cached bounds
        document.removeEventListener('mouseup', closeDragElement);
        document.removeEventListener('touchend', closeDragElement);
        document.removeEventListener('mousemove', elementDrag);
        document.removeEventListener('touchmove', elementDrag);
    };

    // Attach listeners to the handle element
    if (handle) {
        handle.addEventListener('mousedown', dragMouseDown);
        handle.addEventListener('touchstart', dragMouseDown, { passive: false }); // Need passive: false for touchstart on handle
    } else {
        console.warn("Draggable handle not provided for element:", element);
    }
}
// --- End Draggable Element Logic ---

// --- Bullet Chat Feature Setup ---
function setupBulletChatFeatures() {
    // 获取所有相关元素
    const bulletSendBtn = document.getElementById('bullet-send-btn');
    const bulletReplyInput = document.getElementById('bullet-reply-input');
    const bulletChatToggleBtn = document.getElementById('bullet-chat-toggle-btn'); // Header button
    const bulletCloseBtn = document.getElementById('bullet-close-btn'); // Close button inside chat
    const bulletChatContainer = document.getElementById('bullet-chat-container');
    const bulletChatHandle = document.getElementById('bullet-chat-header'); // Draggable handle

    // 发送弹幕事件
    if (bulletSendBtn && bulletReplyInput) {
        bulletSendBtn.addEventListener('click', sendBulletReply);
        bulletReplyInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                sendBulletReply();
            }
        });
    } else {
        console.error("弹幕发送元素未找到!");
    }
    
    // 弹幕显示开关事件 (Header Button)
    if (bulletChatToggleBtn && bulletChatContainer) {
        bulletChatToggleBtn.addEventListener('click', () => {
            const isHidden = bulletChatContainer.classList.toggle('hidden');
            bulletChatToggleBtn.classList.toggle('active', !isHidden); // Optional: Add active state to toggle button
            
            // Update settings
            try {
                const settings = loadSettings(); // Assumes loadSettings is available
                settings.showBulletChat = !isHidden;
                saveSettings(settings); // Assumes saveSettings is available
            } catch (e) {
                console.error("保存弹幕可见性设置失败:", e);
            }
        });
        // Sync initial state from settings
        try {
            const settings = loadSettings();
            bulletChatContainer.classList.toggle('hidden', !settings.showBulletChat);
            bulletChatToggleBtn.classList.toggle('active', settings.showBulletChat);
        } catch(e) {
            console.error("应用初始弹幕可见性设置失败:", e);
        }

    } else {
        console.error("弹幕开关按钮或容器未找到!");
    }
    
    // 弹幕关闭按钮事件 (Inside Chat Window)
    if (bulletCloseBtn && bulletChatContainer && bulletChatToggleBtn) {
        bulletCloseBtn.addEventListener('click', () => {
            bulletChatContainer.classList.add('hidden');
            bulletChatToggleBtn.classList.remove('active'); // Deactivate header toggle button
            
            // Update settings
            try {
                const settings = loadSettings();
                settings.showBulletChat = false;
                saveSettings(settings);
            } catch (e) {
                console.error("保存弹幕可见性设置失败 (关闭按钮):", e);
            }
        });
    } else {
        console.error("弹幕关闭按钮或相关元素未找到!");
    }

    // Initialize draggable bullet chat
    if (bulletChatContainer && bulletChatHandle) {
        makeDraggable(bulletChatContainer, bulletChatHandle);
    } else {
        console.error("无法初始化弹幕窗口拖动功能，容器或句柄未找到。");
    }
}
