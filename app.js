// ==========================================
// 1. GLOBAL STATE INITIALIZATION
// ==========================================
let balance = parseFloat(localStorage.getItem('balance')) || 500.0;
let inventory = JSON.parse(localStorage.getItem('inventory')) || [];
let stats = JSON.parse(localStorage.getItem('stats')) || { upgradesTried: 0 };
let unlockedItems = JSON.parse(localStorage.getItem('unlockedItems')) || [];
let lastClickTime = 0;

let selectedWagerIndices = []; 
let selectedWagerIndex = null;   
let selectedTargetItem = null;
let isRolling = false;
let currentInspectCaseIndex = null;
let currentSelectedQuantity = 1;

// ==========================================
// 2. CORE SYSTEMS & BOOTSTRAPPING
// ==========================================
window.onload = () => {
    if (window.Telegram && window.Telegram.WebApp) { 
        window.Telegram.WebApp.ready(); 
    }
    
    // Auto-discover historical items sitting inside inventory
    inventory.forEach(item => {
        if (!unlockedItems.includes(item.emoji)) unlockedItems.push(item.emoji);
    });
    localStorage.setItem('unlockedItems', JSON.stringify(unlockedItems));
    
    renderCaseMenu();
    updateUI();
};

function switchTab(tabId) {
    if (isRolling) return;
    document.querySelectorAll('.tab-view').forEach(el => el.classList.remove('active-view'));
    document.querySelectorAll('.tab-trigger').forEach(el => el.classList.remove('active'));
    
    document.getElementById(tabId).classList.add('active-view');
    document.getElementById('btn-' + tabId).classList.add('active');
    
    if (tabId === 'upgraderTab') renderUpgraderGrids();
}

function saveGame() {
    localStorage.setItem('balance', balance);
    localStorage.setItem('inventory', JSON.stringify(inventory));
    localStorage.setItem('stats', JSON.stringify(stats));
    localStorage.setItem('unlockedItems', JSON.stringify(unlockedItems));
    updateUI();
}

function updateUI() {
    document.getElementById('balanceDisplay').innerText = balance.toFixed(1);
    document.getElementById('statUpgrades').innerText = stats.upgradesTried;
    document.getElementById('statItemsCount').innerText = inventory.length;

    const profileInv = document.getElementById('profileInventory');
    profileInv.innerHTML = '';
    inventory.forEach((item, index) => {
        let card = document.createElement('div');
        card.className = 'item-capsule';
        card.innerHTML = `
            <div style="display:flex; flex-direction:column;">
                <span>${item.emoji}</span>
                <span class="cap-value">${item.value} U</span>
            </div>
            <button class="btn-sell-quick" onclick="sellItem(${index}, event)">SELL</button>
        `;
        profileInv.appendChild(card);
    });
}

function clickCoin() {
    if (isRolling) return;
    const now = Date.now();
    if (now - lastClickTime >= 40) {
        balance += 0.5;
        lastClickTime = now;
        document.getElementById('balanceDisplay').innerText = balance.toFixed(1);
        localStorage.setItem('balance', balance);
    }
}

function clearLegacyData() {
    if (isRolling) return;
    if (!confirm("Reset progress save states?")) return;

    localStorage.clear();
    balance = 500.0; inventory = []; stats = { upgradesTried: 0 }; unlockedItems = [];
    selectedWagerIndices = []; selectedTargetItem = null; selectedWagerIndex = null;
    saveGame(); renderCaseMenu(); renderUpgraderGrids();
}

// ==========================================
// 3. ARCHIVE COLLECTION BOOK CATALOGUE
// ==========================================
function openIndexModal() {
    const grid = document.getElementById('indexGrid');
    grid.innerHTML = '';

    itemPool.forEach(item => {
        let isUnlocked = unlockedItems.includes(item.emoji);
        let card = document.createElement('div');
        card.className = `index-item-card ${isUnlocked ? 'unlocked' : 'locked'}`;
        
        if (isUnlocked) {
            card.innerHTML = `<span class="idx-emoji">${item.emoji}</span><span class="idx-val" style="color:var(--accent-gold);">${item.value} U</span>`;
        } else {
            card.innerHTML = `<span class="idx-emoji">❓</span><span class="idx-val" style="color:var(--text-muted);">Locked</span>`;
        }
        grid.appendChild(card);
    });
    document.getElementById('itemIndexModal').style.display = 'flex';
}

