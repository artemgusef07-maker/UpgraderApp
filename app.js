let balance = parseFloat(localStorage.getItem('balance')) || 100.0;
let inventory = JSON.parse(localStorage.getItem('inventory')) || [];
let stats = JSON.parse(localStorage.getItem('stats')) || { upgradesTried: 0 };
let bestPulls = JSON.parse(localStorage.getItem('bestPulls')) || [];
let lastClickTime = 0;

// Track what the user has currently tapped on in the grid
let selectedWagerIndex = null;
let selectedTargetIndex = null;

window.onload = () => {
    if (window.Telegram && window.Telegram.WebApp) { window.Telegram.WebApp.ready(); }
    renderUpgraderGrids();
    updateUI();
};

function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav button').forEach(el => el.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    document.getElementById('btn-' + tabId).classList.add('active');
    
    if(tabId === 'upgraderTab') {
        renderUpgraderGrids();
    }
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
    
    // Render Inventory Tab
    const profileInv = document.getElementById('profileInventory');
    profileInv.innerHTML = '';
    inventory.forEach((item, index) => {
        let card = document.createElement('div');
        card.className = 'item-card';
        card.style.borderColor = item.color;
        card.innerHTML = `
            <span class="emoji">${item.name.split(' ')[1] || '👾'}</span>
            <span class="name" style="color:${item.color}">${item.name}</span>
            <span class="price">${item.value} U</span>
            <button class="sell-btn" onclick="sellItem(${index}, event)">Sell for ${(item.value * 0.7).toFixed(0)} U</button>
        `;
        profileInv.appendChild(card);
    });

    // Render Local Leaderboard
    const leaderList = document.getElementById('leaderboardList');
    leaderList.innerHTML = '';
    [...bestPulls].sort((a,b) => b.value - a.value).slice(0, 4).forEach(item => {
        let card = document.createElement('div');
        card.className = 'item-card';
        card.style.borderColor = item.color;
        card.innerHTML = `
            <span class="emoji">${item.name.split(' ')[1] || '👾'}</span>
            <span class="name">${item.name}</span>
            <span class="price">${item.value} U</span>
        `;
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

function buyCase() {
    if (balance < 10) return alert("You don't have enough U-Coins!");
    balance -= 10;
    
    let base = baseItems[Math.floor(Math.random() * baseItems.length)];
    let rarity = rarities[3]; // Normal
    
    let rarityRoll = Math.random() * 100;
    if (rarityRoll <= 1.0) rarity = rarities[0]; // 1:100 Diamond
    else if (rarityRoll <= 4.0) rarity = rarities[1]; // 1:25 Gold
    else if (rarityRoll <= 20.0) rarity = rarities[2]; // 1:5 Silver

    let shinyRoll = Math.floor(Math.random() * 1000) + 1;
    let isShiny = (shinyRoll === 777);
    
    let finalValue = base.baseValue * rarity.multiplier * (isShiny ? shiny.multiplier : 1);
    let fullName = (isShiny ? "✨ Shiny " : "") + rarity.name + " " + base.name;
    
    let newItem = { name: fullName, value: finalValue, color: isShiny ? shiny.color : rarity.color };
    inventory.push(newItem);
    bestPulls.push(newItem);
    
    saveGame();
    alert(`Opened Capsule: ${fullName}!`);
}

function sellItem(index, event) {
    event.stopPropagation(); // Stops clicking the card backdrop
    let item = inventory[index];
    let payout = Math.floor(item.value * 0.7); // 70% buyback value rule
    balance += payout;
    inventory.splice(index, 1);
    
    // Clear selections if the sold item was staged
    if(selectedWagerIndex === index) selectedWagerIndex = null;
    
    saveGame();
    renderUpgraderGrids();
}

function renderUpgraderGrids() {
    // 1. Wager Inventory Selection
    const wagerGrid = document.getElementById('wagerGrid');
    wagerGrid.innerHTML = '';
    if(inventory.length === 0) wagerGrid.innerHTML = '<p style="grid-column:1/-1; color:#666;">Your inventory is empty.</p>';
    
    inventory.forEach((item, index) => {
        let card = document.createElement('div');
        card.className = `item-card ${selectedWagerIndex === index ? 'selected' : ''}`;
        card.style.borderColor = item.color;
        card.innerHTML = `
            <span class="emoji">${item.name.split(' ')[1] || '👾'}</span>
            <span class="name">${item.name}</span>
            <span class="price">${item.value} U</span>
        `;
        card.onclick = () => {
            selectedWagerIndex = index;
            renderUpgraderGrids();
            updateChance();
        };
        wagerGrid.appendChild(card);
    });

    // 2. Target Shop Showroom Selection
    const targetGrid = document.getElementById('targetGrid');
    targetGrid.innerHTML = '';
    targetShopSkins.forEach((item, index) => {
        let card = document.createElement('div');
        card.className = `item-card ${selectedTargetIndex === index ? 'selected' : ''}`;
        card.style.borderColor = item.color;
        card.innerHTML = `
            <span class="emoji">${item.name.split(' ')[1] || '👾'}</span>
            <span class="name">${item.name}</span>
            <span class="price">${item.value} U</span>
        `;
        card.onclick = () => {
            selectedTargetIndex = index;
            renderUpgraderGrids();
            updateChance();
        };
        targetGrid.appendChild(card);
    });
}

function updateChance() {
    if (selectedWagerIndex === null || selectedTargetIndex === null) {
        document.getElementById('chanceDisplay').innerText = "0.00%";
        document.getElementById('upgraderWheel').style.background = `conic-gradient(#e74c3c 0deg 360deg)`;
        return;
    }
    
    let wagerItem = inventory[selectedWagerIndex];
    let targetItem = targetShopSkins[selectedTargetIndex];
    
    let chance = (wagerItem.value / targetItem.value) * 100;
    if (chance > 100) chance = 100;
    
    document.getElementById('chanceDisplay').innerText = chance.toFixed(2) + "%";
    
    // Centering the win zone (green) exactly at the bottom (180 degrees)
    let halfSlice = (chance * 3.6) / 2;
    let startGreen = 180 - halfSlice;
    let endGreen = 180 + halfSlice;
    
    document.getElementById('upgraderWheel').style.background = `
        conic-gradient(
            #e74c3c 0deg ${startGreen}deg,
            #34c759 ${startGreen}deg ${endGreen}deg,
            #e74c3c ${endGreen}deg 360deg
        )
    `;
    
    const pointer = document.getElementById('wheelPointer');
    pointer.style.transition = 'none';
    pointer.style.transform = 'rotate(0deg)';
}

function attemptUpgrade() {
    if (selectedWagerIndex === null || selectedTargetIndex === null) return alert("Select your item and a target prize first!");
    
    let wagerItem = inventory[selectedWagerIndex];
    let targetItem = targetShopSkins[selectedTargetIndex];
    
    let chance = (wagerItem.value / targetItem.value) * 100;
    if (chance > 100) chance = 100;
    
    const isFast = document.getElementById('fastUpgrade').checked;
    stats.upgradesTried += 1;
    
    const btn = document.getElementById('upgradeBtn');
    const pointer = document.getElementById('wheelPointer');
    
    pointer.style.transition = 'none';
    pointer.style.transform = 'rotate(0deg)';
    pointer.offsetHeight; // force paint update
    
    // Core upgrade system logic
    let roll = Math.random() * 100;
    let halfSlice = (chance * 3.6) / 2;
    let targetDegree = 0;
    let isWin = roll <= chance;
    
    if (isWin) {
        // Safe land inside bottom green wedge: anywhere between (180 - halfSlice) and (180 + halfSlice)
        targetDegree = (180 - halfSlice) + (Math.random() * (halfSlice * 2));
    } else {
        // Land inside red wedges
        let leftRed = 180 - halfSlice;
        let rightRed = 360 - (180 + halfSlice);
        if (Math.random() > 0.5) {
            targetDegree = Math.random() * leftRed;
        } else {
            targetDegree = (180 + halfSlice) + (Math.random() * rightRed);
        }
    }
    
    let totalSpins = 2160 + targetDegree; // 6 crisp, full background rotations for suspense
    
    function resolveUpgrade() {
        inventory.splice(selectedWagerIndex, 1);
        
        if (isWin) {
            inventory.push(targetItem);
            bestPulls.push(targetItem);
            alert(`🔥 SUCCESS! You won: ${targetItem.name}`);
        } else {
            alert("💥 CRASH... Your item was destroyed.");
        }
        
        selectedWagerIndex = null; 
        btn.innerText = "START UPGRADE";
        btn.disabled = false;
        saveGame();
        renderUpgraderGrids();
        updateChance();
    }
    
    if (isFast) {
        resolveUpgrade();
    } else {
        btn.innerText = "UPGRADING...";
        btn.disabled = true;
        pointer.style.transition = 'transform 4s cubic-bezier(0.15, 0.85, 0.2, 1)';
        pointer.style.transform = `rotate(${totalSpins}deg)`;
        setTimeout(resolveUpgrade, 4100);
    }
}