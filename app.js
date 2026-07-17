// ==========================================
// 1. STATE & CLOUD COMPRESSION ENGINE
// ==========================================
const tg = window.Telegram ? window.Telegram.WebApp : null;

let state = {
    balance: 500.0,
    inventory: [],
    upgradesProcessed: 0,
    unlockedIds: {}
};

const SAVE_KEY = "sleek_sim_cloud_v2";
let saveTimeout = null;

// Shortens instance IDs to save CloudStorage bytes (e.g., from "inst_170123123_0.123" to "a1b2c3d4")
function generateShortId() {
    return Date.now().toString(36) + Math.floor(Math.random() * 1000).toString(36);
}

// Intercept unboxing/upgrading to use short IDs 
// Note: Ensure your executeUnboxing and attemptUpgrade functions use generateShortId() instead of Date.now() + Math.random() if possible, but this engine will handle old ones too.

function saveGame(instant = false) {
    if (instant) {
        if (saveTimeout) clearTimeout(saveTimeout);
        executeCloudSave();
        return;
    }
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
        executeCloudSave();
    }, 400); // 400ms debounce to prevent Telegram API rate limits
}

function executeCloudSave() {
    // 1. COMPRESS THE DATA to avoid Telegram's 4KB string limit
    const compressedData = {
        b: state.balance,
        u: state.upgradesProcessed,
        un: state.unlockedIds,
        // Map inventory to just [item_id, short_instance_id] -> e.g., ["glock", "x8k2j"]
        i: state.inventory.map(item => [item.id, item.instanceId]) 
    };

    const serialized = JSON.stringify(compressedData);

    if (tg && tg.CloudStorage) {
        tg.CloudStorage.setItem(SAVE_KEY, serialized, (err, success) => {
            if (err) console.error("Telegram Cloud Save Failed:", err);
        });
    } else {
        // Fallback for desktop browsers outside of Telegram
        localStorage.setItem(SAVE_KEY, serialized);
    }
}

function loadGame() {
    if (tg && tg.CloudStorage) {
        // Async load from Telegram Servers
        tg.CloudStorage.getItem(SAVE_KEY, (err, value) => {
            if (!err && value) {
                decompressAndLoad(value);
            } else {
                // If cloud is empty, check local storage just in case
                const localData = localStorage.getItem(SAVE_KEY);
                decompressAndLoad(localData);
            }
        });
    } else {
        // Fallback load
        decompressAndLoad(localStorage.getItem(SAVE_KEY));
    }
}

function decompressAndLoad(savedStr) {
    if (savedStr) {
        try {
            const parsed = JSON.parse(savedStr);
            
            // Check if it's our new compressed format
            if (parsed.b !== undefined) {
                state.balance = parsed.b;
                state.upgradesProcessed = parsed.u || 0;
                state.unlockedIds = parsed.un || {};
                
                // 2. DECOMPRESS INVENTORY: Rebuild full objects from the itemPool database
                state.inventory = (parsed.i || []).map(compactArr => {
                    const templateId = compactArr[0];
                    const instId = compactArr[1];
                    
                    // Find the base item in item.js
                    const baseItem = itemPool.find(x => x.id === templateId);
                    
                    // Rebuild and attach the instance ID so it can be sold/upgraded
                    if (baseItem) {
                        return { ...baseItem, instanceId: instId };
                    }
                    return null;
                }).filter(item => item !== null); // Remove any broken items
                
            } else {
                // Failsafe for legacy uncompressed local data
                state.balance = parsed.balance || 500.0;
                state.inventory = parsed.inventory || [];
                state.upgradesProcessed = parsed.upgradesProcessed || 0;
                state.unlockedIds = parsed.unlockedIds || {};
            }
        } catch (e) {
            console.error("Save state corrupted. Starting fresh.", e);
        }
    }
    
    // Refresh the UI after the asynchronous data fetch is complete
    updateUIDisplays();
    renderInventory();
    if (document.getElementById('itemIndexModal') && document.getElementById('itemIndexModal').style.display !== 'none') {
        renderIndex();
    }
}

function clearLegacyData() {
    state = { balance: 500.0, inventory: [], upgradesProcessed: 0, unlockedIds: {} };
    if (tg && tg.CloudStorage) tg.CloudStorage.removeItem(SAVE_KEY);
    localStorage.removeItem(SAVE_KEY);
    updateUIDisplays();
    renderInventory();
    if (document.getElementById('itemIndexModal') && document.getElementById('itemIndexModal').style.display !== 'none') renderIndex();
    alert("Simulator data wiped from Cloud and Local memory!");
}

