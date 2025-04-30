function parseMapData(text) {
    if (!text || typeof text !== 'string') {
        console.error("地图数据为空或不是字符串。");
        return null;
    }
    
    // 初始化数据结构
    const data = {
        title: null,
        moveBlocked: false,
        locations: [],
        conversingPartners: [],
        externalAreas: [],
        currentUserPosition: { x: null, y: null },
        roads: [],
        bullets: []
    };
    
    let processedText = text.trim();
    
    // 提取头部标签处理函数
    const headerTags = {
        TITLE: (value) => { data.title = value; },
        CONVERSING: (value) => { data.conversingPartners = value.split(',').map(name => name.trim()).filter(Boolean); },
        EXTERNAL_AREAS: (value) => { data.externalAreas = value.split(',').map(name => name.trim()).filter(Boolean); },
        MOVEBLOCK: (value) => { data.moveBlocked = value.toUpperCase() === 'YES'; },
        CURRENT_POS: (value) => {
            const coords = value.match(/^(\d+)\|(\d+)$/);
            if (coords) {
                data.currentUserPosition.x = parseInt(coords[1], 10);
                data.currentUserPosition.y = parseInt(coords[2], 10);
            }
        }
    };

    // 处理头部标签
    let headerMatch;
    const headerRegex = /^\[(TITLE|CONVERSING|EXTERNAL_AREAS|MOVEBLOCK|CURRENT_POS):\s*(.*?)\]\s*\n?/i;
    while ((headerMatch = processedText.match(headerRegex)) !== null) {
        const tagName = headerMatch[1].toUpperCase();
        const tagValue = headerMatch[2].trim();
        if (headerTags[tagName]) {
            headerTags[tagName](tagValue);
        }
        processedText = processedText.substring(headerMatch[0].length).trimStart();
    }

    // 处理位置和道路数据
    try {
        const lines = processedText.split('\n').map(line => line.trim()).filter(Boolean);
        let currentMainLocation = null;
        
        // 定义正则表达式
        const mainLocationRegex = /^\[([^|\]]+)(?:\|(\d+)\|(\d+))?(?:\|(\d+)\|(\d+))?\]$/;
        const subLocationRegex = /^-\s*([^:]+?)\s*:(.*)/;
        const roadRegex = /^\[ROAD\|([^|]+)\|(\d+)(?:\|([^\]]+))?\]$/;
        const bulletsRegex = /^\[BULLETS:\s*(.*)\]$/i;
        const reservedKeywords = ['TITLE', 'CONVERSING', 'EXTERNAL_AREAS', 'MOVEBLOCK', 'ROAD', 'CURRENT_POS'];

        for (const line of lines) {
            const mainLocationMatch = line.match(mainLocationRegex);
            const subLocationMatch = line.match(subLocationRegex);
            const roadMatch = line.match(roadRegex);

            if (roadMatch) {
                // 处理道路数据
                if (currentMainLocation) {
                    data.locations.push(currentMainLocation);
                    currentMainLocation = null;
                }
                
                const pointsStr = roadMatch[1];
                const width = parseInt(roadMatch[2], 10);
                const color = roadMatch[3] || '#888888';
                
                // 解析坐标点
                const points = pointsStr.split(';')
                    .map(p => p.trim())
                    .filter(p => p.includes(','))
                    .map(p => {
                        const coords = p.split(',');
                        return { 
                            x: parseInt(coords[0], 10), 
                            y: parseInt(coords[1], 10) 
                        };
                    })
                    .filter(p => !isNaN(p.x) && !isNaN(p.y));

                if (points.length >= 2) {
                    data.roads.push({ 
                        points: points.map(p => `${p.x},${p.y}`).join(' '), 
                        width, 
                        color 
                    });
                }
            } else if (mainLocationMatch) {
                // 处理主要位置
                const potentialMainName = mainLocationMatch[1].trim();
                
                // 跳过与保留关键字冲突的位置名
                if (reservedKeywords.includes(potentialMainName.toUpperCase())) {
                    continue;
                }
                
                // 解析坐标
                const xCoord = mainLocationMatch[2] ? parseInt(mainLocationMatch[2], 10) : null;
                const yCoord = mainLocationMatch[3] ? parseInt(mainLocationMatch[3], 10) : null;
                const wCoord = mainLocationMatch[4] ? parseInt(mainLocationMatch[4], 10) : null;
                const hCoord = mainLocationMatch[5] ? parseInt(mainLocationMatch[5], 10) : null;

                // 保存之前的主位置
                if (currentMainLocation) {
                    data.locations.push(currentMainLocation);
                }
                currentMainLocation = {
                    name: potentialMainName,
                    x: xCoord, y: yCoord, width: wCoord, height: hCoord,
                    subLocations: []
                };

            } else if (subLocationMatch && currentMainLocation) {
                const subName = subLocationMatch[1].trim();
                const charactersText = subLocationMatch[2] ? subLocationMatch[2].trim() : '';
                const characters = [];
                try {
                    const characterRegex = /([^,{}\s][^,{}]*?)\s*(?:\{((?:[^{}]|\{[^{}]*\})*)\})?\s*(?:,|$)/g;
                    let charMatch;
                    characterRegex.lastIndex = 0;

                    while ((charMatch = characterRegex.exec(charactersText)) !== null) {
                        let parsedName = charMatch[1] ? charMatch[1].trim() : null;
                        let parsedDescription = charMatch[2] ? charMatch[2].trim() : null;

                        if (parsedName && parsedName.length > 0 && parsedName.toLowerCase() !== '无') {
                            parsedName = parsedName.replace(/[\])}]+$/, '').trim();
                            if (parsedName) {
                                characters.push({ name: parsedName, description: parsedDescription });
                            }
                        }
                        if (charMatch[0].length === 0) { characterRegex.lastIndex++; }
                        if (characterRegex.lastIndex === charMatch.index) { break; }
                    }
                } catch (charError) {
                     console.error(`      Error parsing characters for sublocation "${subName}":`, charError);
                }
                currentMainLocation.subLocations.push({ name: subName, characters: characters });
            } else {
                 // Check for BULLETS line AFTER checking for locations/roads
                 const bulletsMatch = line.match(/^\[BULLETS:\s*(.*)\]$/i);
                 if (bulletsMatch) {
                     const bulletsContent = bulletsMatch[1].trim();
                     data.bullets = bulletsContent.split(';;').map(b => b.trim()).filter(b => b);
                 }
            }
        }

        if (currentMainLocation) {
            data.locations.push(currentMainLocation);
        }

        return data;
    } catch (error) {
        console.error("地图数据解析过程中出错:", error);
        return null;
    }
}

