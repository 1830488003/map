// --- Helper Function for Centering Modals ---
function positionModalCenter(modalDialogElement) {
    if (!modalDialogElement) {
        console.error("Modal dialog element not provided for centering.");
        return;
    }

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const offset = 15; // Minimum space from viewport edges

    // 保存原始样式
    const saveOriginalStyles = (element) => {
        return {
            display: element.style.display,
            visibility: element.style.visibility,
            position: element.style.position,
            hasHiddenClass: element.classList.contains('hidden')
        };
    };

    // 恢复原始样式
    const restoreOriginalStyles = (element, styles) => {
        if (styles.hasHiddenClass) {
            element.classList.add('hidden');
        }
        element.style.visibility = styles.visibility;
        element.style.display = styles.display;
        element.style.position = styles.position;
    };

    // 查找父级覆盖层
    const overlay = modalDialogElement.closest('.modal-overlay, .settings-panel');
    let overlayStyles = null;
    
    // 临时使元素可见以便测量
    if (overlay) {
        const computedDisplay = getComputedStyle(overlay).display;
        if (overlay.classList.contains('hidden') || computedDisplay === 'none') {
            overlayStyles = saveOriginalStyles(overlay);
            overlay.style.visibility = 'hidden';
            overlay.style.display = 'block';
            if (overlayStyles.hasHiddenClass) {
                overlay.classList.remove('hidden');
            }
        }
    }

    // 保存对话框原始样式并设置临时样式以便测量
    const dialogStyles = saveOriginalStyles(modalDialogElement);
    modalDialogElement.style.visibility = 'hidden';
    modalDialogElement.style.display = 'block';
    modalDialogElement.style.position = 'absolute';

    // 获取尺寸
    const modalWidth = modalDialogElement.offsetWidth;
    const modalHeight = modalDialogElement.offsetHeight;

    // 恢复原始样式
    restoreOriginalStyles(modalDialogElement, dialogStyles);
    if (overlayStyles && overlay) {
        restoreOriginalStyles(overlay, overlayStyles);
    }

    // 如果无法获取有效尺寸，应用默认样式
    if (!modalWidth || !modalHeight || modalWidth <= 0 || modalHeight <= 0) {
        console.warn("无法获取有效的模态框尺寸进行居中。应用默认样式。");
        modalDialogElement.style.position = 'absolute';
        modalDialogElement.style.top = '10%';
        modalDialogElement.style.left = '10%';
        modalDialogElement.style.transform = 'none';
        return;
    }

    // 计算居中位置
    let top = (viewportHeight - modalHeight) / 2;
    let left = (viewportWidth - modalWidth) / 2;

    // 确保在视口内
    top = Math.max(offset, Math.min(top, viewportHeight - modalHeight - offset));
    left = Math.max(offset, Math.min(left, viewportWidth - modalWidth - offset));

    // 应用最终样式
    modalDialogElement.style.position = 'absolute';
    modalDialogElement.style.top = `${top}px`;
    modalDialogElement.style.left = `${left}px`;
    modalDialogElement.style.transform = 'none';
}


