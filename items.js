const itemPool = [
    { emoji: "🥔", value: 10 },   { emoji: "🔑", value: 15 },   { emoji: "🪙", value: 20 },
    { emoji: "🧱", value: 30 },   { emoji: "📦", value: 45 },   { emoji: "⚙️", value: 60 },
    { emoji: "🔋", value: 80 },   { emoji: "🔌", value: 100 },  { emoji: "🛡️", value: 130 },
    { emoji: "🏹", value: 170 },  { emoji: "🧪", value: 220 },  { emoji: "🧲", value: 280 },
    { emoji: "🔦", value: 350 },  { emoji: "📟", value: 450 },  { emoji: "💾", value: 580 },
    { emoji: "🧭", value: 750 },  { emoji: "🖲️", value: 950 },  { emoji: "🔮", value: 1200 },
    { emoji: "🧿", value: 1500 }, { emoji: "🛡️", value: 1900 }, { emoji: "🕹️", value: 2400 },
    { emoji: "🧸", value: 3000 }, { emoji: "🏮", value: 3800 }, { emoji: "📡", value: 4800 },
    { emoji: "🎛️", value: 6000 }, { emoji: "🎙️", value: 7500 }, { emoji: "🎸", value: 9500 },
    { emoji: "🎺", value: 12000 },{ emoji: "🎷", value: 15000 },{ emoji: "🎻", value: 20000 }
];

const casesData = [
    {
        name: "Novice Crate", cost: 30,
        contents: [
            { item: itemPool[0], chance: 37.5 }, { item: itemPool[1], chance: 37.5 },
            { item: itemPool[2], chance: 15.0 }, { item: itemPool[3], chance: 10.0 }
        ]
    },
    {
        name: "Challenger Case", cost: 100,
        contents: [
            { item: itemPool[3], chance: 39.0 }, { item: itemPool[4], chance: 39.0 },
            { item: itemPool[5], chance: 10.0 }, { item: itemPool[6], chance: 8.0 }, { item: itemPool[7], chance: 4.0 }
        ]
    },
    {
        name: "Elite Box", cost: 500,
        contents: [
            { item: itemPool[6], chance: 40.0 }, { item: itemPool[7], chance: 40.0 },
            { item: itemPool[8], chance: 10.0 }, { item: itemPool[9], chance: 7.0 }, { item: itemPool[14], chance: 3.0 }
        ]
    },
    {
        name: "Vanguard Cache", cost: 2000,
        contents: [
            { item: itemPool[11], chance: 41.0 }, { item: itemPool[12], chance: 41.0 },
            { item: itemPool[13], chance: 10.0 }, { item: itemPool[15], chance: 6.0 }, { item: itemPool[20], chance: 2.0 }
        ]
    },
    {
        name: "Prestige Vault", cost: 7500,
        contents: [
            { item: itemPool[16], chance: 43.0 }, { item: itemPool[17], chance: 42.0 },
            { item: itemPool[18], chance: 10.0 }, { item: itemPool[24], chance: 4.0 }, { item: itemPool[29], chance: 1.0 }
        ]
    }
];