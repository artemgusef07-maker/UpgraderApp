// ==========================================
// CENTRAL STATE ENGINE
// ==========================================
let state = {
    balance: 500.0,
    inventory: []
};

const SAVE_KEY = "sleek_sim_stable_v1";

// 1. Initialize Telegram WebApp
const tg = window.Telegram ? window.Telegram.WebApp : null;
if (tg) {
    tg.ready();
    tg.expand();
}

// 2. Load Logic (Synchronous Gatekeeper)
function initApp() {
    if (tg && tg.CloudStorage) {
        tg.CloudStorage.getItem(SAVE_KEY, (err, value) => {
            if (!err && value) {
                try {
                    const parsed = JSON.parse(value);
                    state.balance = parsed.balance;
                    state.inventory = parsed.inventory;
                } catch(e) { resetState(); }
            }
            renderUI(); // Only render after data arrives
        });
    } else {
        const local = localStorage.getItem(SAVE_KEY);
        if (local) {
            const parsed = JSON.parse(local);
            state.balance = parsed.balance;
            state.inventory = parsed.inventory;
        }
        renderUI();
    }
}

// 3. Save Logic
function saveGame() {
    const data = JSON.stringify(state);
    if (tg && tg.CloudStorage) {
        tg.CloudStorage.setItem(SAVE_KEY, data);
    } else {
        localStorage.setItem(SAVE_KEY, data);
    }
}

function resetState() {
    state = { balance: 500.0, inventory: [] };
    saveGame();
    renderUI();
}

// 4. UI Actions
function renderUI() {
    document.getElementById('balanceDisplay').textContent = state.balance.toFixed(2);
    const invList = document.getElementById('inventoryList');
    invList.innerHTML = '';
    
    state.inventory.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'item-card';
        div.innerHTML = `<span>${item.emoji}</span><span>${item.name}</span><button onclick="sellItem(${index})">SELL</button>`;
        invList.appendChild(div);
    });
}

function addMoney() {
    state.balance += 10;
    saveGame();
    renderUI();
}

function sellItem(index) {
    const item = state.inventory[index];
    state.balance += item.value;
    state.inventory.splice(index, 1);
    saveGame();
    renderUI();
}

window.onload = initApp;