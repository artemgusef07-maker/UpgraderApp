let balance = parseFloat(localStorage.getItem('balance')) || 100.0;
let inventory = JSON.parse(localStorage.getItem('inventory')) || [];
let stats = JSON.parse(localStorage.getItem('stats')) || { upgradesTried: 0 };
let bestPulls = JSON.parse(localStorage.getItem('bestPulls')) || [];
let lastClickTime = 0;

let selectedWagerIndex = null;
let selectedTargetIndex = null;

window.onload = () => {
    if (window.Telegram && window.Telegram.WebApp) { window.Telegram.WebApp.ready(); }
    // Clean migration engine for old users
    inventory = inventory.filter(item => item && item.name);
    renderUpgraderGrids();
    updateUI();
};

function clearLegacyData() {
    localStorage.clear();
    balance = 100.0;
    inventory = [];
    stats = { upgradesTried: 0 };
    bestPulls = [];
    selectedWagerIndex = null;
    selectedTargetIndex = null;
    saveGame();
    renderUpgraderGrids();
    alert("Cache wiped successfully! Old inventory bugs fixed.");
}

function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.dock-item').forEach(el => el.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    document.getElementById('btn-' + tabId).classList.add('active');
    
    if(tabId === 'upgraderTab') { renderUpgraderGrids(); }
}

function saveGame() {
    localStorage.setItem('balance', balance);
    localStorage.setItem('inventory', JSON.stringify(inventory));
    localStorage.setItem('stats', JSON.stringify(stats));
    localStorage.setItem('bestPulls', JSON.stringify(bestPulls));
    updateUI();
}

function parseEmoji(fullName) {
    // Intelligently filter out item emojis without crashing on old strings
    const match = fullName.match(/[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{1F600}-\u{1F64F}]/u);
    return match ? match[0] : "📦";
}

