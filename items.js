// Clean items database without tier prefixes
const itemPool = [
    { emoji: "🥔", value: 1 },    { emoji: "🔑", value: 3 },    { emoji: "🪙", value: 5 },
    { emoji: "🧱", value: 8 },    { emoji: "📦", value: 10 },   { emoji: "⚙️", value: 12 },
    { emoji: "🔋", value: 15 },   { emoji: "🔌", value: 18 },   { emoji: "🛡️", value: 22 },
    { emoji: "🏹", value: 25 },   { emoji: "🧪", value: 30 },   { emoji: "🧲", value: 35 },
    { emoji: "🔦", value: 40 },   { emoji: "📟", value: 48 },   { emoji: "💾", value: 55 },
    { emoji: "🧭", value: 65 },   { emoji: "🖲️", value: 75 },   { emoji: "🔮", value: 90 },
    { emoji: "🧿", value: 110 },  { emoji: "💎", value: 130 },  { emoji: "🕹️", value: 150 },
    { emoji: "🧸", value: 180 },  { emoji: "🏮", value: 210 },  { emoji: "📡", value: 250 },
    { emoji: "🎛️", value: 300 },  { emoji: "🎙️", value: 350 },  { emoji: "🎸", value: 420 },
    { emoji: "🎺", value: 500 },  { emoji: "🎷", value: 600 },  { emoji: "🎻", value: 720 },
    { emoji: "🎨", value: 850 },  { emoji: "🎬", value: 1000 }, { emoji: "🎟️", value: 1200 },
    { emoji: "🎰", value: 1500 }, { emoji: "🎮", value: 1900 }, { emoji: "👾", value: 2400 },
    { emoji: "🤖", value: 3000 }, { emoji: "🧬", value: 3800 }, { emoji: "🛸", value: 4800 },
    { emoji: "🚀", value: 6000 }, { emoji: "🛰️", value: 7500 }, { emoji: "🪐", value: 9500 },
    { emoji: "🌌", value: 12000 },{ emoji: "🌋", value: 15000 },{ emoji: "⚡", value: 20000 }
];

// Balanced loot cases with visible drops and odds configurations
const casesData = [
    {
        name: "Starter Box", cost: 10, oddsText: "Low Tier (80%) | Mid Tier (20%)",
        rollLogic: () => itemPool[Math.floor(Math.random() * 8)] // items valued 1 to 22
    },
    {
        name: "Amateur Crate", cost: 50, oddsText: "Mid Tier (75%) | Rare Tier (25%)",
        rollLogic: () => itemPool[5 + Math.floor(Math.random() * 10)] // items valued 12 to 130
    },
    {
        name: "Hacker Vault", cost: 250, oddsText: "Rare Tier (70%) | Elite Tier (30%)",
        rollLogic: () => itemPool[15 + Math.floor(Math.random() * 12)] // items valued 65 to 720
    },
    {
        name: "Quantum Stash", cost: 1000, oddsText: "Elite Tier (85%) | High Tech (15%)",
        rollLogic: () => itemPool[25 + Math.floor(Math.random() * 12)] // items valued 350 to 4800
    },
    {
        name: "Omega Cache", cost: 5000, oddsText: "High Tech (90%) | God Tier (10%)",
        rollLogic: () => itemPool[35 + Math.floor(Math.random() * 10)] // items valued 2400 to 20000
    }
];

// Showroom targets inside the upgrader showroom tab
const targetShopSkins = [
    { emoji: "🛡️", value: 22 },
    { emoji: "🧭", value: 65 },
    { emoji: "🕹️", value: 150 },
    { emoji: "🎛️", value: 300 },
    { emoji: "🎬", value: 1000 },
    { emoji: "🤖", value: 3000 },
    { emoji: "🚀", value: 6000 },
    { emoji: "⚡", value: 20000 }
];