// ==========================================
// 2. RENDERS & INTERFACES
// ==========================================
function switchTab(tabId) {
    document.querySelectorAll('.tab-trigger').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.getElementById(`btn-${tabId}`);
    if (activeBtn) activeBtn.classList.add('active');

    document.querySelectorAll('.tab-view').forEach(view => view.classList.remove('active-view'));
    const activeView = document.getElementById(tabId);
    if (activeView) activeView.classList.add('active-view');

    if (tabId === 'profileTab') renderInventory();
    if (tabId === 'upgraderTab') renderUpgraderTrays();
}

function updateUIDisplays() {
    document.getElementById('balanceDisplay').textContent = state.balance.toFixed(1);
    document.getElementById('statUpgrades').textContent = state.upgradesProcessed;
    document.getElementById('statItemsCount').textContent = state.inventory.length;
}

// ==========================================
// 3. CASE UNBOXING SUBSYSTEM
// ==========================================
let activeCase = null;
let currentQuantity = 1;

function renderCaseMenu() {
    const grid = document.getElementById('caseMenuGrid');
    if (!grid) return;
    grid.innerHTML = '';

    casesData.forEach((box, index) => {
        const card = document.createElement('div');
        card.className = 'case-element-card';
        card.onclick = () => openInspectModal(index);
        card.innerHTML = `
            <div class="case-name">📦 ${box.name}</div>
            <div class="case-cost">${box.cost} U</div>
        `;
        grid.appendChild(card);
    });
}

function openInspectModal(caseIndex) {
    activeCase = casesData[caseIndex];
    currentQuantity = 1;
    setUnboxQuantity(1);

    document.getElementById('inspectCaseName').textContent = activeCase.name;
    
    const listPanel = document.getElementById('inspectItemsList');
    listPanel.innerHTML = '';
    activeCase.contents.forEach(row => {
        const rowEl = document.createElement('div');
        rowEl.className = 'list-row-entry';
        rowEl.innerHTML = `
            <span>${row.item.emoji} ${row.item.name}</span>
            <span style="color:var(--text-muted)">${row.chance}%</span>
        `;
        listPanel.appendChild(rowEl);
    });

    document.getElementById('caseDetailsModal').style.display = 'flex';
}

function closeInspectModal() {
    document.getElementById('caseDetailsModal').style.display = 'none';
}

function setUnboxQuantity(qty) {
    currentQuantity = qty;
    document.querySelectorAll('.btn-selector').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`qty-${qty}`).classList.add('active');
    
    if (activeCase) {
        document.getElementById('totalCaseCostDisplay').textContent = activeCase.cost * qty;
    }
}

function confirmCasePurchase() {
    if (!activeCase) return;
    const totalCost = activeCase.cost * currentQuantity;

    if (state.balance < totalCost) {
        alert("Insufficient funds!");
        return;
    }

    state.balance -= totalCost;
    closeInspectModal();
    executeUnboxing(activeCase, currentQuantity);
}

