// Global variables assumed to be defined in map_init.js or similar
// let selectedMain = null;
// let selectedSub = null;
// let selectedCharacterName = null;

function selectMainLocation(location) {
    console.log("selectMainLocation called with location:", location ? location.name : 'undefined/null');
    if (!location || !location.subLocations) {
        console.log("selectMainLocation returning early: location or subLocations missing.");
        return;
    }
    console.log("selectMainLocation proceeding for:", location.name);

    selectedMain = location;
    selectedSub = null;
    selectedCharacterName = null;
    updateActionButtonState(); // Assumes updateActionButtonState is defined globally or imported

    document.getElementById('location-details').classList.add('hidden');
    document.getElementById('sub-locations').classList.add('hidden');
    document.getElementById('switch-area-button').classList.remove('selected');

    // Update selection state for SVG elements
    document.querySelectorAll('#visual-map .map-location-group').forEach(group => {
        group.classList.toggle('selected', group.dataset.location === location.name);
    });

    const subLocationsContainer = document.getElementById('sub-locations');
    subLocationsContainer.innerHTML = '';

    if (location.subLocations.length === 0) {
         subLocationsContainer.innerHTML = '<p class="info-message">此区域下没有具体的探索地点。</p>';
         subLocationsContainer.classList.remove('hidden');
         return;
    }

    location.subLocations.forEach(subLocation => {
        if (!subLocation || typeof subLocation.name !== 'string') return;
        const button = document.createElement('button');
        button.className = 'sub-location-button';
        const iconClass = getIconClassForLocation(subLocation.name); // Assumes getIconClassForLocation is defined globally or imported
        button.innerHTML = `<i class="fas ${iconClass}"></i> ${subLocation.name}`;
        button.dataset.sublocation = subLocation.name;
        button.addEventListener('click', () => selectSubLocation(subLocation));
        subLocationsContainer.appendChild(button);
    });

    subLocationsContainer.classList.remove('hidden');
}

function selectSubLocation(subLocation) {
    if (!subLocation || !subLocation.characters || !selectedMain) return;

    selectedSub = subLocation;
    selectedCharacterName = null;
    updateActionButtonState(); // Assumes updateActionButtonState is defined globally or imported

    document.querySelectorAll('#sub-locations .sub-location-button').forEach(btn => {
        btn.classList.toggle('selected', btn.dataset.sublocation === subLocation.name);
    });

    document.getElementById('selected-location').textContent = `${selectedMain.name} - ${subLocation.name}`;
    const charactersContainer = document.getElementById('location-characters');
    charactersContainer.innerHTML = '';

    if (subLocation.characters.length > 0) {
        subLocation.characters.forEach(characterObj => {
            if (!characterObj || !characterObj.name) return;
            const charButton = document.createElement('button');
            charButton.className = 'character-item';
            charButton.dataset.characterName = characterObj.name;
            if (characterObj.description) {
                charButton.dataset.characterDescription = characterObj.description;
            }
            charButton.innerHTML = `<i class="fas fa-user"></i> ${characterObj.name}`;
            // Assuming selectCharacter is defined globally or imported
            charButton.addEventListener('click', (event) => selectCharacter(characterObj.name, characterObj.description, event.currentTarget));
            charactersContainer.appendChild(charButton);
        });
    } else {
        charactersContainer.innerHTML = '<div class="character-item empty"><i class="fas fa-user-slash"></i> 这里没有人</div>';
    }
    document.getElementById('location-details').classList.remove('hidden');
}

function selectCharacter(characterName, characterDescription, triggerElement) {
    selectedCharacterName = characterName;

    if (selectedSub) {
        document.querySelectorAll('#location-characters .character-item').forEach(btn => {
            btn.classList.toggle('selected', btn.dataset.characterName === characterName);
        });
    } else {
         document.querySelectorAll('#location-characters .character-item.selected').forEach(btn => {
            btn.classList.remove('selected');
         });
    }

     const modal = document.getElementById('character-modal');
     const modalName = document.getElementById('modal-character-name');
     const modalDescription = document.getElementById('modal-character-description');
     const modalOptionsContainer = document.getElementById('modal-interaction-options');

     modalDescription.textContent = '';
     modalOptionsContainer.innerHTML = '';
     modalName.textContent = characterName;

    let interactionOptions = [];
    let descriptionParts = [];

    if (characterDescription) {
        const allParts = characterDescription.split(';').map(p => p.trim()).filter(p => p);
        let optionsFound = false;
        allParts.forEach(part => {
            if (optionsFound) {
                interactionOptions.push(part);
            } else if (part.startsWith('互动选项:')) {
                const firstOption = part.substring('互动选项:'.length).trim();
                if (firstOption) interactionOptions.push(firstOption);
                optionsFound = true;
            } else {
                descriptionParts.push(part.replace(':', ': '));
            }
        });
    }

    modalDescription.textContent = descriptionParts.length > 0 ? descriptionParts.join('\n') : '(没有更多信息)';

    if (interactionOptions.length > 0) {
        interactionOptions.slice(0, 4).forEach(optionText => {
            const button = document.createElement('button');
            button.className = 'interaction-button';
            button.textContent = optionText;
            // Assuming confirmInteraction is defined globally or imported
            button.addEventListener('click', () => {
                 modal.classList.add('hidden');
                 confirmInteraction(optionText);
            });
            modalOptionsContainer.appendChild(button);
        });
    } else {
         modalOptionsContainer.innerHTML = '<p class="info-message">没有可用的互动选项。</p>';
    }

    modal.classList.remove('hidden');
    const characterModalDialog = modal.querySelector('.character-modal-dialog');
    // Assuming positionModalCenter is defined globally or imported
    requestAnimationFrame(() => positionModalCenter(characterModalDialog));
}

function resetSelection(hideAll = true) {
    selectedMain = null;
    selectedSub = null;
    selectedCharacterName = null;
    closeCharacterModal(); // Assuming closeCharacterModal is defined globally or imported

    document.querySelectorAll('#visual-map .map-location-group.selected, .sub-location-button.selected, .character-item.selected, .switch-area-button.selected').forEach(el => {
        el.classList.remove('selected');
    });

     if (hideAll) {
        document.getElementById('sub-locations').classList.add('hidden');
     } else {
        // Keep sub-locations potentially visible if just resetting character/sub selection
        // but ensure details are hidden if no sub-location is selected
        if (!selectedSub) document.getElementById('sub-locations').classList.add('hidden');
     }
    document.getElementById('location-details').classList.add('hidden');
    const selectedLocationSpan = document.getElementById('selected-location');
    if(selectedLocationSpan) selectedLocationSpan.textContent = '未选择';
    updateActionButtonState(); // Assuming updateActionButtonState is defined globally or imported
}
