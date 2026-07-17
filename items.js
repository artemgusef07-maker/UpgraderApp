// Dense progression database with smaller item value gaps to avoid massive dropoffs
const itemPool = [
    { emoji: "🥔", value: 10 },   { emoji: "🔑", value: 15 },   { emoji: "🪙", value: 20 },
    { emoji: "🧱", value: 30 },   { emoji: "📦", value: 45 },   { emoji: "⚙️", value: 60 },
    { emoji: "🔋", value: 80 },   { emoji: "🔌", value: 100 },  { emoji: "🛡️", value: 130 },
    { emoji: "🏹", value: 170 },  { emoji: "🧪", value: 220 },  { emoji: "🧲", value: 280 },
    { emoji: " flashlight", emoji:"🔦", value: 350 }, { emoji: "📟", value: 450 }, { emoji: "💾", value: 580 },
    { emoji: " Compass", emoji:"Compass", emoji:"🧭", value: 750 }, { emoji: "🖲️", value: 950 }, { emoji: "🔮", value: 1200 },
    { emoji: "🧿", value: 1500 }, { emoji: "🛡️", value: 1900 }, { emoji: "🕹️", value: 2400 },
    { emoji: "🧸", value: 3000 }, { emoji: "🏮", value: 3800 }, { emoji: "📡", value: 4800 },
    { emoji: "🎛️", value: 6000 }, { emoji: "🎙️", value: 7500 }, { emoji: "🎸", value: 9500 },
    { emoji: "🎺", value: 12000 },{ emoji: "🎷", value: 15000 },{ emoji: "🎻", value: 20000 }
];

// Rebalanced cases to give a clear house edge (65%-80% chance of hitting below box cost)
const casesData = [
    {
        name: "Novice Crate", cost: 30, oddsText: "Win Rate: ~25%",
        rollLogic: () => {
            let roll = Math.random();
            if (roll < 0.75) return itemPool[Math.floor(Math.random() * 2)]; // 10 or 15 coins (Loss)
            return itemPool[2 + Math.floor(Math.random() * 2)]; // 20 or 30 coins (Break even / Small Profit)
        }
    },
    {
        name: "Challenger Case", cost: 100, oddsText: "Win Rate: ~22%",
        rollLogic: () => {
            let roll = Math.random();
            if (roll < 0.78) return itemPool[3 + Math.floor(Math.random() * 2)]; // 30 or 45 coins (Loss)
            return itemPool[5 + Math.floor(Math.random() * 3)]; // 60, 80, 100 coins
        }
    },
    {
        name: "Elite Box", cost: 500, oddsText: "Win Rate: ~20%",
        rollLogic: () => {
            let roll = Math.random();
            if (roll < 0.80) return itemPool[6 + Math.floor(Math.random() * 2)]; // 80 or 100 coins (Loss)
            return itemPool[8 + Math.floor(Math.random() * 5)]; // Up to 580 coins
        }
    },
    {
        name: "Vanguard Cache", cost: 2000, oddsText: "Win Rate: ~18%",
        rollLogic: () => {
            let roll = Math.random();
            if (roll < 0.82) return itemPool[11 + Math.floor(Math.random() * 2)]; // 280 or 350 coins (Loss)
            return itemPool[13 + Math.floor(Math.random() * 6)]; // Up to 2400 coins
        }
    },
    {
        name: "Prestige Vault", cost: 7500, oddsText: "Win Rate: ~15%",
        rollLogic: () => {
            let roll = Math.random();
            if (roll < 0.85) return itemPool[16 + Math.floor(Math.random() * 3)]; // 950 - 1500 coins (Loss)
            return itemPool[19 + Math.floor(Math.random() * 8)]; // Up to 12000 coins
        }
    }
];