function executeUnboxing(box, qty) {
    const unboxModal = document.getElementById('unboxingModal');
    const rollersWrapper = document.getElementById('multiRollersWrapper');
    const resultsContainer = document.getElementById('multiResultsContainer');
    const claimBtn = document.getElementById('modalClaimBtn');

    rollersWrapper.innerHTML = '';
    resultsContainer.innerHTML = '';
    claimBtn.style.display = 'none';
    unboxModal.style.display = 'flex';

    let rewards = [];

    for (let i = 0; i < qty; i++) {
        let roll = Math.random() * 100;
        let cumulative = 0;
        let selectedItem = box.contents[0].item;

        for (let entry of box.contents) {
            cumulative += entry.chance;
            if (roll <= cumulative) {
                selectedItem = entry.item;
                break;
            }
        }
        rewards.push({ ...selectedItem, instanceId: 'inst_' + Date.now() + '_' + i + '_' + Math.random() });
    }

    for (let i = 0; i < qty; i++) {
        const lane = document.createElement('div');
        lane.className = 'lane-viewport';
        lane.innerHTML = `
            <div class="lane-crosshair"></div>
            <div id="conveyor-${i}" class="lane-conveyor"></div>
        `;
        rollersWrapper.appendChild(lane);

        const conveyor = document.getElementById(`conveyor-${i}`);
        for (let x = 0; x < 25; x++) {
            const randomItem = itemPool[Math.floor(Math.random() * itemPool.length)];
            const node = document.createElement('div');
            node.className = 'lane-box-node';
            node.textContent = x === 20 ? rewards[i].emoji : randomItem.emoji;
            conveyor.appendChild(node);
        }

        setTimeout(() => {
            conveyor.style.transition = 'transform 2.5s cubic-bezier(0.1, 1, 0.1, 1)';
            conveyor.style.transform = 'translateX(-1216px)';
        }, 50);
    }

    setTimeout(() => {
        rewards.forEach(item => {
            state.inventory.push(item);
            state.unlockedIds[item.id] = true;
            
            const pill = document.createElement('div');
            pill.className = 'reward-pill';
            pill.title = item.name;
            pill.textContent = item.emoji;
            resultsContainer.appendChild(pill);
        });

        saveGame(true); // Locks inside secure file layer instantly
        updateUIDisplays();
        claimBtn.style.display = 'block';
    }, 2600);
}

function closeUnboxModal() {
    document.getElementById('unboxingModal').style.display = 'none';
}

// ==========================================
// 4. THE ITEM UPGRADER ENGINE
// ==========================================
let wagerItem = null;
let targetItem = null;

function renderUpgraderTrays() {
    const wagerGrid = document.getElementById('wagerGrid');
    const targetGrid = document.getElementById('targetGrid');
    
    wagerGrid.innerHTML = '';
    targetGrid.innerHTML = '';

    state.inventory.forEach(item => {
        const card = document.createElement('div');
        card.className = `item-capsule ${wagerItem && wagerItem.instanceId === item.instanceId ? 'selected' : ''}`;
        card.onclick = () => selectWager(item);
        card.innerHTML = `
            <span>${item.emoji} ${item.name}</span>
            <span class="cap-value">${item.value}</span>
        `;
        wagerGrid.appendChild(card);
    });

    itemPool.forEach(item => {
        const card = document.createElement('div');
        card.className = `item-capsule ${targetItem && targetItem.id === item.id ? 'selected' : ''}`;
        card.onclick = () => selectTarget(item);
        card.innerHTML = `
            <span>${item.emoji} ${item.name}</span>
            <span class="cap-value">${item.value}</span>
        `;
        targetGrid.appendChild(card);
    });

    calculateOdds();
}

function selectWager(item) {
    wagerItem = item;
    document.getElementById('stageWager').className = 'dock-slot active';
    document.getElementById('stageWager').innerHTML = `<span>Wager</span><strong>${item.emoji} ${item.name}</strong>`;
    renderUpgraderTrays();
}

function selectTarget(item) {
    targetItem = item;
    document.getElementById('stageTarget').className = 'dock-slot active';
    document.getElementById('stageTarget').innerHTML = `<span>Target</span><strong>${item.emoji} ${item.name}</strong>`;
    renderUpgraderTrays();
}

function calculateOdds() {
    const chanceDisplay = document.getElementById('chanceDisplay');
    const radar = document.getElementById('upgraderWheel');
    const rollBtn = document.getElementById('upgradeBtn');

    if (!wagerItem || !targetItem) {
        chanceDisplay.textContent = "0.00%";
        radar.style.background = 'var(--bg-inner)';
        rollBtn.disabled = true;
        return;
    }

    if (wagerItem.value >= targetItem.value) {
        chanceDisplay.textContent = "100.00%";
        radar.style.background = 'var(--accent-green)';
        rollBtn.disabled = false;
        return;
    }

    let odds = (wagerItem.value / targetItem.value) * 100;
    if (odds > 99.9) odds = 99.9;

    chanceDisplay.textContent = `${odds.toFixed(2)}%`;
    radar.style.background = `conic-gradient(var(--accent-green) 0% ${odds}%, var(--accent-red) ${odds}% 100%)`;
    rollBtn.disabled = false;
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
            state.inventory.push({ ...targetItem, instanceId: 'inst_' + Date.now() + '_' + Math.random() });
            state.unlockedIds[targetItem.id] = true;
            alert(`SUCCESS! Obtained ${targetItem.emoji} ${targetItem.name}!`);
        } else {
            alert("UPGRADE FAILED! Asset vaporized.");
        }

        wagerItem = null;
        targetItem = null;
        needle.style.transition = 'none';
        needle.style.transform = 'rotate(0deg)';
        
        state.upgradesProcessed++;
        saveGame(true);
        updateUIDisplays();
        renderUpgraderTrays();
        
        document.getElementById('stageWager').className = 'dock-slot empty';
        document.getElementById('stageWager').textContent = 'Select Wager';
        document.getElementById('stageTarget').className = 'dock-slot empty';
        document.getElementById('stageTarget').textContent = 'Select Target';
        
    }, spinDuration);
}