function closeIndexModal() {
    document.getElementById('itemIndexModal').style.display = 'none';
}

// ==========================================
// 4. CASE MANAGEMENT CONTROLLERS
// ==========================================
function renderCaseMenu() {
    const menu = document.getElementById('caseMenuGrid');
    if (!menu) return;
    menu.innerHTML = '';
    casesData.forEach((box, index) => {
        let row = document.createElement('div');
        row.className = 'case-element-card';
        row.onclick = () => openInspectModal(index);
        row.innerHTML = `
            <span class="case-name">📦 ${box.name}</span>
            <span class="case-cost">${box.cost} U</span>
        `;
        menu.appendChild(row);
    });
}

function openInspectModal(caseIndex) {
    if (isRolling) return;
    currentInspectCaseIndex = caseIndex;
    const targetCase = casesData[caseIndex];
    
    document.getElementById('inspectCaseName').innerText = targetCase.name;
    const listContainer = document.getElementById('inspectItemsList');
    listContainer.innerHTML = '';

    targetCase.contents.forEach(row => {
        let div = document.createElement('div');
        div.className = 'list-row-entry';
        div.innerHTML = `
            <div style="display:flex; gap:6px;">
                <span>${row.item.emoji}</span>
                <span style="color:var(--accent-gold); font-weight:700;">${row.item.value} U</span>
            </div>
            <span style="color:var(--text-muted);">${row.chance.toFixed(1)}%</span>
        `;
        listContainer.appendChild(div);
    });

    setUnboxQuantity(1);
    document.getElementById('caseDetailsModal').style.display = 'flex';
}

function closeInspectModal() {
    document.getElementById('caseDetailsModal').style.display = 'none';
}

function setUnboxQuantity(qty) {
    currentSelectedQuantity = qty;
    document.querySelectorAll('.btn-selector').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`qty-${qty}`).classList.add('active');

    const totalCost = casesData[currentInspectCaseIndex].cost * qty;
    document.getElementById('totalCaseCostDisplay').innerText = totalCost;
}

function rollFromCase(boxConfig) {
    let rand = Math.random() * 100;
    let sum = 0;
    for (let i = 0; i < boxConfig.contents.length; i++) {
        sum += boxConfig.contents[i].chance;
        if (rand <= sum) return boxConfig.contents[i].item;
    }
    return boxConfig.contents[boxConfig.contents.length - 1].item;
}

