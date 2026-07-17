// Add basic items here. The game will automatically generate the shiny/diamond versions of them!
const baseItems = [
    { name: "Rusty Pipe", baseValue: 5 },
    { name: "Cyber Katana", baseValue: 20 },
    { name: "Neon Glock", baseValue: 50 },
    { name: "Plasma AK", baseValue: 250 },
    { name: "Laser Sniper", baseValue: 1000 }
];

// 1:5, 1:25, 1:100 chance setup
const rarities = [
    { name: "Diamond", chance: 100, multiplier: 100, color: "#b9f2ff" }, 
    { name: "Gold", chance: 25, multiplier: 25, color: "#ffd700" },      
    { name: "Silver", chance: 5, multiplier: 5, color: "#c0c0c0" },       
    { name: "Normal", chance: 1, multiplier: 1, color: "#ffffff" }        
];

const shiny = { chance: 1000, multiplier: 1000 };

// These are the high-tier items players will try to upgrade INTO
const targetShopSkins = [
    { name: "Normal Cyber Katana", value: 20, color: "#ffffff" },
    { name: "Silver Neon Glock", value: 250, color: "#c0c0c0" },
    { name: "Gold Plasma AK", value: 6250, color: "#ffd700" },
    { name: "Diamond Laser Sniper", value: 100000, color: "#b9f2ff" },
    { name: "Shiny Diamond Laser Sniper", value: 100000000, color: "#b9f2ff" } // The ultimate prize
];