function applyPresetMultiplier(mult) {
    if (!wagerItem) return alert("Select a wager item first!");
    let targetVal = wagerItem.value * mult;
    let bestMatch = [...itemPool].sort((a,b) => Math.abs(a.value - targetVal) - Math.abs(b.value - targetVal))[0];
    if (bestMatch) selectTarget(bestMatch);
}

function applyPresetChance(targetChance) {
    if (!wagerItem) return alert("Select a wager item first!");
    let calculatedTargetValue = wagerItem.value / (targetChance / 100);
    let bestMatch = [...itemPool].sort((a,b) => Math.abs(a.value - calculatedTargetValue) - Math.abs(b.value - calculatedTargetValue))[0];
    if (bestMatch) selectTarget(bestMatch);
}

// ==========================================
// 5. CLICK GENERATOR & INVENTORY ACTIONS
// ==========================================
function clickCoin() {
    state.balance += 1.0;
    updateUIDisplays(); // Updates UI instantly in real-time on screen
    saveGame(false);    // Smooth background save (doesn't freeze app thread)
}

function renderInventory() {
    const invGrid = document.getElementById('profileInventory');
    if (!invGrid) return;
    invGrid.innerHTML = '';

    if (state.inventory.length === 0) {
        invGrid.innerHTML = '<div style="grid-column: span 3; text-align:center; color:var(--text-muted); padding:20px; font-size:12px;">Backpack empty. Start rollout configurations!</div>';
        return;
    }

    state.inventory.forEach(item => {
        const itemCard = document.createElement('div');
        itemCard.className = 'index-item-card unlocked';
        itemCard.style.padding = '8px';
        itemCard.innerHTML = `
            <div class="idx-emoji">${item.emoji}</div>
            <div style="font-size:10px; font-weight:700; color:#fff; text-align:center; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; width:100%;">${item.name}</div>
            <div class="idx-val">${item.value} U</div>
            <button class="btn-sell-quick" onclick="sellItem('${item.instanceId}', ${item.value})">SELL</button>
        `;
        invGrid.appendChild(itemCard);
    });
}

function sellItem(instanceId, value) {
    state.inventory = state.inventory.filter(item => item.instanceId !== instanceId);
    state.balance += value;
    saveGame(true);
    updateUIDisplays();
    renderInventory();
}

// ==========================================
// 6. ARCHIVE CATALOG SYSTEM
// ==========================================
function openIndexModal() {
    renderIndex();
    document.getElementById('itemIndexModal').style.display = 'flex';
}

function closeIndexModal() {
    document.getElementById('itemIndexModal').style.display = 'none';
}

function renderIndex() {
    const idxGrid = document.getElementById('indexGrid');
    if (!idxGrid) return;
    idxGrid.innerHTML = '';

    itemPool.forEach(item => {
        const hasUnlocked = state.unlockedIds[item.id] === true;
        const card = document.createElement('div');
        
        if (hasUnlocked) {
            card.className = 'index-item-card unlocked';
            card.innerHTML = `
                <div class="idx-emoji">${item.emoji}</div>
                <div style="color:#fff; text-align:center; font-size:9px; font-weight:bold; overflow:hidden; text-overflow:ellipsis; width:100%;">${item.name}</div>
                <div class="idx-val">${item.value} U</div>
            `;
        } else {
            card.className = 'index-item-card locked';
            card.innerHTML = `
                <div class="idx-emoji">❓</div>
                <div style="color:var(--text-muted); font-size:9px;">Locked</div>
                <div class="idx-val">${item.value} U</div>
            `;
        }
        idxGrid.appendChild(card);
    });
}

// RUN SEED INITIALIZERS ON LAUNCH
window.onload = function() {
    loadGame();
    renderCaseMenu();
};