function confirmCasePurchase() {
    const targetCase = casesData[currentInspectCaseIndex];
    const totalCost = targetCase.cost * currentSelectedQuantity;

    if (balance < totalCost) return alert("Insufficient account value!");

    closeInspectModal();
    isRolling = true;
    balance -= totalCost;

    let itemsWonList = [];
    const wrappers = document.getElementById('multiRollersWrapper');
    wrappers.innerHTML = ''; 
    document.getElementById('multiResultsContainer').innerHTML = '';
    document.getElementById('modalClaimBtn').style.display = 'none';

    document.getElementById('rollerCaseTitle').innerText = `Opening ${currentSelectedQuantity}x ${targetCase.name}`;

    let tapeElements = [];
    for (let q = 0; q < currentSelectedQuantity; q++) {
        let rolledItem = rollFromCase(targetCase);
        itemsWonList.push(rolledItem);

        if (!unlockedItems.includes(rolledItem.emoji)) unlockedItems.push(rolledItem.emoji);

        let viewport = document.createElement('div');
        viewport.className = 'lane-viewport';
        viewport.innerHTML = `<div class="lane-crosshair"></div>`;

        let tape = document.createElement('div');
        tape.className = 'lane-conveyor';
        tape.id = `tape-row-${q}`;

        for (let i = 0; i < 40; i++) {
            let card = document.createElement('div');
            card.className = 'lane-box-node';
            let randomMockItem = (i === 35) ? rolledItem : itemPool[Math.floor(Math.random() * itemPool.length)];
            card.innerText = randomMockItem.emoji;
            tape.appendChild(card);
        }

        viewport.appendChild(tape);
        wrappers.appendChild(viewport);
        tapeElements.push(tape);
    }

    document.getElementById('unboxingModal').style.display = 'flex';

    setTimeout(() => {
        tapeElements.forEach(tape => {
            tape.style.transition = 'transform 2.5s cubic-bezier(0.1, 0.8, 0.1, 1)';
            tape.style.transform = 'translateX(-2060px)';
        });
    }, 40);

    itemsWonList.forEach((item, index) => {
        setTimeout(() => {
            inventory.push(item);
            let resCard = document.createElement('div');
            resCard.className = 'reward-pill';
            resCard.innerHTML = `<span>${item.emoji}</span>`;
            document.getElementById('multiResultsContainer').appendChild(resCard);
            saveGame();
        }, 1800 + (index * 120));
    });

    setTimeout(() => {
        document.getElementById('modalClaimBtn').style.display = 'block';
    }, 2600);
}

function closeUnboxModal() {
    document.getElementById('unboxingModal').style.display = 'none';
    isRolling = false;
}

// ==========================================
// 5. UNIFIED UPGRADER CONTROLLER
// ==========================================
function sellItem(index, event) {
    if (isRolling) return;
    event.stopPropagation();
    balance += Math.floor(inventory[index].value * 0.7);
    inventory.splice(index, 1);
    
    selectedWagerIndices = [];
    selectedWagerIndex = null;
    selectedTargetItem = null;
    
    saveGame();
    if(document.getElementById('upgraderTab').classList.contains('active-view')) renderUpgraderGrids();
}

function renderUpgraderGrids() {
    const wagerGrid = document.getElementById('wagerGrid');
    wagerGrid.innerHTML = '';
    
    inventory.forEach((item, index) => {
        let isSelected = selectedWagerIndices.includes(index);
        let card = document.createElement('div');
        card.className = `item-capsule ${isSelected ? 'selected' : ''}`;
        card.innerHTML = `<span>${item.emoji}</span><span class="cap-value">${item.value} U</span>`;
        card.onclick = () => {
            if (isRolling) return;
            
            if (isSelected) {
                selectedWagerIndices = selectedWagerIndices.filter(i => i !== index);
            } else {
                if (selectedWagerIndices.length >= 6) return alert("Upgrader slot capacity reached (Max 6)!");
                selectedWagerIndices.push(index);
            }
            
            selectedWagerIndex = selectedWagerIndices.length > 0 ? selectedWagerIndices[0] : null;
            selectedTargetItem = null; 
            
            let totalWagerVal = selectedWagerIndices.reduce((sum, idx) => sum + inventory[idx].value, 0);
            const stageWager = document.getElementById('stageWager');
            
            if (selectedWagerIndices.length > 0) {
                stageWager.className = "dock-slot active";
                stageWager.innerHTML = `<span>Staged: ${selectedWagerIndices.length} items</span><span style="font-size:10px;color:var(--accent-gold);">${totalWagerVal} U</span>`;
            } else {
                stageWager.className = "dock-slot empty";
                stageWager.innerText = "Select Wager";
            }
            
            document.getElementById('stageTarget').className = "dock-slot empty";
            document.getElementById('stageTarget').innerText = "Select Target";
            
            renderUpgraderGrids();
            updateChance();
        };
        wagerGrid.appendChild(card);
    });

    const targetGrid = document.getElementById('targetGrid');
    targetGrid.innerHTML = '';
    
    let totalWagerValue = selectedWagerIndices.reduce((sum, idx) => sum + (inventory[idx] ? inventory[idx].value : 0), 0);
    if (totalWagerValue === 0 && selectedWagerIndex !== null && inventory[selectedWagerIndex]) {
        totalWagerValue = inventory[selectedWagerIndex].value;
    }

    if (totalWagerValue === 0) {
        targetGrid.innerHTML = '<div style="color:var(--text-muted); font-size:11px; text-align:center; padding-top:20px;">Pick staging cards first</div>';
        return;
    }

    const validTargets = itemPool.filter(item => item.value > totalWagerValue);
    if (validTargets.length === 0) {
        targetGrid.innerHTML = '<div style="color:var(--accent-red); font-size:11px; text-align:center;">Max cap tier reached!</div>';
        return;
    }

    validTargets.forEach((item) => {
        let isSelected = selectedTargetItem && selectedTargetItem.value === item.value && selectedTargetItem.emoji === item.emoji;
        let card = document.createElement('div');
        card.className = `item-capsule ${isSelected ? 'selected' : ''}`;
        card.innerHTML = `<span>${item.emoji}</span><span class="cap-value">${item.value} U</span>`;
        card.onclick = () => {
            if (isRolling) return;
            selectedTargetItem = item;
            document.getElementById('stageTarget').className = "dock-slot active";
            document.getElementById('stageTarget').innerHTML = `<span>Target: ${item.emoji}</span><span style="font-size:10px;color:var(--accent-gold);">${item.value} U</span>`;
            renderUpgraderGrids();
            updateChance();
        };
        targetGrid.appendChild(card);
    });
}