// --- Unified Icon Selection Function ---
function getIconClassForLocation(name) {
    if (!name) return 'fa-map-pin'; // 如果名称为空，返回默认图标
    
    // 使用对象映射替代大量if语句，提高性能和可维护性
    const iconMappings = {
        // 购物中心关键词
        '美食': 'fa-utensils',
        '餐饮': 'fa-utensils',
        '餐厅': 'fa-utensils',
        '食堂': 'fa-utensils',
        '小吃': 'fa-utensils',
        '超市': 'fa-shopping-cart',
        '百货': 'fa-shopping-cart',
        '服饰': 'fa-shirt',
        '服装': 'fa-shirt',
        '潮流': 'fa-shirt',
        '鞋': 'fa-shirt',
        '包': 'fa-shirt',
        '美妆': 'fa-gem',
        '化妆品': 'fa-gem',
        '护肤': 'fa-gem',
        '珠宝': 'fa-gem',
        '饰品': 'fa-gem',
        '名品': 'fa-gem',
        '奢侈': 'fa-gem',
        '数码': 'fa-laptop',
        '电器': 'fa-laptop',
        '手机': 'fa-laptop',
        '电脑': 'fa-laptop',
        '家居': 'fa-couch',
        '家具': 'fa-couch',
        '生活': 'fa-couch',
        '娱乐': 'fa-gamepad',
        '游戏': 'fa-gamepad',
        'ktv': 'fa-gamepad',
        '影院': 'fa-film',
        '剧院': 'fa-film',
        '电影': 'fa-film',
        '书店': 'fa-book-open',
        '图书': 'fa-book-open',
        '文具': 'fa-book-open',
        '儿童': 'fa-child-reaching',
        '玩具': 'fa-child-reaching',
        '母婴': 'fa-child-reaching',
        '运动': 'fa-futbol',
        '健身': 'fa-futbol',
        '体育': 'fa-futbol',
        '咖啡': 'fa-coffee',
        '饮品': 'fa-coffee',
        '茶': 'fa-coffee',
        '面包': 'fa-bread-slice',
        '烘焙': 'fa-bread-slice',
        '甜点': 'fa-bread-slice',
        '车库': 'fa-square-parking',
        '停车': 'fa-square-parking',
        '层': 'fa-building',
        '楼': 'fa-building',
        
        // 一般场景关键词
        '学校': 'fa-school',
        '校区': 'fa-school',
        '教学': 'fa-school',
        '学院': 'fa-school',
        '公园': 'fa-tree',
        '花园': 'fa-tree',
        '商业': 'fa-store',
        '市场': 'fa-store',
        '商店': 'fa-store',
        '街': 'fa-store',
        '贸易': 'fa-store',
        '店': 'fa-store',
        '住宅': 'fa-house-user',
        '家': 'fa-house-user',
        '公寓': 'fa-house-user',
        '站': 'fa-train-subway',
        '车站': 'fa-train-subway',
        '机场': 'fa-train-subway',
        '地铁': 'fa-train-subway',
        '行政': 'fa-building-columns',
        '办公': 'fa-building-columns',
        '银行': 'fa-building-columns',
        '医院': 'fa-hospital',
        '诊所': 'fa-hospital',
        '酒吧': 'fa-beer-mug-empty',
        '酒馆': 'fa-beer-mug-empty',
        '旅店': 'fa-beer-mug-empty',
        '警': 'fa-gavel',
        '监狱': 'fa-gavel',
        '禁闭': 'fa-gavel',
        '工业': 'fa-industry',
        '工厂': 'fa-industry',
        '港口': 'fa-anchor',
        '码头': 'fa-anchor',
        '海港': 'fa-anchor',
        '船': 'fa-anchor',
        '遗迹': 'fa-landmark-dome',
        '废墟': 'fa-landmark-dome',
        '森林': 'fa-tree',
        '丛林': 'fa-tree',
        '树林': 'fa-tree',
        '山脉': 'fa-mountain',
        '山峰': 'fa-mountain',
        '高地': 'fa-mountain',
        '洞穴': 'fa-dungeon',
        '矿洞': 'fa-dungeon',
        '地穴': 'fa-dungeon',
        '城堡': 'fa-chess-rook',
        '要塞': 'fa-chess-rook',
        '堡垒': 'fa-chess-rook',
        '神殿': 'fa-place-of-worship',
        '圣堂': 'fa-place-of-worship',
        '教堂': 'fa-place-of-worship',
        '塔楼': 'fa-gopuram',
        '高塔': 'fa-gopuram',
        '村庄': 'fa-house-chimney-user',
        '小镇': 'fa-house-chimney-user',
        '城市': 'fa-city',
        '主城': 'fa-city',
        '城区': 'fa-city',
        '沙漠': 'fa-sun',
        '荒地': 'fa-sun',
        '河流': 'fa-water',
        '湖泊': 'fa-water',
        '沼泽': 'fa-water',
        '平原': 'fa-leaf',
        '草原': 'fa-leaf',
        '营地': 'fa-campground',
        '据点': 'fa-campground',
        '战场': 'fa-shield-halved',
        '墓地': 'fa-cross',
        '陵墓': 'fa-cross',
        '广场': 'fa-landmark'
    };
    
    // 遍历名称中的每个关键词，查找匹配的图标
    for (const keyword in iconMappings) {
        if (name.includes(keyword)) {
            return iconMappings[keyword];
        }
    }
    
    return 'fa-map-pin'; // 默认图标
}

// Function to send game action requests (replace with actual TavernAI communication method)
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
        window.parent.postMessage({ type: 'gameAction', payload: message }, '*');
        console.log("Game action sent via window.parent.postMessage (requires host listener).");
        // alert(failureMessage + "\\n未找到合适的通信方式。"); // Optional: Alert user if no method works
    }
}