function renderMapInterface(mapData) {
    const titleElement = document.getElementById('map-title');
    titleElement.textContent = (mapData && mapData.title) ? mapData.title : '通用地图导航';

    if (!mapData || !mapData.locations) {
         document.getElementById('main-locations').innerHTML = '<p class="error-message">地图数据加载失败</p>';
         document.getElementById('sub-locations').classList.add('hidden');
         document.getElementById('location-details').classList.add('hidden');
         document.getElementById('movement-alert').classList.add('hidden');
         return;
    }
    hasMoveBlock = mapData.moveBlocked; // Assuming hasMoveBlock is a global variable defined elsewhere
    document.getElementById('movement-alert').classList.toggle('hidden', !hasMoveBlock); // Show/hide based on data

    const svgMap = document.getElementById('visual-map');
    const tooltip = document.getElementById('map-tooltip');
    const svgNS = "http://www.w3.org/2000/svg";
    svgMap.innerHTML = ''; // Clear previous SVG content

    // Render Roads FIRST
    if (mapData.roads && mapData.roads.length > 0) {
        mapData.roads.forEach(road => {
            const polyline = document.createElementNS(svgNS, 'polyline');
            polyline.setAttribute('points', road.points);
            polyline.setAttribute('stroke', road.color);
            polyline.setAttribute('stroke-width', road.width);
            polyline.setAttribute('fill', 'none');
            polyline.setAttribute('stroke-linecap', 'round');
            polyline.setAttribute('stroke-linejoin', 'round');
            polyline.classList.add('map-road');
            svgMap.appendChild(polyline);
        });
    }

    // Render Locations on SVG
    const defaultWidth = 100;
    const defaultHeight = 60;

    mapData.locations.forEach(location => {
        if (location && typeof location.name === 'string' && location.x !== null && location.y !== null) {
            const locWidth = location.width || defaultWidth;
            const locHeight = location.height || defaultHeight;
            const labelOffsetDy = locHeight / 2 + 5; // Adjusted for better vertical centering

            const group = document.createElementNS(svgNS, 'g');
            group.setAttribute('transform', `translate(${location.x}, ${location.y})`);
            group.classList.add('map-location-group');
            group.dataset.location = location.name;
            group.style.pointerEvents = 'all'; // Ensure group is clickable

            const rect = document.createElementNS(svgNS, 'rect');
            rect.style.pointerEvents = 'all'; // Ensure rect is clickable
            rect.setAttribute('width', locWidth);
            rect.setAttribute('height', locHeight);
            rect.setAttribute('rx', 5); // Rounded corners
            rect.setAttribute('ry', 5);
            rect.classList.add('map-location-rect');
            // Add click listener to the group, not the rect directly
            group.addEventListener('click', () => selectMainLocation(location)); // Assuming selectMainLocation is defined elsewhere
            group.appendChild(rect);

            const text = document.createElementNS(svgNS, 'text');
            text.setAttribute('x', locWidth / 2);
            text.setAttribute('y', locHeight / 2); // Center text vertically within rect
            text.setAttribute('dy', '0.35em'); // Fine-tune vertical alignment
            text.classList.add('map-location-label');
            text.textContent = location.name;
            group.appendChild(text);

            // Tooltip handling
            if (tooltip) {
                group.addEventListener('mouseenter', (e) => {
                    tooltip.textContent = location.name;
                    // Position tooltip relative to mouse pointer
                    tooltip.style.left = `${e.clientX + 10}px`;
                    tooltip.style.top = `${e.clientY + 10}px`;
                    tooltip.classList.add('visible');
                });
                group.addEventListener('mousemove', (e) => {
                    // Update position as mouse moves
                    tooltip.style.left = `${e.clientX + 10}px`;
                    tooltip.style.top = `${e.clientY + 10}px`;
                });
                group.addEventListener('mouseleave', () => {
                    tooltip.classList.remove('visible');
                });
            }
            svgMap.appendChild(group);
        } else if (location && typeof location.name === 'string') {
            // Log locations without coordinates instead of rendering them
            console.warn(`Location "${location.name}" is missing coordinates and won't be rendered visually.`);
        }
    });

    resetSelection(false); // Assuming resetSelection is defined elsewhere

    // Handle External Areas Button
    const switchAreaBtn = document.getElementById('switch-area-button');
    const hasExternalAreas = mapData.externalAreas && mapData.externalAreas.length > 0;
    switchAreaBtn.classList.toggle('hidden', !hasExternalAreas);
    if (hasExternalAreas) {
        // Re-attach listener to prevent multiple bindings if this runs again
        const newSwitchAreaBtn = switchAreaBtn.cloneNode(true);
        switchAreaBtn.parentNode.replaceChild(newSwitchAreaBtn, switchAreaBtn);
        newSwitchAreaBtn.addEventListener('click', () => showExternalAreas(mapData.externalAreas)); // Assuming showExternalAreas is defined
    }

    // Render Current User Position (Red Dot)
    if (mapData.currentUserPosition && typeof mapData.currentUserPosition.x === 'number' && typeof mapData.currentUserPosition.y === 'number') {
        const userDot = document.createElementNS(svgNS, 'circle');
        userDot.setAttribute('cx', mapData.currentUserPosition.x);
        userDot.setAttribute('cy', mapData.currentUserPosition.y);
        userDot.setAttribute('r', 6); // Dot size
        userDot.setAttribute('fill', 'red');
        userDot.setAttribute('stroke', 'white');
        userDot.setAttribute('stroke-width', 1.5);
        userDot.classList.add('current-user-position');
        userDot.style.pointerEvents = 'none'; // Dot shouldn't block clicks
        svgMap.appendChild(userDot);
         console.log(`Rendered user position dot at (${mapData.currentUserPosition.x}, ${mapData.currentUserPosition.y})`);
    } else {
         console.log("User position coordinates not available or invalid, skipping dot rendering.");
    }
}