function applyPresetMultiplier(mult) {
    let totalWagerVal = selectedWagerIndices.reduce((sum, idx) => sum + (inventory[idx] ? inventory[idx].value : 0), 0);
    if (totalWagerVal === 0 && selectedWagerIndex !== null && inventory[selectedWagerIndex]) {
        totalWagerVal = inventory[selectedWagerIndex].value;
    }
    if (totalWagerVal === 0) return alert("Select cards from inventory list first!");
    findAndSelectClosestTarget(totalWagerVal * mult);
}

function applyPresetChance(chancePercent) {
    let totalWagerVal = selectedWagerIndices.reduce((sum, idx) => sum + (inventory[idx] ? inventory[idx].value : 0), 0);
    if (totalWagerVal === 0 && selectedWagerIndex !== null && inventory[selectedWagerIndex]) {
        totalWagerVal = inventory[selectedWagerIndex].value;
    }
    if (totalWagerVal === 0) return alert("Select cards from inventory list first!");
    findAndSelectClosestTarget(totalWagerVal / (chancePercent / 100));
}

function findAndSelectClosestTarget(targetValue) {
    let totalWagerVal = selectedWagerIndices.reduce((sum, idx) => sum + (inventory[idx] ? inventory[idx].value : 0), 0);
    if (totalWagerVal === 0 && selectedWagerIndex !== null && inventory[selectedWagerIndex]) {
        totalWagerVal = inventory[selectedWagerIndex].value;
    }
    
    const validTargets = itemPool.filter(item => item.value > totalWagerVal);
    if(validTargets.length === 0) return;

    let closest = validTargets.reduce((prev, curr) => {
        return (Math.abs(curr.value - targetValue) < Math.abs(prev.value - targetValue)) ? curr : prev;
    });

    selectedTargetItem = closest;
    document.getElementById('stageTarget').className = "dock-slot active";
    document.getElementById('stageTarget').innerHTML = `<span>Target: ${closest.emoji}</span><span style="font-size:10px;color:var(--accent-gold);">${closest.value} U</span>`;
    renderUpgraderGrids();
    updateChance();
}

