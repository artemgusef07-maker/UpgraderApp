// 1. THE COMPLETE ITEM ARCHIVE (Fixed with names, IDs, and rarities for the Index)
const itemPool = [
    { id: "wood", name: "Wood Shard", emoji: "🪵", value: 10, rarity: "common" },
    { id: "brick", name: "Clay Brick", emoji: "🧱", value: 25, rarity: "common" },
    { id: "iron", name: "Iron Bar", emoji: "⚙️", value: 50, rarity: "uncommon" },
    { id: "coin", name: "Gold Coin", emoji: "🪙", value: 120, rarity: "uncommon" },
    { id: "glock", name: "Glock | Neon Fade", emoji: "🔫", value: 350, rarity: "rare" },
    { id: "ak47", name: "AK-47 | Hydro", emoji: "⚔️", value: 750, rarity: "rare" },
    { id: "case", name: "Secure Safe", emoji: "📦", value: 1500, rarity: "classified" },
    { id: "gloves", name: "Vice Gloves", emoji: "🧤", value: 3200, rarity: "classified" },
    { id: "diamond", name: "Pure Diamond", emoji: "💎", value: 6500, rarity: "covert" },
    { id: "knife", name: "Karambit | Doppler", emoji: "🔪", value: 12500, rarity: "covert" },
    { id: "crown", name: "Alpha Crown", emoji: "👑", value: 30000, rarity: "legendary" }
];

// 2. THE CASE MENUS AND DROP RATES
const casesData = [
    {
        name: "Recruit Cache",
        cost: 40,
        contents: [
            { item: { id: "wood", name: "Wood Shard", emoji: "🪵", value: 10, rarity: "common" }, chance: 55 },
            { item: { id: "brick", name: "Clay Brick", emoji: "🧱", value: 25, rarity: "common" }, chance: 35 },
            { item: { id: "iron", name: "Iron Bar", emoji: "⚙️", value: 50, rarity: "uncommon" }, chance: 10 }
        ]
    },
    {
        name: "Operation Case",
        cost: 250,
        contents: [
            { item: { id: "iron", name: "Iron Bar", emoji: "⚙️", value: 50, rarity: "uncommon" }, chance: 50 },
            { item: { id: "coin", name: "Gold Coin", emoji: "🪙", value: 120, rarity: "uncommon" }, chance: 35 },
            { item: { id: "glock", name: "Glock | Neon Fade", emoji: "🔫", value: 350, rarity: "rare" }, chance: 12 },
            { item: { id: "ak47", name: "AK-47 | Hydro", emoji: "⚔️", value: 750, rarity: "rare" }, chance: 3 }
        ]
    },
    {
        name: "Classified Safe",
        cost: 1200,
        contents: [
            { item: { id: "glock", name: "Glock | Neon Fade", emoji: "🔫", value: 350, rarity: "rare" }, chance: 50 },
            { item: { id: "ak47", name: "AK-47 | Hydro", emoji: "⚔️", value: 750, rarity: "rare" }, chance: 35 },
            { item: { id: "case", name: "Secure Safe", emoji: "📦", value: 1500, rarity: "classified" }, chance: 11 },
            { item: { id: "gloves", name: "Vice Gloves", emoji: "🧤", value: 3200, rarity: "classified" }, chance: 4 }
        ]
    },
    {
        name: "High Roller Vault",
        cost: 5000,
        contents: [
            { item: { id: "case", name: "Secure Safe", emoji: "📦", value: 1500, rarity: "classified" }, chance: 55 },
            { item: { id: "gloves", name: "Vice Gloves", emoji: "🧤", value: 3200, rarity: "classified" }, chance: 30 },
            { item: { id: "diamond", name: "Pure Diamond", emoji: "💎", value: 6500, rarity: "covert" }, chance: 12 },
            { item: { id: "knife", name: "Karambit | Doppler", emoji: "🔪", value: 12500, rarity: "covert" }, chance: 3 }
        ]
    }
];

// 3. FAIL-SAFE ALIASES (Ensures app.js reads the arrays no matter what it named them)
const allItems = itemPool;
const items = itemPool;
const itemsData = itemPool;

const cases = casesData;
const casePool = casesData;
const caseList = casesData;