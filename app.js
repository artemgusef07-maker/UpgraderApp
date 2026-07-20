// ==========================================
// CENTRAL STATE & CONFIG
// ==========================================
let balance = parseFloat(localStorage.getItem('balance')) || 500.0;
let inventory = JSON.parse(localStorage.getItem('inventory')) || [];
let stats = JSON.parse(localStorage.getItem('stats')) || { upgradesTried: 0 };
let lastClickTime = 0;

let selectedWagerIndex = null;
let selectedTargetItem = null;

let isRolling = false;
let currentInspectCaseIndex = null;
let currentSelectedQuantity = 1;

// ==========================================
// INITIALIZATION
// ==========================================
window.onload = () => {
    if (window.Telegram && window.Telegram.WebApp) { window.Telegram.WebApp.ready(); }
    renderCaseMenu();
    updateUI();
};

// ==========================================
// CORE SYSTEM FUNCTIONS
// ==========================================
function saveGame() {
    localStorage.setItem('balance', balance);
    localStorage.setItem('inventory', JSON.stringify(inventory));
    localStorage.setItem('stats', JSON.stringify(stats));
    updateUI();
}

function clearLegacyData() {
    if (isRolling) {
        alert("You cannot reset while a roll is running!");
        return;
    }
    const confirmReset = confirm("Reset all progress? (Resets to 500.0)");
    if (!confirmReset) return;

    localStorage.clear();
    balance = 500.0; inventory = []; stats = { upgradesTried: 0 };
    selectedWagerIndex = null; selectedTargetItem = null;
    saveGame();
    renderCaseMenu();
    renderUpgraderGrids();
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

function switchTab(tabId) {
    if (isRolling) return;
    document.querySelectorAll('.tab-pane').forEach(el => el.classList.remove('active-tab'));
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    
    document.getElementById(tabId).classList.add('active-tab');
    document.getElementById('btn-' + tabId).classList.add('active');
    
    if (tabId === 'upgraderTab') renderUpgraderGrids();
}

// ==========================================
// CLICKER & CASE LOGIC
// ==========================================
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
                <span class="case-odds-preview">Click to Inspect</span>
            </div>
            <span class="case-price-tag">${box.cost} U</span>
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
        div.className = 'inspect-item-row';
        div.innerHTML = `
            <div class="inspect-item-left"><span>${row.item.emoji}</span><span class="inspect-item-price">${row.item.value} U</span></div>
            <span class="inspect-item-chance">${row.chance.toFixed(1)}%</span>
        `;
        listContainer.appendChild(div);
    });
    setUnboxQuantity(1);
    document.getElementById('caseDetailsModal').style.display = 'flex';
}

function closeInspectModal() { document.getElementById('caseDetailsModal').style.display = 'none'; }

function setUnboxQuantity(qty) {
    currentSelectedQuantity = qty;
    document.querySelectorAll('.qty-btn').forEach(btn => btn.classList.remove('active'));
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
    if (balance < totalCost) { alert("Insufficient funds!"); return; }

    closeInspectModal();
    isRolling = true;
    balance -= totalCost;

    let itemsWonList = [];
    for (let q = 0; q < currentSelectedQuantity; q++) itemsWonList.push(rollFromCase(targetCase));

    document.getElementById('rollerCaseTitle').innerText = `Opening ${currentSelectedQuantity}x ${targetCase.name}`;
    document.getElementById('multiResultsContainer').innerHTML = '';
    document.getElementById('modalClaimBtn').style.display = 'none';
    
    const tape = document.getElementById('rollerTape');
    tape.style.transition = 'none'; tape.style.transform = 'translateX(0px)'; tape.innerHTML = '';
    
    let finalKeyElement = itemsWonList[itemsWonList.length - 1];
    for(let i=0; i<35; i++) {
        let card = document.createElement('div');
        card.className = 'roller-card-item';
        let randomMockItem = (i === 28) ? finalKeyElement : itemPool[Math.floor(Math.random() * itemPool.length)];
        card.innerText = randomMockItem.emoji;
        tape.appendChild(card);
    }
    document.getElementById('unboxingModal').style.display = 'flex';

    setTimeout(() => {
        tape.style.transition = 'transform 2.8s cubic-bezier(0.1, 0.8, 0.1, 1)';
        tape.style.transform = 'translateX(-1960px)';
    }, 50);

    setTimeout(() => {
        const resultsGrid = document.getElementById('multiResultsContainer');
        resultsGrid.innerHTML = '';
        itemsWonList.forEach(item => {
            inventory.push(item);
            let resCard = document.createElement('div');
            resCard.className = 'bundle-result-card';
            resCard.innerHTML = `<div>${item.emoji}</div><div style="font-size:11px;color:#ffca28;font-weight:bold;">${item.value} U</div>`;
            resultsGrid.appendChild(resCard);
        });
        saveGame();
        document.getElementById('modalClaimBtn').style.display = 'block';
    }, 2950);
}

function closeUnboxModal() { document.getElementById('unboxingModal').style.display = 'none'; isRolling = false; }

// ==========================================
// UPGRADER & SELL LOGIC (FIXED)
// ==========================================
function sellItem(index, event) {
    if (isRolling) return;
    event.stopPropagation();
    
    balance += Math.floor(inventory[index].value * 0.7);
    inventory.splice(index, 1);
    
    if (selectedWagerIndex === index) {
        selectedWagerIndex = null;
        selectedTargetItem = null;
    } else if (selectedWagerIndex > index) {
        selectedWagerIndex--;
    }
    
    saveGame();
    updateUI();
    if(document.getElementById('upgraderTab').classList.contains('active-tab')) renderUpgraderGrids();
}

