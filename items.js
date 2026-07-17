const itemPool = [
    // Low Tier (10-100 U)
    { emoji: "🥔", value: 10 }, { emoji: "🥜", value: 12 }, { emoji: "🔑", value: 15 }, { emoji: "🪙", value: 18 }, { emoji: "🧱", value: 20 }, 
    { emoji: "📦", value: 25 }, { emoji: "⚙️", value: 30 }, { emoji: "📎", value: 35 }, { emoji: "🔋", value: 40 }, { emoji: "🔌", value: 45 },
    { emoji: "🛡️", value: 50 }, { emoji: "✉️", value: 55 }, { emoji: "🖋️", value: 60 }, { emoji: "🧼", value: 70 }, { emoji: "🧽", value: 80 },
    { emoji: "🧴", value: 85 }, { emoji: "🔦", value: 90 }, { emoji: "🪜", value: 95 }, { emoji: "🪚", value: 100 }, { emoji: "🔨", value: 110 },

    // Mid Tier (120-1,000 U)
    { emoji: "🏹", value: 130 }, { emoji: "🧪", value: 150 }, { emoji: "🧲", value: 180 }, { emoji: "📡", value: 210 }, { emoji: "📟", value: 250 },
    { emoji: "💾", value: 300 }, { emoji: "📼", value: 350 }, { emoji: "🎞️", value: 400 }, { emoji: "📽️", value: 450 }, { emoji: "🔭", value: 500 },
    { emoji: "⚖️", value: 550 }, { emoji: "🪓", value: 600 }, { emoji: "🧨", value: 650 }, { emoji: "🧭", value: 700 }, { emoji: "🖲️", value: 750 },
    { emoji: "🖱️", value: 800 }, { emoji: "⌨️", value: 850 }, { emoji: "🖥️", value: 900 }, { emoji: "⌚", value: 950 }, { emoji: "📷", value: 1000 },
    { emoji: "📸", value: 1100 }, { emoji: "📹", value: 1200 }, { emoji: "🎙️", value: 1300 }, { emoji: "🎚️", value: 1400 }, { emoji: "🎛️", value: 1500 },

    // High Tier (1,600-10,000 U)
    { emoji: "🧿", value: 1600 }, { emoji: "🔮", value: 1800 }, { emoji: "🕯️", value: 2000 }, { emoji: "🕰️", value: 2200 }, { emoji: "📜", value: 2400 },
    { emoji: "⚔️", value: 2600 }, { emoji: "🛡️", value: 2800 }, { emoji: "🏹", value: 3000 }, { emoji: "🧨", value: 3500 }, { emoji: "💣", value: 4000 },
    { emoji: "🧸", value: 4500 }, { emoji: "🏮", value: 5000 }, { emoji: "🕹️", value: 5500 }, { emoji: "🎮", value: 6000 }, { emoji: "🎧", value: 6500 },
    { emoji: "🎸", value: 7000 }, { emoji: "🎺", value: 7500 }, { emoji: "🎷", value: 8000 }, { emoji: "🎻", value: 8500 }, { emoji: "🥁", value: 9000 },
    { emoji: "🎷", value: 9500 }, { emoji: "🎺", value: 10000 },

    // Top Tier (11,000-50,000 U)
    { emoji: "💎", value: 11000 }, { emoji: "👑", value: 12000 }, { emoji: "🚀", value: 13000 }, { emoji: "🛸", value: 14000 }, { emoji: "🛰️", value: 15000 },
    { emoji: "🏎️", value: 17500 }, { emoji: "🏍️", value: 20000 }, { emoji: "🚁", value: 22500 }, { emoji: "✈️", value: 25000 }, { emoji: "🛸", value: 27500 },
    { emoji: "🏰", value: 30000 }, { emoji: "🏯", value: 32500 }, { emoji: "🗼", value: 35000 }, { emoji: "🗽", value: 37500 }, { emoji: "🗿", value: 40000 },
    { emoji: "🌋", value: 42500 }, { emoji: "🌌", value: 45000 }, { emoji: "🪐", value: 50000 }, { emoji: "⭐", value: 55000 }, { emoji: "🌟", value: 60000 },
    { emoji: "✨", value: 65000 }, { emoji: "☄️", value: 70000 }, { emoji: "🪐", value: 75000 }, { emoji: "🌎", value: 80000 }, { emoji: "🌍", value: 85000 }
];

const casesData = [
    { name: "Novice Crate", cost: 30, contents: [{ item: itemPool[0], chance: 50 }, { item: itemPool[1], chance: 30 }, { item: itemPool[2], chance: 20 }] },
    { name: "Challenger Case", cost: 100, contents: [{ item: itemPool[15], chance: 40 }, { item: itemPool[16], chance: 30 }, { item: itemPool[17], chance: 20 }, { item: itemPool[18], chance: 10 }] },
    { name: "Elite Box", cost: 500, contents: [{ item: itemPool[30], chance: 40 }, { item: itemPool[31], chance: 30 }, { item: itemPool[32], chance: 20 }, { item: itemPool[33], chance: 10 }] },
    { name: "Vanguard Cache", cost: 2000, contents: [{ item: itemPool[50], chance: 40 }, { item: itemPool[51], chance: 30 }, { item: itemPool[52], chance: 20 }, { item: itemPool[53], chance: 10 }] },
    { name: "Prestige Vault", cost: 7500, contents: [{ item: itemPool[70], chance: 40 }, { item: itemPool[71], chance: 30 }, { item: itemPool[72], chance: 20 }, { item: itemPool[73], chance: 10 }] }
];