function updateChance() {
    let totalWagerVal = selectedWagerIndices.reduce((sum, idx) => sum + (inventory[idx] ? inventory[idx].value : 0), 0);
    if (totalWagerVal === 0 && selectedWagerIndex !== null && inventory[selectedWagerIndex]) {
        totalWagerVal = inventory[selectedWagerIndex].value;
    }

    if (totalWagerVal === 0 || selectedTargetItem === null) {
        document.getElementById('chanceDisplay').innerText = "0.00%";
        document.getElementById('upgraderWheel').style.background = `var(--accent-red)`;
        return;
    }

    let chance = (totalWagerVal / selectedTargetItem.value) * 100;
    if (chance > 100) chance = 100;
    document.getElementById('chanceDisplay').innerText = chance.toFixed(2) + "%";
    
    let halfSlice = (chance * 3.6) / 2;
    let startGreen = 180 - halfSlice;
    let endGreen = 180 + halfSlice;
    document.getElementById('upgraderWheel').style.background = `conic-gradient(var(--accent-red) 0deg ${startGreen}deg, var(--accent-green) ${startGreen}deg ${endGreen}deg, var(--accent-red) ${endGreen}deg 360deg)`;
}

function attemptUpgrade() {
    let totalWagerVal = selectedWagerIndices.reduce((sum, idx) => sum + (inventory[idx] ? inventory[idx].value : 0), 0);
    if (totalWagerVal === 0 && selectedWagerIndex !== null && inventory[selectedWagerIndex]) {
        totalWagerVal = inventory[selectedWagerIndex].value;
    }
    
    if (totalWagerVal === 0 || selectedTargetItem === null) return alert("Wager or Target items are not staged!");
    let chance = (totalWagerVal / selectedTargetItem.value) * 100;
    
    isRolling = true;
    stats.upgradesTried += 1;
    const isFast = document.getElementById('fastUpgrade').checked;
    const btn = document.getElementById('upgradeBtn');
    const pointer = document.getElementById('wheelPointer');
    
    pointer.style.transition = 'none'; pointer.style.transform = 'rotate(0deg)'; pointer.offsetHeight;
    
    let roll = Math.random() * 100;
    let isWin = roll <= chance;
    let halfSlice = (chance * 3.6) / 2;
    let targetDegree = isWin ? ((180 - halfSlice) + (Math.random() * (halfSlice * 2))) : (Math.random() > 0.5 ? (Math.random() * (180 - halfSlice)) : ((180 + halfSlice) + (Math.random() * (180 - halfSlice))));
    let totalSpins = 1440 + targetDegree;

    function resolveUpgrade() {
        if (selectedWagerIndices.length > 0) {
            selectedWagerIndices.sort((a, b) => b - a);
            selectedWagerIndices.forEach(idx => inventory.splice(idx, 1));
        } else if (selectedWagerIndex !== null) {
            inventory.splice(selectedWagerIndex, 1);
        }

        if (isWin) {
            inventory.push(selectedTargetItem);
            if (!unlockedItems.includes(selectedTargetItem.emoji)) unlockedItems.push(selectedTargetItem.emoji);
            alert(`🎉 Upgrade Successful! Created ${selectedTargetItem.emoji}`);
        } else {
            alert("💥 Failed! The upgrade engine exploded your items.");
        }
        
        selectedWagerIndices = [];
        selectedWagerIndex = null;
        selectedTargetItem = null;
        document.getElementById('stageWager').className = "dock-slot empty";
        document.getElementById('stageWager').innerText = "Select Wager";
        document.getElementById('stageTarget').className = "dock-slot empty";
        document.getElementById('stageTarget').innerText = "Select Target";
        btn.innerText = "START CALCULATED UPGRADE"; btn.disabled = false;
        isRolling = false;
        saveGame(); renderUpgraderGrids(); updateChance();
    }

    if (isFast) resolveUpgrade();
    else {
        btn.innerText = "CALCULATING VEIL..."; btn.disabled = true;
        pointer.style.transition = 'transform 2.2s cubic-bezier(0.1, 0.8, 0.1, 1)';
        pointer.style.transform = `rotate(${totalSpins}deg)`;
        setTimeout(resolveUpgrade, 2300);
    }
}