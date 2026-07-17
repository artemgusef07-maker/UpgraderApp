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

/* REPLACE THE casesData ARRAY IN items.js WITH THIS */
const casesData = [
    {
        name: "Novice Crate", cost: 30,
        contents: [
            { item: itemPool[0], chance: 25 }, { item: itemPool[1], chance: 20 },
            { item: itemPool[2], chance: 15 }, { item: itemPool[3], chance: 12 },
            { item: itemPool[4], chance: 10 }, { item: itemPool[5], chance: 8 },
            { item: itemPool[6], chance: 6 },  { item: itemPool[7], chance: 4 }
        ]
    },
    {
        name: "Challenger Case", cost: 100,
        contents: [
            { item: itemPool[10], chance: 25 }, { item: itemPool[11], chance: 20 },
            { item: itemPool[12], chance: 15 }, { item: itemPool[13], chance: 12 },
            { item: itemPool[14], chance: 10 }, { item: itemPool[15], chance: 8 },
            { item: itemPool[16], chance: 6 },  { item: itemPool[17], chance: 4 }
        ]
    },
    {
        name: "Elite Box", cost: 500,
        contents: [
            { item: itemPool[25], chance: 25 }, { item: itemPool[26], chance: 20 },
            { item: itemPool[27], chance: 15 }, { item: itemPool[28], chance: 12 },
            { item: itemPool[29], chance: 10 }, { item: itemPool[30], chance: 8 },
            { item: itemPool[31], chance: 6 },  { item: itemPool[32], chance: 4 }
        ]
    },
    {
        name: "Vanguard Cache", cost: 2000,
        contents: [
            { item: itemPool[45], chance: 25 }, { item: itemPool[46], chance: 20 },
            { item: itemPool[47], chance: 15 }, { item: itemPool[48], chance: 12 },
            { item: itemPool[49], chance: 10 }, { item: itemPool[50], chance: 8 },
            { item: itemPool[51], chance: 6 },  { item: itemPool[52], chance: 4 }
        ]
    },
    {
        name: "Prestige Vault", cost: 7500,
        contents: [
            { item: itemPool[65], chance: 25 }, { item: itemPool[66], chance: 20 },
            { item: itemPool[67], chance: 15 }, { item: itemPool[68], chance: 12 },
            { item: itemPool[69], chance: 10 }, { item: itemPool[70], chance: 8 },
            { item: itemPool[71], chance: 6 },  { item: itemPool[72], chance: 4 }
        ]
    }
];