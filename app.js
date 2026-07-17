let balance = parseFloat(localStorage.getItem('balance')) || 100.0;
let inventory = JSON.parse(localStorage.getItem('inventory')) || [];
let stats = JSON.parse(localStorage.getItem('stats')) || { upgradesTried: 0 };
let bestPulls = JSON.parse(localStorage.getItem('bestPulls')) || [];
let lastClickTime = 0;

let selectedWagerIndex = null;
let selectedTargetIndex = null;

window.onload = () => {
    if (window.Telegram && window.Telegram.WebApp) { window.Telegram.WebApp.ready(); }
    renderCaseMenu();
    updateUI();
};

function clearLegacyData() {
    localStorage.clear();
    balance = 100.0; inventory = []; stats = { upgradesTried: 0 }; bestPulls = [];
    selectedWagerIndex = null; selectedTargetIndex = null;
    saveGame();
    renderCaseMenu();
    renderUpgraderGrids();
}

function switchTab(tabId) {
    document.querySelectorAll('.tab-pane').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    document.getElementById('btn-' + tabId).classList.add('active');
    if (tabId === 'upgraderTab') renderUpgraderGrids();
}

function saveGame() {
    localStorage.setItem('balance', balance);
    localStorage.setItem('inventory', JSON.stringify(inventory));
    localStorage.setItem('stats', JSON.stringify(stats));
    localStorage.setItem('bestPulls', JSON.stringify(bestPulls));
    updateUI();
}

function updateUI() {
    document.getElementById('balanceDisplay').innerText = balance.toFixed(1);
    document.getElementById('statUpgrades').innerText = stats.upgradesTried;
    document.getElementById('statItemsCount').innerText = inventory.length;

    // Render Inventory Tab Shelf
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

    // Render Best Drops Shelf
    const leaderList = document.getElementById('leaderboardList');
    leaderList.innerHTML = '';
    [...bestPulls].sort((a,b) => b.value - a.value).slice(0, 6).forEach(item => {
        let card = document.createElement('div');
        card.className = 'mini-item-card';
        card.innerHTML = `<span class="mic-emoji">${item.emoji}</span><span class="mic-val">${item.value} U</span>`;
        leaderList.appendChild(card);
    });
}

function clickCoin() {
    const now = Date.now();
    if (now - lastClickTime >= 25) {
        balance += 0.1;
        lastClickTime = now;
        document.getElementById('balanceDisplay').innerText = balance.toFixed(1);
        localStorage.setItem('balance', balance);
    }
}

/* Render the clean Case Selection Menu below the Tap button */
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

/* Ultra Smooth Horizontal Tape Roller Unboxing Animation Engine */
function openCaseWithRoller(caseIndex) {
    const targetCase = casesData[caseIndex];
    if (balance < targetCase.cost) return alert("Insufficient U-Coins!");
    
    balance -= targetCase.cost;
    const itemWon = targetCase.rollLogic();
    
    // UI Elements Reset
    document.getElementById('rollerCaseTitle').innerText = `Opening ${targetCase.name}`;
    document.getElementById('rollerResultCard').style.display = 'none';
    document.getElementById('modalClaimBtn').style.display = 'none';
    const tape = document.getElementById('rollerTape');
    tape.style.transition = 'none';
    tape.style.transform = 'translateX(0px)';
    tape.innerHTML = '';

    // Generate 35 dummy boxes to populate visual sliding path stream
    for(let i=0; i<35; i++) {
        let card = document.createElement('div');
        card.className = 'roller-card-item';
        // Place item won at index position 28 exactly
        let randomMockItem = (i === 28) ? itemWon : itemPool[Math.floor(Math.random() * itemPool.length)];
        card.innerText = randomMockItem.emoji;
        tape.appendChild(card);
    }

    document.getElementById('unboxingModal').style.display = 'flex';

    // Drive calculation dynamics
    setTimeout(() => {
        tape.style.transition = 'transform 3.5s cubic-bezier(0.1, 0.8, 0.1, 1)';
        // 28 items * 70px cell pacing metric (60px card dimension + 10px spacing buffer layout block)
        tape.style.transform = 'translateX(-1960px)';
    }, 50);

    // Stop execution wrap state reveal
    setTimeout(() => {
        inventory.push(itemWon);
        bestPulls.push(itemWon);
        saveGame();

        document.getElementById('resultEmoji').innerText = itemWon.emoji;
        document.getElementById('resultName').innerText = "Acquired Item";
        document.getElementById('resultValue').innerText = `${itemWon.value} U-Coins`;
        document.getElementById('rollerResultCard').style.display = 'block';
        document.getElementById('modalClaimBtn').style.display = 'block';
    }, 3600);
}

function closeUnboxModal() {
    document.getElementById('unboxingModal').style.display = 'none';
}

