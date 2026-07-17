let balance = parseFloat(localStorage.getItem('balance')) || 100.0;
let inventory = JSON.parse(localStorage.getItem('inventory')) || [];
let stats = JSON.parse(localStorage.getItem('stats')) || { upgradesTried: 0 };
let bestPulls = JSON.parse(localStorage.getItem('bestPulls')) || [];
let lastClickTime = 0;

window.onload = () => {
    // Notify Telegram the app is ready
    if (window.Telegram && window.Telegram.WebApp) { window.Telegram.WebApp.ready(); }
    populateTargetShop();
    updateUI();
};

function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
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
    
    // Update Dropdown Inventory
    const invSelect = document.getElementById('inventorySelect');
    invSelect.innerHTML = '<option value="">-- Select Item --</option>';
    
    const profileInv = document.getElementById('profileInventory');
    profileInv.innerHTML = '';
    
    inventory.forEach((item, index) => {
        // Dropdown
        let opt = document.createElement('option');
        opt.value = index;
        opt.innerText = `${item.name} (${item.value})`;
        invSelect.appendChild(opt);
        
        // Profile Grid
        let div = document.createElement('div');
        div.className = 'item-box';
        div.style.borderLeftColor = item.color;
        div.innerHTML = `<strong>${item.name}</strong><br>Value: ${item.value}`;
        profileInv.appendChild(div);
    });

    // Update Leaderboard
    const leaderList = document.getElementById('leaderboardList');
    leaderList.innerHTML = '';
    bestPulls.sort((a,b) => b.value - a.value).slice(0, 4).forEach(item => {
        let div = document.createElement('div');
        div.className = 'item-box';
        div.style.borderLeftColor = item.color;
        div.innerHTML = `<strong>${item.name}</strong><br>Value: ${item.value}`;
        leaderList.appendChild(div);
    });
}

function clickCoin() {
    const now = Date.now();
    if (now - lastClickTime >= 25) { 
        balance += 0.1;
        lastClickTime = now;
        document.getElementById('balanceDisplay').innerText = balance.toFixed(1);
        localStorage.setItem('balance', balance); // Save silently to avoid UI lag
    }
}

function buyCase() {
    if (balance < 10) return alert("Not enough u-coins!");
    balance -= 10;
    
    let base = baseItems[Math.floor(Math.random() * baseItems.length)];
    let rarity = rarities[3]; // Default Normal
    
    let rarityRoll = Math.floor(Math.random() * 100) + 1; 
    if (rarityRoll <= (100 / rarities[0].chance)) rarity = rarities[0];
    else if (rarityRoll <= (100 / rarities[1].chance)) rarity = rarities[1];
    else if (rarityRoll <= (100 / rarities[2].chance)) rarity = rarities[2];

    let shinyRoll = Math.floor(Math.random() * 1000) + 1;
    let isShiny = shinyRoll <= (1000 / shiny.chance);
    
    let finalValue = base.baseValue * rarity.multiplier * (isShiny ? shiny.multiplier : 1);
    let fullName = (isShiny ? "Shiny " : "") + rarity.name + " " + base.name;
    
    let newItem = { name: fullName, value: finalValue, color: rarity.color };
    inventory.push(newItem);
    bestPulls.push(newItem);
    
    saveGame();
    alert("You opened a case and got: " + fullName + "!");
}

function populateTargetShop() {
    const targetSelect = document.getElementById('targetSelect');
    targetSelect.innerHTML = '<option value="">-- Select Target --</option>';
    targetShopSkins.forEach((skin, index) => {
        let opt = document.createElement('option');
        opt.value = index;
        opt.innerText = `${skin.name} (${skin.value})`;
        targetSelect.appendChild(opt);
    });
}

function updateChance() {
    const invSelect = document.getElementById('inventorySelect').value;
    const targetSelect = document.getElementById('targetSelect').value;
    if (invSelect === "" || targetSelect === "") return;
    
    let chance = (inventory[invSelect].value / targetShopSkins[targetSelect].value) * 100;
    if (chance > 100) chance = 100;
    document.getElementById('chanceDisplay').innerText = chance.toFixed(2) + "%";
}

function attemptUpgrade() {
    const invIndex = document.getElementById('inventorySelect').value;
    const targetIndex = document.getElementById('targetSelect').value;
    
    if (invIndex === "" || targetIndex === "") return alert("Select both items first!");
    
    let wagerItem = inventory[invIndex];
    let targetItem = targetShopSkins[targetIndex];
    
    let chance = (wagerItem.value / targetItem.value) * 100;
    const isFast = document.getElementById('fastUpgrade').checked;
    
    stats.upgradesTried += 1;
    const btn = document.getElementById('upgradeBtn');
    
    function resolveUpgrade() {
        let roll = Math.random() * 100;
        inventory.splice(invIndex, 1); // Remove the wagered item
        
        if (roll <= chance) {
            inventory.push(targetItem);
            bestPulls.push(targetItem);
            alert("SUCCESS! You upgraded to: " + targetItem.name);
        } else {
            alert("CRASH! You lost your item.");
        }
        btn.innerText = "UPGRADE";
        btn.disabled = false;
        saveGame();
        updateChance();
    }
    
    if (isFast) {
        resolveUpgrade();
    } else {
        btn.innerText = "UPGRADING...";
        btn.disabled = true;
        setTimeout(resolveUpgrade, 1500); // 1.5 second fake suspense animation
    }
}