function renderUpgraderGrids() {
    if (selectedWagerIndex !== null && (selectedWagerIndex >= inventory.length || selectedWagerIndex < 0)) {
        selectedWagerIndex = null;
        selectedTargetItem = null;
    }
    
    const wagerGrid = document.getElementById('wagerGrid');
    wagerGrid.innerHTML = '';
    inventory.forEach((item, index) => {
        let card = document.createElement('div');
        card.className = `mini-item-card ${selectedWagerIndex === index ? 'selected' : ''}`;
        card.innerHTML = `<span class="mic-emoji">${item.emoji}</span><span class="mic-val">${item.value} U</span>`;
        card.onclick = () => {
            if (isRolling) return;
            selectedWagerIndex = index;
            selectedTargetItem = null;
            document.getElementById('stageWager').className = "dock-slot active";
            document.getElementById('stageWager').innerHTML = `<span>${item.emoji}</span><span>${item.value} U</span>`;
            document.getElementById('stageTarget').className = "dock-slot empty";
            document.getElementById('stageTarget').innerText = "Select Target";
            renderUpgraderGrids();
            updateChance();
        };
        wagerGrid.appendChild(card);
    });

    const targetGrid = document.getElementById('targetGrid');
    targetGrid.innerHTML = '';
    if (selectedWagerIndex === null) {
        targetGrid.innerHTML = '<div style="color:#6e6e82; padding:10px;">Select wager first!</div>';
        return;
    }

    const wagerItem = inventory[selectedWagerIndex];
    const validTargets = itemPool.filter(item => item.value > wagerItem.value);
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

function updateChance() {
    if (selectedWagerIndex === null || selectedTargetItem === null) {
        document.getElementById('chanceDisplay').innerText = "0.00%";
        document.getElementById('chanceDisplay').style.color = "#ff3b30"; // Neon Red
        document.getElementById('upgraderWheel').style.background = `#ff3b30`;
        return;
    }
    let chance = (inventory[selectedWagerIndex].value / selectedTargetItem.value) * 100;
    if (chance > 100) chance = 100;
    
    document.getElementById('chanceDisplay').innerText = chance.toFixed(2) + "%";
    document.getElementById('chanceDisplay').style.color = "#00fa9a"; // Neon Green
    
    let halfSlice = (chance * 3.6) / 2;
    let startGreen = 180 - halfSlice;
    let endGreen = 180 + halfSlice;
    
    document.getElementById('upgraderWheel').style.background = 
        `conic-gradient(#ff3b30 0deg ${startGreen}deg, #00fa9a ${startGreen}deg ${endGreen}deg, #ff3b30 ${endGreen}deg 360deg)`;
}

function applyPresetMultiplier(mult) {
    if (selectedWagerIndex === null) return alert("Select wager first!");
    findAndSelectClosestTarget(inventory[selectedWagerIndex].value * mult);
}

function applyPresetChance(chancePercent) {
    if (selectedWagerIndex === null) return alert("Select wager first!");
    findAndSelectClosestTarget(inventory[selectedWagerIndex].value / (chancePercent / 100));
}

function findAndSelectClosestTarget(targetValue) {
    const wagerItem = inventory[selectedWagerIndex];
    const validTargets = itemPool.filter(item => item.value > wagerItem.value);
    if(validTargets.length === 0) return;
    let closest = validTargets.reduce((prev, curr) => Math.abs(curr.value - targetValue) < Math.abs(prev.value - targetValue) ? curr : prev);
    selectedTargetItem = closest;
    document.getElementById('stageTarget').className = "dock-slot active";
    document.getElementById('stageTarget').innerHTML = `<span>${closest.emoji}</span><span>${closest.value} U</span>`;
    renderUpgraderGrids();
    updateChance();
}

function attemptUpgrade() {
    if (selectedWagerIndex === null || selectedTargetItem === null) return alert("Staging cards empty!");
    let chance = (inventory[selectedWagerIndex].value / selectedTargetItem.value) * 100;
    
    isRolling = true;
    stats.upgradesTried += 1;
    const isFast = document.getElementById('fastUpgrade').checked;
    const btn = document.getElementById('upgradeBtn');
    const pointer = document.getElementById('wheelPointer');
    
    pointer.style.transition = 'none'; 
    pointer.style.transform = 'rotate(0deg)'; 
    pointer.offsetHeight;
    
    let roll = Math.random() * 100;
    let isWin = roll <= chance;
    let halfSlice = (chance * 3.6) / 2;
    
    let targetDegree = isWin 
        ? ((180 - halfSlice) + (Math.random() * (halfSlice * 2))) 
        : (Math.random() > 0.5 ? (Math.random() * (180 - halfSlice)) : ((180 + halfSlice) + (Math.random() * (180 - halfSlice))));
    
    let totalSpins = 1800 + targetDegree;

    function resolveUpgrade() {
        if (selectedWagerIndex !== null && inventory[selectedWagerIndex]) {
            inventory.splice(selectedWagerIndex, 1);
        }
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
        saveGame(); 
        updateUI();
        renderUpgraderGrids(); 
        updateChance();
    }

    if (isFast) {
        resolveUpgrade();
    } else {
        btn.innerText = "ROLLING..."; 
        btn.disabled = true;
        pointer.style.transition = 'transform 3.8s cubic-bezier(0.1, 1, 0.1, 1)';
        pointer.style.transform = `rotate(${totalSpins}deg)`;
        setTimeout(resolveUpgrade, 3900);
    }
}