function sellItem(index, event) {
    event.stopPropagation();
    balance += Math.floor(inventory[index].value * 0.7);
    inventory.splice(index, 1);
    if(selectedWagerIndex === index) selectedWagerIndex = null;
    saveGame();
    if(document.getElementById('upgraderTab').classList.contains('active')) renderUpgraderGrids();
}

function renderUpgraderGrids() {
    const wagerGrid = document.getElementById('wagerGrid');
    wagerGrid.innerHTML = '';
    inventory.forEach((item, index) => {
        let card = document.createElement('div');
        card.className = `mini-item-card ${selectedWagerIndex === index ? 'selected' : ''}`;
        card.innerHTML = `<span class="mic-emoji">${item.emoji}</span><span class="mic-val">${item.value} U</span>`;
        card.onclick = () => {
            selectedWagerIndex = index;
            document.getElementById('stageWager').className = "dock-slot active";
            document.getElementById('stageWager').innerHTML = `<span style="font-size:20px">${item.emoji}</span><span>${item.value} U</span>`;
            renderUpgraderGrids();
            updateChance();
        };
        wagerGrid.appendChild(card);
    });

    const targetGrid = document.getElementById('targetGrid');
    targetGrid.innerHTML = '';
    targetShopSkins.forEach((item, index) => {
        let card = document.createElement('div');
        card.className = `mini-item-card ${selectedTargetIndex === index ? 'selected' : ''}`;
        card.innerHTML = `<span class="mic-emoji">${item.emoji}</span><span class="mic-val">${item.value} U</span>`;
        card.onclick = () => {
            selectedTargetIndex = index;
            document.getElementById('stageTarget').className = "dock-slot active";
            document.getElementById('stageTarget').innerHTML = `<span style="font-size:20px">${item.emoji}</span><span>${item.value} U</span>`;
            renderUpgraderGrids();
            updateChance();
        };
        targetGrid.appendChild(card);
    });
}

function updateChance() {
    if (selectedWagerIndex === null || selectedTargetIndex === null) {
        document.getElementById('chanceDisplay').innerText = "0.00%";
        document.getElementById('upgraderWheel').style.background = `#e74c3c`;
        return;
    }
    let chance = (inventory[selectedWagerIndex].value / targetShopSkins[selectedTargetIndex].value) * 100;
    if (chance > 100) chance = 100;
    document.getElementById('chanceDisplay').innerText = chance.toFixed(2) + "%";
    
    let halfSlice = (chance * 3.6) / 2;
    let startGreen = 180 - halfSlice;
    let endGreen = 180 + halfSlice;
    document.getElementById('upgraderWheel').style.background = `conic-gradient(#e74c3c 0deg ${startGreen}deg, #34c759 ${startGreen}deg ${endGreen}deg, #e74c3c ${endGreen}deg 360deg)`;
}

function attemptUpgrade() {
    if (selectedWagerIndex === null || selectedTargetIndex === null) return alert("Select staged items!");
    let chance = (inventory[selectedWagerIndex].value / targetShopSkins[selectedTargetIndex].value) * 100;
    if (chance > 100) chance = 100;
    
    stats.upgradesTried += 1;
    const isFast = document.getElementById('fastUpgrade').checked;
    const btn = document.getElementById('upgradeBtn');
    const pointer = document.getElementById('wheelPointer');
    
    pointer.style.transition = 'none'; pointer.style.transform = 'rotate(0deg)'; pointer.offsetHeight;
    
    let roll = Math.random() * 100;
    let isWin = roll <= chance;
    let halfSlice = (chance * 3.6) / 2;
    let targetDegree = isWin ? ((180 - halfSlice) + (Math.random() * (halfSlice * 2))) : (Math.random() > 0.5 ? (Math.random() * (180 - halfSlice)) : ((180 + halfSlice) + (Math.random() * (180 - halfSlice))));
    let totalSpins = 2160 + targetDegree;

    function resolveUpgrade() {
        let wagerItem = inventory[selectedWagerIndex];
        let targetItem = targetShopSkins[selectedTargetIndex];
        inventory.splice(selectedWagerIndex, 1);
        
        if (isWin) {
            inventory.push(targetItem); bestPulls.push(targetItem);
            alert(`🎉 upgraded successfully to ${targetItem.emoji}!`);
        } else {
            alert("💥 Upgrade crashed!");
        }
        selectedWagerIndex = null;
        document.getElementById('stageWager').className = "dock-slot empty";
        document.getElementById('stageWager').innerText = "Select Wager";
        btn.innerText = "START UPGRADE"; btn.disabled = false;
        saveGame(); renderUpgraderGrids(); updateChance();
    }

    if (isFast) resolveUpgrade();
    else {
        btn.innerText = "COMPUTING..."; btn.disabled = true;
        pointer.style.transition = 'transform 4s cubic-bezier(0.1, 0.8, 0.1, 1)';
        pointer.style.transform = `rotate(${totalSpins}deg)`;
        setTimeout(resolveUpgrade, 4100);
    }
}