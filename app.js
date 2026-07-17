const tg = window.Telegram ? window.Telegram.WebApp : null;
if (tg) { tg.ready(); tg.expand(); } // Forces the app to stretch to the bottom of the screen

let state = {
    balance: 500.0,
    inventory: [],
    upgradesProcessed: 0,
    unlockedIds: {}
};

const SAVE_KEY = "sleek_sim_cloud_final";
let saveTimeout = null;

// ==========================================
// 1. CLOUD SAVE & DECOMPRESSION ENGINE
// ==========================================
function generateShortId() { return Date.now().toString(36) + Math.floor(Math.random() * 100).toString(36); }

function saveGame(instant = false) {
    if (instant) {
        if (saveTimeout) clearTimeout(saveTimeout);
        executeCloudSave();
        return;
    }
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => executeCloudSave(), 400); 
}

function executeCloudSave() {
    // Compress data to fit Telegram's 4KB string limit per key
    const compressedData = {
        b: state.balance,
        u: state.upgradesProcessed,
        un: state.unlockedIds,
        i: state.inventory.map(item => [item.id, item.instanceId]) 
    };

    const serialized = JSON.stringify(compressedData);
    if (tg && tg.CloudStorage) {
        tg.CloudStorage.setItem(SAVE_KEY, serialized, (err) => { if (err) console.error(err); });
    } else {
        localStorage.setItem(SAVE_KEY, serialized);
    }
}

function loadGame() {
    if (tg && tg.CloudStorage) {
        tg.CloudStorage.getItem(SAVE_KEY, (err, value) => {
            if (!err && value) decompressAndLoad(value);
            else decompressAndLoad(localStorage.getItem(SAVE_KEY));
        });
    } else {
        decompressAndLoad(localStorage.getItem(SAVE_KEY));
    }
}

function decompressAndLoad(savedStr) {
    if (savedStr) {
        try {
            const parsed = JSON.parse(savedStr);
            if (parsed.b !== undefined) { // New compressed format
                state.balance = parsed.b;
                state.upgradesProcessed = parsed.u || 0;
                state.unlockedIds = parsed.un || {};
                state.inventory = (parsed.i || []).map(compact => {
                    const baseItem = itemPool.find(x => x.id === compact[0]);
                    return baseItem ? { ...baseItem, instanceId: compact[1] } : null;
                }).filter(i => i !== null);
            } else { // Legacy format
                state.balance = parsed.balance || 500.0;
                state.inventory = parsed.inventory || [];
                state.upgradesProcessed = parsed.upgradesProcessed || 0;
            }
        } catch (e) { console.error("Corrupted save."); }
    }
    updateUIDisplays();
    renderInventory();
    renderUpgraderTrays();
}

function clearLegacyData() {
    state = { balance: 500.0, inventory: [], upgradesProcessed: 0, unlockedIds: {} };
    if (tg && tg.CloudStorage) tg.CloudStorage.removeItem(SAVE_KEY);
    localStorage.removeItem(SAVE_KEY);
    updateUIDisplays();
    renderInventory();
    renderUpgraderTrays();
}

// ==========================================
// 2. RENDERS & INTERFACES
// ==========================================
function switchTab(tabId) {
    document.querySelectorAll('.tab-trigger').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`btn-${tabId}`).classList.add('active');

    document.querySelectorAll('.tab-view').forEach(view => view.classList.remove('active-view'));
    document.getElementById(tabId).classList.add('active-view');

    if (tabId === 'profileTab') renderInventory();
    if (tabId === 'upgraderTab') renderUpgraderTrays();
}

function updateUIDisplays() {
    document.getElementById('balanceDisplay').textContent = state.balance.toFixed(1);
    document.getElementById('statUpgrades').textContent = state.upgradesProcessed;
    document.getElementById('statItemsCount').textContent = state.inventory.length;
}

function clickCoin() {
    state.balance += 1.0;
    updateUIDisplays();
    saveGame(false); 
}

// ==========================================
// 3. CASE UNBOXING SUBSYSTEM
// ==========================================
let activeCase = null;

function renderCaseMenu() {
    const grid = document.getElementById('caseMenuGrid');
    grid.innerHTML = '';
    casesData.forEach((box, index) => {
        const card = document.createElement('div');
        card.className = 'case-element-card';
        card.onclick = () => openInspectModal(index);
        card.innerHTML = `<div class="case-name">📦 ${box.name}</div><div class="case-cost">${box.cost} U</div>`;
        grid.appendChild(card);
    });
}

function openInspectModal(caseIndex) {
    activeCase = casesData[caseIndex];
    document.getElementById('inspectCaseName').textContent = activeCase.name;
    document.getElementById('totalCaseCostDisplay').textContent = activeCase.cost;
    
    const listPanel = document.getElementById('inspectItemsList');
    listPanel.innerHTML = '';
    activeCase.contents.forEach(row => {
        const rowEl = document.createElement('div');
        rowEl.className = 'list-row-entry';
        rowEl.innerHTML = `<span>${row.item.emoji} ${row.item.name}</span><span style="color:var(--text-muted)">${row.chance}%</span>`;
        listPanel.appendChild(rowEl);
    });
    document.getElementById('caseDetailsModal').style.display = 'flex';
}

