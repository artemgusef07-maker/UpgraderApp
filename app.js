let balance = parseFloat(localStorage.getItem('balance')) || 500.0;
let inventory = JSON.parse(localStorage.getItem('inventory')) || [];
let stats = JSON.parse(localStorage.getItem('stats')) || { upgradesTried: 0 };
let lastClickTime = 0;

/* REPLACE THESE COMPONENT TRACKERS AT THE TOP OF app.js */
let selectedWagerIndices = []; // Now stores up to 6 item indices
let selectedTargetItem = null;
let isRolling = false;
let currentInspectCaseIndex = null;
let currentSelectedQuantity = 1;

// Lock handles to block game breaking resets during active rolls
let isRolling = false;
let currentInspectCaseIndex = null;
let currentSelectedQuantity = 1;

window.onload = () => {
    if (window.Telegram && window.Telegram.WebApp) { window.Telegram.WebApp.ready(); }
    renderCaseMenu();
    updateUI();
};

function clearLegacyData() {
    if (isRolling) {
        alert("Action locked while active roll calculation sequence is spinning!");
        return;
    }
    const confirmReset = confirm("Are you sure you want to clear your save state?");
    if (!confirmReset) return;

    localStorage.clear();
    balance = 500.0; inventory = []; stats = { upgradesTried: 0 };
    selectedWagerIndices = []; selectedTargetItem = null;
    saveGame(); renderCaseMenu(); renderUpgraderGrids();
}

function sellItem(index, event) {
    if (isRolling) return;
    event.stopPropagation();
    balance += Math.floor(inventory[index].value * 0.7);
    inventory.splice(index, 1);
    
    // Wipe selections if the item sold was inside the staging deck
    selectedWagerIndices = [];
    selectedTargetItem = null;
    
    saveGame();
    if(document.getElementById('upgraderTab').classList.contains('active-tab')) renderUpgraderGrids();
}

function switchTab(tabId) {
    if (isRolling) {
        alert("Action locked while upgrade/unbox calculation is spinning!");
        return;
    }
    document.querySelectorAll('.tab-pane').forEach(el => el.classList.remove('active-tab'));
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    
    document.getElementById(tabId).classList.add('active-tab');
    document.getElementById('btn-' + tabId).classList.add('active');
    
    if (tabId === 'upgraderTab') renderUpgraderGrids();
}

