let balance = parseFloat(localStorage.getItem('balance')) || 500.0;
let inventory = JSON.parse(localStorage.getItem('inventory')) || [];
let stats = JSON.parse(localStorage.getItem('stats')) || { upgradesTried: 0 };
let lastClickTime = 0;

let selectedWagerIndex = null;
let selectedTargetItem = null;

window.onload = () => {
    if (window.Telegram && window.Telegram.WebApp) { window.Telegram.WebApp.ready(); }
    renderCaseMenu();
    updateUI();
};

function clearLegacyData() {
    localStorage.clear();
    balance = 500.0; inventory = []; stats = { upgradesTried: 0 };
    selectedWagerIndex = null; selectedTargetItem = null;
    saveGame();
    renderCaseMenu();
    renderUpgraderGrids();
}

function switchTab(tabId) {
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
        row.onclick = () => openCaseWithRoller(index);
        row.innerHTML = `
            <div class="case-details">
                <span class="case-title">📦 ${box.name}</span>
                <span class="case-odds-preview">${box.oddsText}</span>
            </div>
            <span class="case-price-tag">${box.cost} U</span>
        `;
        menu.appendChild(row);
    });
}

function openCaseWithRoller(caseIndex) {
    const targetCase = casesData[caseIndex];
    if (balance < targetCase.cost) return alert("Not enough U-Coins!");
    
    balance -= targetCase.cost;
    const itemWon = targetCase.rollLogic();
    
    document.getElementById('rollerCaseTitle').innerText = `Opening ${targetCase.name}`;
    document.getElementById('rollerResultCard').style.display = 'none';
    document.getElementById('modalClaimBtn').style.display = 'none';
    const tape = document.getElementById('rollerTape');
    tape.style.transition = 'none';
    tape.style.transform = 'translateX(0px)';
    tape.innerHTML = '';

    for(let i=0; i<35; i++) {
        let card = document.createElement('div');
        card.className = 'roller-card-item';
        let randomMockItem = (i === 28) ? itemWon : itemPool[Math.floor(Math.random() * itemPool.length)];
        card.innerText = randomMockItem.emoji;
        tape.appendChild(card);
    }

    document.getElementById('unboxingModal').style.display = 'flex';

    setTimeout(() => {
        tape.style.transition = 'transform 3.2s cubic-bezier(0.1, 0.8, 0.1, 1)';
        tape.style.transform = 'translateX(-1960px)';
    }, 50);

    setTimeout(() => {
        inventory.push(itemWon);
        saveGame();
        document.getElementById('resultEmoji').innerText = itemWon.emoji;
        document.getElementById('resultName').innerText = "Unboxed Item";
        document.getElementById('resultValue').innerText = `${itemWon.value} U`;
        document.getElementById('rollerResultCard').style.display = 'block';
        document.getElementById('modalClaimBtn').style.display = 'block';
    }, 3300);
}

function closeUnboxModal() {
    document.getElementById('unboxingModal').style.display = 'none';
}

function sellItem(index, event) {
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

/* Render Upgrader Grid - Blocks Items Cheaper or Equal to Wager */
function renderUpgraderGrids() {
    const wagerGrid = document.getElementById('wagerGrid');
    wagerGrid.innerHTML = '';
    inventory.forEach((item, index) => {
        let card = document.createElement('div');
        card.className = `mini-item-card ${selectedWagerIndex === index ? 'selected' : ''}`;
        card.innerHTML = `<span class="mic-emoji">${item.emoji}</span><span class="mic-val">${item.value} U</span>`;
        card.onclick = () => {
            selectedWagerIndex = index;
            selectedTargetItem = null; // Clear old target to force re-evaluation
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
        targetGrid.innerHTML = '<div style="color:#6e6e82; padding:10px;">Select a wager item first!</div>';
        return;
    }

    const wagerItem = inventory[selectedWagerIndex];
    // FORCE PROFIT: Filter so targets are strictly more expensive than the wager item
    const validTargets = itemPool.filter(item => item.value > wagerItem.value);

    if (validTargets.length === 0) {
        targetGrid.innerHTML = '<div style="color:#ff6b6b; padding:10px;">Max item tier reached!</div>';
        return;
    }

    validTargets.forEach((item) => {
        let isSelected = selectedTargetItem && selectedTargetItem.value === item.value && selectedTargetItem.emoji === item.emoji;
        let card = document.createElement('div');
        card.className = `mini-item-card ${isSelected ? 'selected' : ''}`;
        card.innerHTML = `<span class="mic-emoji">${item.emoji}</span><span class="mic-val">${item.value} U</span>`;
        card.onclick = () => {
            selectedTargetItem = item;
            document.getElementById('stageTarget').className = "dock-slot active";
            document.getElementById('stageTarget').innerHTML = `<span>${item.emoji}</span><span>${item.value} U</span>`;
            renderUpgraderGrids();
            updateChance();
        };
        targetGrid.appendChild(card);
    });
}

/* Custom Case-Battle Preset Processing Logics */
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
    // Filter only items that are more expensive than our item
    const validTargets = itemPool.filter(item => item.value > wagerItem.value);
    if(validTargets.length === 0) return;

    // Find the closest item to the calculated ideal match point
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