function closeInspectModal() { document.getElementById('caseDetailsModal').style.display = 'none'; }

function confirmCasePurchase() {
    if (state.balance < activeCase.cost) return alert("Insufficient funds!");
    state.balance -= activeCase.cost;
    closeInspectModal();
    executeUnboxing(activeCase);
}

function executeUnboxing(box) {
    const unboxModal = document.getElementById('unboxingModal');
    const rollersWrapper = document.getElementById('multiRollersWrapper');
    const resultsContainer = document.getElementById('multiResultsContainer');
    const claimBtn = document.getElementById('modalClaimBtn');

    rollersWrapper.innerHTML = ''; resultsContainer.innerHTML = '';
    claimBtn.style.display = 'none'; unboxModal.style.display = 'flex';

    let roll = Math.random() * 100;
    let cumulative = 0;
    let selectedItem = box.contents[0].item;

    for (let entry of box.contents) {
        cumulative += entry.chance;
        if (roll <= cumulative) { selectedItem = entry.item; break; }
    }
    let reward = { ...selectedItem, instanceId: generateShortId() };

    const lane = document.createElement('div');
    lane.className = 'lane-viewport';
    lane.innerHTML = `<div class="lane-crosshair"></div><div id="conveyor-0" class="lane-conveyor"></div>`;
    rollersWrapper.appendChild(lane);

    const conveyor = document.getElementById(`conveyor-0`);
    for (let x = 0; x < 25; x++) {
        const randomItem = itemPool[Math.floor(Math.random() * itemPool.length)];
        const node = document.createElement('div');
        node.className = 'lane-box-node';
        node.textContent = x === 20 ? reward.emoji : randomItem.emoji;
        conveyor.appendChild(node);
    }

    setTimeout(() => {
        conveyor.style.transition = 'transform 2.5s cubic-bezier(0.1, 1, 0.1, 1)';
        conveyor.style.transform = 'translateX(-1200px)';
    }, 50);

    setTimeout(() => {
        state.inventory.push(reward);
        state.unlockedIds[reward.id] = true;
        
        const pill = document.createElement('div');
        pill.className = 'reward-pill';
        pill.textContent = reward.emoji;
        resultsContainer.appendChild(pill);

        saveGame(true);
        updateUIDisplays();
        claimBtn.style.display = 'block';
    }, 2600);
}

function closeUnboxModal() { document.getElementById('unboxingModal').style.display = 'none'; }

// ==========================================
// 4. THE ITEM UPGRADER ENGINE
// ==========================================
let wagerItem = null;
let targetItem = null;

function renderUpgraderTrays() {
    const wagerGrid = document.getElementById('wagerGrid');
    const targetGrid = document.getElementById('targetGrid');
    wagerGrid.innerHTML = ''; targetGrid.innerHTML = '';

    state.inventory.forEach(item => {
        const card = document.createElement('div');
        card.className = `item-capsule ${wagerItem && wagerItem.instanceId === item.instanceId ? 'selected' : ''}`;
        card.onclick = () => selectWager(item);
        card.innerHTML = `<span>${item.emoji} ${item.name.substring(0,8)}..</span><span class="cap-value">${item.value}</span>`;
        wagerGrid.appendChild(card);
    });

    itemPool.forEach(item => {
        const card = document.createElement('div');
        card.className = `item-capsule ${targetItem && targetItem.id === item.id ? 'selected' : ''}`;
        card.onclick = () => selectTarget(item);
        card.innerHTML = `<span>${item.emoji} ${item.name.substring(0,8)}..</span><span class="cap-value">${item.value}</span>`;
        targetGrid.appendChild(card);
    });

    calculateOdds();
}

function selectWager(item) {
    wagerItem = item;
    document.getElementById('stageWager').className = 'dock-slot active';
    document.getElementById('stageWager').innerHTML = `<span>Wager</span><strong>${item.emoji} ${item.value}U</strong>`;
    renderUpgraderTrays();
}

function selectTarget(item) {
    targetItem = item;
    document.getElementById('stageTarget').className = 'dock-slot active';
    document.getElementById('stageTarget').innerHTML = `<span>Target</span><strong>${item.emoji} ${item.value}U</strong>`;
    renderUpgraderTrays();
}

function calculateOdds() {
    const chanceDisplay = document.getElementById('chanceDisplay');
    const radar = document.getElementById('upgraderWheel');
    const rollBtn = document.getElementById('upgradeBtn');

    if (!wagerItem || !targetItem) {
        chanceDisplay.textContent = "0.00%"; radar.style.background = 'var(--bg-inner)'; rollBtn.disabled = true; return;
    }
    if (wagerItem.value >= targetItem.value) {
        chanceDisplay.textContent = "100.00%"; radar.style.background = 'var(--accent-green)'; rollBtn.disabled = false; return;
    }

    let odds = (wagerItem.value / targetItem.value) * 100;
    if (odds > 99.9) odds = 99.9;
    chanceDisplay.textContent = `${odds.toFixed(2)}%`;
    radar.style.background = `conic-gradient(var(--accent-green) 0% ${odds}%, var(--accent-red) ${odds}% 100%)`;
    rollBtn.disabled = false;
}

