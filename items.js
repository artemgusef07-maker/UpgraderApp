const itemPool = [
    { id: "wood", name: "Wood Shard", emoji: "🪵", value: 10, rarity: "common" },
    { id: "brick", name: "Clay Brick", emoji: "🧱", value: 25, rarity: "common" },
    { id: "iron", name: "Iron Bar", emoji: "⚙️", value: 50, rarity: "uncommon" },
    { id: "win_key", name: "Unactivated OS Key", emoji: "💿", value: 120, rarity: "uncommon" },
    { id: "cs2_drop", name: "Weekly Prime Drop", emoji: "📦", value: 350, rarity: "rare" },
    { id: "gpu", name: "RTX 5070ti TUF", emoji: "🖥️", value: 1500, rarity: "classified" },
    { id: "gloves", name: "Vice Gloves", emoji: "🧤", value: 3200, rarity: "classified" },
    { id: "diamond", name: "Pure Diamond", emoji: "💎", value: 6500, rarity: "covert" },
    { id: "knife", name: "Karambit | Doppler", emoji: "🔪", value: 12500, rarity: "covert" },
    { id: "crown", name: "Alpha Crown", emoji: "👑", value: 30000, rarity: "legendary" }
];

const casesData = [
    {
        name: "Junk Cache",
        cost: 40,
        contents: [
            { item: itemPool[0], chance: 55 },
            { item: itemPool[1], chance: 35 },
            { item: itemPool[2], chance: 10 }
        ]
    },
    {
        name: "Digital Case",
        cost: 250,
        contents: [
            { item: itemPool[2], chance: 50 },
            { item: itemPool[3], chance: 35 },
            { item: itemPool[4], chance: 15 }
        ]
    },
    {
        name: "Hardware Safe",
        cost: 1200,
        contents: [
            { item: itemPool[3], chance: 45 },
            { item: itemPool[4], chance: 35 },
            { item: itemPool[5], chance: 15 },
            { item: itemPool[6], chance: 5 }
        ]
    },
    {
        name: "High Roller Vault",
        cost: 5000,
        contents: [
            { item: itemPool[5], chance: 55 },
            { item: itemPool[6], chance: 30 },
            { item: itemPool[7], chance: 12 },
            { item: itemPool[8], chance: 3 }
        ]
    }
];