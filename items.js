// 15 Base Cohesive Collectible Emojis
const baseItems = [
    { name: "👾 Glitch Slime", baseValue: 2 },
    { name: "🤖 Robo Core", baseValue: 5 },
    { name: "💾 Retro Disk", baseValue: 12 },
    { name: "🔋 Volt Battery", baseValue: 25 },
    { name: "🦊 Cyber Fox", baseValue: 60 },
    { name: "👻 Matrix Ghost", baseValue: 120 },
    { name: "💀 Quantum Skull", baseValue: 250 },
    { name: "🔮 Nexus Orb", baseValue: 550 },
    { name: "🪐 Astro Ring", baseValue: 1200 },
    { name: "🚀 Star Voyager", baseValue: 3000 },
    { name: "🦄 Cyber Unicorn", baseValue: 8000 },
    { name: "🐉 Plasma Dragon", baseValue: 20000 },
    { name: "👑 Crypto King", baseValue: 50000 },
    { name: "💎 Prism Core", baseValue: 150000 },
    { name: "🌌 Singularity", baseValue: 500000 }
];

const rarities = [
    { name: "Diamond", chance: 100, multiplier: 100, color: "#b9f2ff" }, 
    { name: "Gold", chance: 25, multiplier: 25, color: "#ffd700" },      
    { name: "Silver", chance: 5, multiplier: 5, color: "#c0c0c0" },       
    { name: "Normal", chance: 1, multiplier: 1, color: "#a0a0a0" }        
];

const shiny = { chance: 1000, multiplier: 1000, color: "#ff007f" };

// Automatically build the target showroom items based on tier jumps
const targetShopSkins = [
    { name: "Normal 🦊 Cyber Fox", value: 60, color: "#a0a0a0" },
    { name: "Silver 🦊 Cyber Fox", value: 300, color: "#c0c0c0" },
    { name: "Gold 🦊 Cyber Fox", value: 1500, color: "#ffd700" },
    { name: "Diamond 👻 Matrix Ghost", value: 12000, color: "#b9f2ff" },
    { name: "Gold 🚀 Star Voyager", value: 75000, color: "#ffd700" },
    { name: "Diamond 👑 Crypto King", value: 5000000, color: "#b9f2ff" },
    { name: "Shiny Diamond 🌌 Singularity", value: 5000000000, color: "#ff007f" }
];