function updateUI() {
    document.getElementById('balanceDisplay').innerText = balance.toFixed(1);
    document.getElementById('statUpgrades').innerText = stats.upgradesTried;
    document.getElementById('statItemsCount').innerText = inventory.length;
    
    // Inventory Display Panel
    const profileInv = document.getElementById('profileInventory');
    profileInv.innerHTML = '';
    inventory.forEach((item, index) => {
        let card = document.createElement('div');
        card.className = 'item-card';
        card.style.borderColor = item.color;
        card.innerHTML = `
            <span class="emoji">${parseEmoji(item.name)}</span>
            <span class="price">${item.value} U</span>
            <button class="mini-sell-anchor" onclick="sellItem(${index}, event)">SELL (${Math.floor(item.value * 0.7)})</button>
        `;
        profileInv.appendChild(card);
    });

    // Leaderboard/Best Drops Display Panel
    const leaderList = document.getElementById('leaderboardList');
    leaderList.innerHTML = '';
    [...bestPulls].sort((a,b) => b.value - a.value).slice(0, 6).forEach(item => {
        let card = document.createElement('div');
        card.className = 'item-card';
        card.style.borderColor = item.color;
        card.innerHTML = `
            <span class="emoji">${parseEmoji(item.name)}</span>
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
    if (balance < 10) {
        showVisualModal("DECLINED", "❌", "Insufficient Funds", "Need 10 U-Coins", "#ff3b30");
        return;
    }
    balance -= 10;
    
    let base = baseItems[Math.floor(Math.random() * baseItems.length)];
    let rarity = rarities[3]; // Normal default
    
    let rarityRoll = Math.random() * 100;
    if (rarityRoll <= 1.0) rarity = rarities[0];       // Diamond (1%)
    else if (rarityRoll <= 5.0) rarity = rarities[1];  // Gold (4%)
    else if (rarityRoll <= 25.0) rarity = rarities[2]; // Silver (20%)

    let shinyRoll = Math.floor(Math.random() * 1000) + 1;
    let isShiny = (shinyRoll === 777); // 1:1000
    
    let finalValue = base.baseValue * rarity.multiplier * (isShiny ? shiny.multiplier : 1);
    let fullName = (isShiny ? "✨ Shiny " : "") + rarity.name + " " + base.name;
    
    let newItem = { name: fullName, value: finalValue, color: isShiny ? shiny.color : rarity.color };
    inventory.push(newItem);
    bestPulls.push(newItem);
    
    saveGame();
    showVisualModal("UNBOXED", parseEmoji(base.name), fullName, `${finalValue} U-Coins`, newItem.color);
}

function sellItem(index, event) {
    event.stopPropagation();
    balance += Math.floor(inventory[index].value * 0.7);
    inventory.splice(index, 1);
    if(selectedWagerIndex === index) selectedWagerIndex = null;
    saveGame();
    renderUpgraderGrids();
}

function renderUpgraderGrids() {
    const wagerGrid = document.getElementById('wagerGrid');
    wagerGrid.innerHTML = '';
    
    inventory.forEach((item, index) => {
        let card = document.createElement('div');
        card.className = `item-card ${selectedWagerIndex === index ? 'selected' : ''}`;
        card.style.borderColor = item.color;
        card.innerHTML = `
            <span class="emoji">${parseEmoji(item.name)}</span>
            <span class="price">${item.value} U</span>
        `;
        card.onclick = () => {
            selectedWagerIndex = index;
            document.getElementById('stageWager').className = "staged-slot active";
            document.getElementById('stageWager').innerHTML = `<span style="font-size:20px">${parseEmoji(item.name)}</span><span>${item.value} U</span>`;
            renderUpgraderGrids();
            updateChance();
        };
        wagerGrid.appendChild(card);
    });

    const targetGrid = document.getElementById('targetGrid');
    targetGrid.innerHTML = '';
    targetShopSkins.forEach((item, index) => {
        let card = document.createElement('div');
        card.className = `item-card ${selectedTargetIndex === index ? 'selected' : ''}`;
        card.style.borderColor = item.color;
        card.innerHTML = `
            <span class="emoji">${parseEmoji(item.name)}</span>
            <span class="price">${item.value} U</span>
        `;
        card.onclick = () => {
            selectedTargetIndex = index;
            document.getElementById('stageTarget').className = "staged-slot active";
            document.getElementById('stageTarget').innerHTML = `<span style="font-size:20px">${parseEmoji(item.name)}</span><span>${item.value} U</span>`;
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
    
    let chance = (inventory[selectedWagerIndex].value / targetShopSkins[selectedTargetIndex].value) * 100;
    if (chance > 100) chance = 100;
    
    document.getElementById('chanceDisplay').innerText = chance.toFixed(2) + "%";
    
    let halfSlice = (chance * 3.6) / 2;
    let startGreen = 180 - halfSlice;
    let endGreen = 180 + halfSlice;
    
    document.getElementById('upgraderWheel').style.background = `
        conic-gradient(#e74c3c 0deg ${startGreen}deg, #34c759 ${startGreen}deg ${endGreen}deg, #e74c3c ${endGreen}deg 360deg)
    `;
    
    const pointer = document.getElementById('wheelPointer');
    pointer.style.transition = 'none';
    pointer.style.transform = 'rotate(0deg)';
}

function attemptUpgrade() {
    if (selectedWagerIndex === null || selectedTargetIndex === null) return;
    
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
    pointer.offsetHeight;
    
    let roll = Math.random() * 100;
    let halfSlice = (chance * 3.6) / 2;
    let targetDegree = 0;
    let isWin = roll <= chance;
    
    if (isWin) {
        targetDegree = (180 - halfSlice) + (Math.random() * (halfSlice * 2));
    } else {
        let leftRed = 180 - halfSlice;
        let rightRed = 360 - (180 + halfSlice);
        targetDegree = Math.random() > 0.5 ? (Math.random() * leftRed) : ((180 + halfSlice) + (Math.random() * rightRed));
    }
    
    let totalSpins = 2160 + targetDegree;
    
    function resolveUpgrade() {
        inventory.splice(selectedWagerIndex, 1);
        
        if (isWin) {
            inventory.push(targetItem);
            bestPulls.push(targetItem);
            showVisualModal("UPGRADED", parseEmoji(targetItem.name), targetItem.name, `${targetItem.value} U-Coins`, '#34c759');
        } else {
            showVisualModal("CRASHED", "💥", "Upgrade Failed", "Staged item destroyed", '#ff3b30');
        }
        
        selectedWagerIndex = null;
        document.getElementById('stageWager').className = "staged-slot empty";
        document.getElementById('stageWager').innerText = "Select Wager";
        btn.innerText = "🚀 COMMENCE UPGRADE";
        btn.disabled = false;
        saveGame();
        renderUpgraderGrids();
        updateChance();
    }
    
    if (isFast) {
        resolveUpgrade();
    } else {
        btn.innerText = "COMPUTING MATRIX...";
        btn.disabled = true;
        pointer.style.transition = 'transform 4s cubic-bezier(0.1, 0.8, 0.1, 1)';
        pointer.style.transform = `rotate(${totalSpins}deg)`;
        setTimeout(resolveUpgrade, 4100);
    }
}

/* Modal UI Control Core */
function showVisualModal(header, emoji, title, sub, themeColor) {
    const banner = document.getElementById('modalBanner');
    banner.innerText = header;
    banner.style.color = themeColor;
    document.getElementById('modalEmoji').innerText = emoji;
    document.getElementById('modalItemName').innerText = title;
    document.getElementById('modalValue').innerText = sub;
    document.getElementById('resultModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('resultModal').style.display = 'none';
}