function saveGame() {
    localStorage.setItem('balance', balance);
    localStorage.setItem('inventory', JSON.stringify(inventory));
    localStorage.setItem('stats', JSON.stringify(stats));
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
        card.className = 'mini-item-card';
        card.innerHTML = `
            <span class="mic-emoji">${item.emoji}</span>
            <span class="mic-val">${item.value} U</span>
            <button class="quick-sell-btn" onclick="sellItem(${index}, event)">SELL (${Math.floor(item.value * 0.7)})</button>
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

function renderCaseMenu() {
    const menu = document.getElementById('caseMenuGrid');
    menu.innerHTML = '';
    casesData.forEach((box, index) => {
        let row = document.createElement('div');
        row.className = 'case-row-card';
        row.onclick = () => openInspectModal(index);
        row.innerHTML = `
            <div class="case-details">
                <span class="case-title">📦 ${box.name}</span>
                <span class="case-odds-preview">Click to Inspect Contents</span>
            </div>
            <span class="case-price-tag">${box.cost} U</span>
        `;
        menu.appendChild(row);
    });
}

/* Modal Inspection Windows Setup */
function openInspectModal(caseIndex) {
    if (isRolling) return;
    currentInspectCaseIndex = caseIndex;
    const targetCase = casesData[caseIndex];
    
    document.getElementById('inspectCaseName').innerText = targetCase.name;
    const listContainer = document.getElementById('inspectItemsList');
    listContainer.innerHTML = '';

    targetCase.contents.forEach(row => {
        let div = document.createElement('div');
        div.className = 'inspect-item-row';
        div.innerHTML = `
            <div class="inspect-item-left">
                <span>${row.item.emoji}</span>
                <span class="inspect-item-price">${row.item.value} U</span>
            </div>
            <span class="inspect-item-chance">${row.chance.toFixed(1)}%</span>
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
    document.querySelectorAll('.qty-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`qty-${qty}`).classList.add('active');

    const totalCost = casesData[currentInspectCaseIndex].cost * qty;
    document.getElementById('totalCaseCostDisplay').innerText = totalCost;
}

/* Mathematical weight selector logic */
function rollFromCase(boxConfig) {
    let rand = Math.random() * 100;
    let sum = 0;
    for (let i = 0; i < boxConfig.contents.length; i++) {
        sum += boxConfig.contents[i].chance;
        if (rand <= sum) return boxConfig.contents[i].item;
    }
    return boxConfig.contents[boxConfig.contents.length - 1].item;
}

// ... (Keep existing variables: balance, inventory, isRolling)

function confirmCasePurchase() {
    const targetCase = casesData[currentInspectCaseIndex];
    const totalCost = targetCase.cost * currentSelectedQuantity;

    if (balance < totalCost) {
        alert("Insufficient balance!");
        return;
    }

    closeInspectModal();
    isRolling = true;
    balance -= totalCost;

    let itemsWonList = [];
    const wrappers = document.getElementById('multiRollersWrapper');
    wrappers.innerHTML = ''; // Wipe legacy views
    document.getElementById('multiResultsContainer').innerHTML = '';
    document.getElementById('modalClaimBtn').style.display = 'none';

    document.getElementById('rollerCaseTitle').innerText = `Opening ${currentSelectedQuantity}x ${targetCase.name}`;

    // 1. Build and stack individual, parallel viewports dynamically
    let tapeElements = [];
    for (let q = 0; q < currentSelectedQuantity; q++) {
        let rolledItem = rollFromCase(targetCase);
        itemsWonList.push(rolledItem);

        let viewport = document.createElement('div');
        viewport.className = 'roller-viewport';
        viewport.innerHTML = `<div class="roller-center-line"></div>`;

        let tape = document.createElement('div');
        tape.className = 'roller-tape';
        tape.id = `tape-row-${q}`;

        // Populate items inside this specific case tape path
        for (let i = 0; i < 40; i++) {
            let card = document.createElement('div');
            card.className = 'roller-card-item';
            let randomMockItem = (i === 35) ? rolledItem : itemPool[Math.floor(Math.random() * itemPool.length)];
            card.innerText = randomMockItem.emoji;
            tape.appendChild(card);
        }

        viewport.appendChild(tape);
        wrappers.appendChild(viewport);
        tapeElements.push(tape);
    }

    document.getElementById('unboxingModal').style.display = 'flex';

    // 2. Trigger synchronized horizontal roll animations
    setTimeout(() => {
        tapeElements.forEach(tape => {
            tape.style.transition = 'transform 3s cubic-bezier(0.1, 0.8, 0.1, 1)';
            tape.style.transform = 'translateX(-2300px)';
        });
    }, 50);

    // 3. Deliver bundle outcome cards sequentially
    itemsWonList.forEach((item, index) => {
        setTimeout(() => {
            inventory.push(item);
            let resCard = document.createElement('div');
            resCard.className = 'bundle-result-card';
            resCard.innerHTML = `<div>${item.emoji}</div><div style="font-size:10px;color:#ffca28;font-weight:bold;">${item.value} U</div>`;
            document.getElementById('multiResultsContainer').appendChild(resCard);
            saveGame();
        }, 2200 + (index * 150));
    });

    setTimeout(() => {
        document.getElementById('modalClaimBtn').style.display = 'block';
    }, 3200);
}

// ... (Rest of your app logic remains the same)

function closeUnboxModal() {
    document.getElementById('unboxingModal').style.display = 'none';
    isRolling = false;
}

function sellItem(index, event) {
    if (isRolling) return;
    event.stopPropagation();
    balance += Math.floor(inventory[index].value * 0.7);
    inventory.splice(index, 1);
    if(selectedWagerIndex === index) {
        selectedWagerIndex = null;
        selectedTargetItem = null;
    }
    saveGame();
    if(document.getElementById('upgraderTab').classList.contains('active-tab')) renderUpgraderGrids();
}

function renderUpgraderGrids() {
    const wagerGrid = document.getElementById('wagerGrid');
    wagerGrid.innerHTML = '';
    
    inventory.forEach((item, index) => {
        let isSelected = selectedWagerIndices.includes(index);
        let card = document.createElement('div');
        card.className = `mini-item-card ${isSelected ? 'selected' : ''}`;
        card.innerHTML = `<span class="mic-emoji">${item.emoji}</span><span class="mic-val">${item.value} U</span>`;
        card.onclick = () => {
            if (isRolling) return;
            
            if (isSelected) {
                selectedWagerIndices = selectedWagerIndices.filter(i => i !== index);
            } else {
                if (selectedWagerIndices.length >= 6) {
                    alert("Maximum limit of 6 wager items reached!");
                    return;
                }
                selectedWagerIndices.push(index);
            }
            
            selectedTargetItem = null; // Clear old outcome targeting criteria
            
            let totalWagerVal = selectedWagerIndices.reduce((sum, idx) => sum + inventory[idx].value, 0);
            const stageWager = document.getElementById('stageWager');
            
            if (selectedWagerIndices.length > 0) {
                stageWager.className = "dock-slot active";
                stageWager.innerHTML = `<span>📥 ${selectedWagerIndices.length} Items</span><span>Total: ${totalWagerVal} U</span>`;
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
    
    if (selectedWagerIndices.length === 0) {
        targetGrid.innerHTML = '<div style="color:#6e6e82; padding:10px;">Select up to 6 wager items first!</div>';
        return;
    }

    let totalWagerValue = selectedWagerIndices.reduce((sum, idx) => sum + inventory[idx].value, 0);
    const validTargets = itemPool.filter(item => item.value > totalWagerValue);

    if (validTargets.length === 0) {
        targetGrid.innerHTML = '<div style="color:#ff6b6b; padding:10px;">Max upgrade boundary tier reached!</div>';
        return;
    }

    validTargets.forEach((item) => {
        let isSelected = selectedTargetItem && selectedTargetItem.value === item.value && selectedTargetItem.emoji === item.emoji;
        let card = document.createElement('div');
        card.className = `mini-item-card ${isSelected ? 'selected' : ''}`;
        card.innerHTML = `<span class="mic-emoji">${item.emoji}</span><span class="mic-val">${item.value} U</span>`;
        card.onclick = () => {
            if (isRolling) return;
            selectedTargetItem = item;
            document.getElementById('stageTarget').className = "dock-slot active";
            document.getElementById('stageTarget').innerHTML = `<span>${item.emoji}</span><span>${item.value} U</span>`;
            renderUpgraderGrids();
            updateChance();
        };
        targetGrid.appendChild(card);
    });
}

function applyPresetMultiplier(mult) {
    if (selectedWagerIndices.length === 0) return alert("Select wager items first!");
    let totalWagerVal = selectedWagerIndices.reduce((sum, idx) => sum + inventory[idx].value, 0);
    findAndSelectClosestTarget(totalWagerVal * mult);
}

function applyPresetChance(chancePercent) {
    if (selectedWagerIndices.length === 0) return alert("Select wager items first!");
    let totalWagerVal = selectedWagerIndices.reduce((sum, idx) => sum + inventory[idx].value, 0);
    findAndSelectClosestTarget(totalWagerVal / (chancePercent / 100));
}

function findAndSelectClosestTarget(targetValue) {
    let totalWagerVal = selectedWagerIndices.reduce((sum, idx) => sum + inventory[idx].value, 0);
    const validTargets = itemPool.filter(item => item.value > totalWagerVal);
    if(validTargets.length === 0) return;

    let closest = validTargets.reduce((prev, curr) => {
        return (Math.abs(curr.value - targetValue) < Math.abs(prev.value - targetValue)) ? curr : prev;
    });

    selectedTargetItem = closest;
    document.getElementById('stageTarget').className = "dock-slot active";
    document.getElementById('stageTarget').innerHTML = `<span>${closest.emoji}</span><span>${closest.value} U</span>`;
    renderUpgraderGrids();
    updateChance();
}

function updateChance() {
    if (selectedWagerIndices.length === 0 || selectedTargetItem === null) {
        document.getElementById('chanceDisplay').innerText = "0.00%";
        document.getElementById('upgraderWheel').style.background = `#e74c3c`;
        return;
    }
    let totalWagerVal = selectedWagerIndices.reduce((sum, idx) => sum + inventory[idx].value, 0);
    let chance = (totalWagerVal / selectedTargetItem.value) * 100;
    if (chance > 100) chance = 100;
    document.getElementById('chanceDisplay').innerText = chance.toFixed(2) + "%";
    
    let halfSlice = (chance * 3.6) / 2;
    let startGreen = 180 - halfSlice;
    let endGreen = 180 + halfSlice;
    document.getElementById('upgraderWheel').style.background = `conic-gradient(#e74c3c 0deg ${startGreen}deg, #34c759 ${startGreen}deg ${endGreen}deg, #e74c3c ${endGreen}deg 360deg)`;
}

function attemptUpgrade() {
    if (selectedWagerIndices.length === 0 || selectedTargetItem === null) return alert("Staging cards are empty!");
    let totalWagerVal = selectedWagerIndices.reduce((sum, idx) => sum + inventory[idx].value, 0);
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
        // Clear all selected wager items out of inventory safely
        selectedWagerIndices.sort((a, b) => b - a);
        selectedWagerIndices.forEach(idx => inventory.splice(idx, 1));

        if (isWin) {
            inventory.push(selectedTargetItem);
            alert(`🎉 Success! Items merged into ${selectedTargetItem.emoji}`);
        } else {
            alert("💥 Boom! Upgrade exploded. All wagered items lost.");
        }
        
        selectedWagerIndices = [];
        selectedTargetItem = null;
        document.getElementById('stageWager').className = "dock-slot empty";
        document.getElementById('stageWager').innerText = "Select Wager";
        document.getElementById('stageTarget').className = "dock-slot empty";
        document.getElementById('stageTarget').innerText = "Select Target";
        btn.innerText = "START UPGRADE"; btn.disabled = false;
        isRolling = false;
        saveGame(); renderUpgraderGrids(); updateChance();
    }

    if (isFast) resolveUpgrade();
    else {
        btn.innerText = "ROLLING..."; btn.disabled = true;
        pointer.style.transition = 'transform 2.5s cubic-bezier(0.1, 0.8, 0.1, 1)';
        pointer.style.transform = `rotate(${totalSpins}deg)`;
        setTimeout(resolveUpgrade, 2600);
    }
}

function applyPresetMultiplier(mult) {
    if (selectedWagerIndex === null) return alert("Select a wager item first!");
    let desiredValue = inventory[selectedWagerIndex].value * mult;
    findAndSelectClosestTarget(desiredValue);
}

function applyPresetChance(chancePercent) {
    if (selectedWagerIndex === null) return alert("Select a wager item first!");
    let desiredValue = inventory[selectedWagerIndex].value / (chancePercent / 100);
    findAndSelectClosestTarget(desiredValue);
}

function findAndSelectClosestTarget(targetValue) {
    const wagerItem = inventory[selectedWagerIndex];
    const validTargets = itemPool.filter(item => item.value > wagerItem.value);
    if(validTargets.length === 0) return;

    let closest = validTargets.reduce((prev, curr) => {
        return (Math.abs(curr.value - targetValue) < Math.abs(prev.value - targetValue)) ? curr : prev;
    });

    selectedTargetItem = closest;
    document.getElementById('stageTarget').className = "dock-slot active";
    document.getElementById('stageTarget').innerHTML = `<span>${closest.emoji}</span><span>${closest.value} U</span>`;
    renderUpgraderGrids();
    updateChance();
}

function updateChance() {
    if (selectedWagerIndex === null || selectedTargetItem === null) {
        document.getElementById('chanceDisplay').innerText = "0.00%";
        document.getElementById('upgraderWheel').style.background = `#e74c3c`;
        return;
    }
    let chance = (inventory[selectedWagerIndex].value / selectedTargetItem.value) * 100;
    if (chance > 100) chance = 100;
    document.getElementById('chanceDisplay').innerText = chance.toFixed(2) + "%";
    
    let halfSlice = (chance * 3.6) / 2;
    let startGreen = 180 - halfSlice;
    let endGreen = 180 + halfSlice;
    document.getElementById('upgraderWheel').style.background = `conic-gradient(#e74c3c 0deg ${startGreen}deg, #34c759 ${startGreen}deg ${endGreen}deg, #e74c3c ${endGreen}deg 360deg)`;
}

function attemptUpgrade() {
    if (selectedWagerIndex === null || selectedTargetItem === null) return alert("Staging cards are empty!");
    let chance = (inventory[selectedWagerIndex].value / selectedTargetItem.value) * 100;
    
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
        inventory.splice(selectedWagerIndex, 1);
        if (isWin) {
            inventory.push(selectedTargetItem);
            alert(`🎉 Success! Upgraded into ${selectedTargetItem.emoji}`);
        } else {
            alert("💥 Boom! Upgrade exploded.");
        }
        selectedWagerIndex = null;
        selectedTargetItem = null;
        document.getElementById('stageWager').className = "dock-slot empty";
        document.getElementById('stageWager').innerText = "Select Wager";
        document.getElementById('stageTarget').className = "dock-slot empty";
        document.getElementById('stageTarget').innerText = "Select Target";
        btn.innerText = "START UPGRADE"; btn.disabled = false;
        isRolling = false;
        saveGame(); renderUpgraderGrids(); updateChance();
    }

    if (isFast) resolveUpgrade();
    else {
        btn.innerText = "ROLLING..."; btn.disabled = true;
        pointer.style.transition = 'transform 2.5s cubic-bezier(0.1, 0.8, 0.1, 1)';
        pointer.style.transform = `rotate(${totalSpins}deg)`;
        setTimeout(resolveUpgrade, 2600);
    }
}