function applyPresetMultiplier(mult) {
    if (!wagerItem) return alert("Select wager first!");
    let targetVal = wagerItem.value * mult;
    let bestMatch = [...itemPool].sort((a,b) => Math.abs(a.value - targetVal) - Math.abs(b.value - targetVal))[0];
    if (bestMatch) selectTarget(bestMatch);
}

function applyPresetChance(targetChance) {
    if (!wagerItem) return alert("Select wager first!");
    let calculatedTargetValue = wagerItem.value / (targetChance / 100);
    let bestMatch = [...itemPool].sort((a,b) => Math.abs(a.value - calculatedTargetValue) - Math.abs(b.value - calculatedTargetValue))[0];
    if (bestMatch) selectTarget(bestMatch);
}

function attemptUpgrade() {
    if (!wagerItem || !targetItem) return;
    const fastMode = document.getElementById('fastUpgrade').checked;
    const rollBtn = document.getElementById('upgradeBtn');
    const needle = document.getElementById('wheelPointer');
    
    rollBtn.disabled = true;
    let odds = wagerItem.value >= targetItem.value ? 100 : (wagerItem.value / targetItem.value) * 100;
    let rollResult = Math.random() * 100;
    let isWin = rollResult <= odds;

    state.inventory = state.inventory.filter(i => i.instanceId !== wagerItem.instanceId);

    const spinDuration = fastMode ? 100 : 2000;
    const targetDegrees = 3600 + (rollResult * 3.6);

    if (!fastMode) {
        needle.style.transition = 'transform 2s cubic-bezier(0.1, 1, 0.2, 1)';
        needle.style.transform = `rotate(${targetDegrees}deg)`;
    }

    setTimeout(() => {
        if (isWin) {
            state.inventory.push({ ...targetItem, instanceId: generateShortId() });
            state.unlockedIds[targetItem.id] = true;
            alert(`SUCCESS! Obtained ${targetItem.emoji} ${targetItem.name}!`);
        } else { alert("UPGRADE FAILED! Asset vaporized."); }

        wagerItem = null; targetItem = null;
        needle.style.transition = 'none'; needle.style.transform = 'rotate(0deg)';
        
        state.upgradesProcessed++;
        saveGame(true); updateUIDisplays(); renderUpgraderTrays();
        
        document.getElementById('stageWager').className = 'dock-slot empty'; document.getElementById('stageWager').textContent = 'Select Wager';
        document.getElementById('stageTarget').className = 'dock-slot empty'; document.getElementById('stageTarget').textContent = 'Select Target';
    }, spinDuration);
}

// ==========================================
// 5. INVENTORY & ARCHIVE CATALOG SYSTEM
// ==========================================
function renderInventory() {
    const invGrid = document.getElementById('profileInventory');
    invGrid.innerHTML = '';

    if (state.inventory.length === 0) {
        invGrid.innerHTML = '<div style="grid-column: span 3; text-align:center; color:var(--text-muted); padding:20px; font-size:12px;">Backpack empty.</div>';
        return;
    }

    state.inventory.forEach(item => {
        const itemCard = document.createElement('div');
        itemCard.className = 'index-item-card unlocked';
        itemCard.innerHTML = `
            <div class="idx-emoji">${item.emoji}</div>
            <div style="font-size:9px; color:#fff; width:100%; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${item.name}</div>
            <div class="idx-val">${item.value} U</div>
            <button class="btn-sell-quick" onclick="sellItem('${item.instanceId}', ${item.value})">SELL</button>
        `;
        invGrid.appendChild(itemCard);
    });
}

function sellItem(instanceId, value) {
    state.inventory = state.inventory.filter(item => item.instanceId !== instanceId);
    state.balance += value;
    saveGame(true); updateUIDisplays(); renderInventory(); renderUpgraderTrays();
}

function openIndexModal() { renderIndex(); document.getElementById('itemIndexModal').style.display = 'flex'; }
function closeIndexModal() { document.getElementById('itemIndexModal').style.display = 'none'; }

function renderIndex() {
    const idxGrid = document.getElementById('indexGrid');
    idxGrid.innerHTML = '';
    itemPool.forEach(item => {
        const hasUnlocked = state.unlockedIds[item.id] === true;
        const card = document.createElement('div');
        card.className = `index-item-card ${hasUnlocked ? 'unlocked' : 'locked'}`;
        card.innerHTML = `<div class="idx-emoji">${hasUnlocked ? item.emoji : '❓'}</div>
            <div style="color:${hasUnlocked ? '#fff' : 'var(--text-muted)'}; font-size:9px; width:100%; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${hasUnlocked ? item.name : 'Locked'}</div>
            <div class="idx-val">${item.value} U</div>`;
        idxGrid.appendChild(card);
    });
}

window.onload = function() {
    loadGame();
    renderCaseMenu();
};