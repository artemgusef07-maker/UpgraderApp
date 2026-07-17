const itemPool = [
    { emoji: "🪵", value: 10 },
    { emoji: "🧱", value: 25 },
    { emoji: "🪙", value: 50 },
    { emoji: "🛠️", value: 100 },
    { emoji: "📦", value: 250 },
    { emoji: "💎", value: 750 },
    { emoji: "👑", value: 2500 }
];

const casesData = [
    {
        name: "Basic Box",
        cost: 30,
        contents: [
            { item: { emoji: "🪵", value: 10 }, chance: 60 },
            { item: { emoji: "🧱", value: 25 }, chance: 35 },
            { item: { emoji: "🪙", value: 50 }, chance: 5 }
        ]
    },
    {
        name: "Premium Cache",
        cost: 150,
        contents: [
            { item: { emoji: "🪙", value: 50 }, chance: 50 },
            { item: { emoji: "🛠️", value: 100 }, chance: 40 },
            { item: { emoji: "📦", value: 250 }, chance: 10 }
        ]
    }
];