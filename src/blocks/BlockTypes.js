
export const BLOCK = {
    AIR: {
        id: 0,
        name: "Air",
        solid: false
    },

    GRASS: {
        id: 1,
        name: "Herbe",
        material: "GRASS",
        texture: "/textures/grass_side.png",
        solid: true
    },

    DIRT: {
        id: 2,
        name: "Terre",
        material: "DIRT",
        texture: "/textures/dirt.png",
        solid: true
    },

    STONE: {
        id: 3,
        name: "Pierre",
        material: "STONE",
        texture: "/textures/stone.png",
        solid: true
    },

    OAK_LOG: {
        id: 4,
        name: "Bûche de chêne",
        material: "OAK_LOG",
        texture: "/textures/oak_log.png",
        solid: true
    },

    OAK_PLANKS: {
        id: 5,
        name: "Planches de chêne",
        material: "OAK_PLANKS",
        texture: "/textures/oak_planks.png",
        solid: true
    },

    OAK_LEAVES: {
        id: 6,
        name: "Feuilles de chêne",
        material: "OAK_LEAVES",
        texture: "/textures/oak_leaves.png",
        solid: true,
        transparent: true
    },

    SAND: {
        id: 7,
        name: "Sable",
        material: "SAND",
        texture: "/textures/sand.png",
        solid: true
    },

    SNOW: {
        id: 8,
        name: "Neige",
        material: "SNOW",
        texture: "/textures/snow.png",
        solid: true
    },

    COAL_ORE: {
        id: 9,
        name: "Minerai de charbon",
        material: "COAL_ORE",
        texture: "/textures/coal_ore.png",
        solid: true
    },

    IRON_ORE: {
        id: 10,
        name: "Minerai de fer",
        material: "IRON_ORE",
        texture: "/textures/iron_ore.png",
        solid: true
    },

    COPPER_ORE: {
        id: 11,
        name: "Minerai de cuivre",
        material: "COPPER_ORE",
        texture: "/textures/copper_ore.png",
        solid: true
    },

    GOLD_ORE: {
        id: 12,
        name: "Minerai d'or",
        material: "GOLD_ORE",
        texture: "/textures/gold_ore.png",
        solid: true
    },

    DIAMOND_ORE: {
        id: 13,
        name: "Minerai de diamant",
        material: "DIAMOND_ORE",
        texture: "/textures/diamond_ore.png",
        solid: true
    },

    CRAFTING_TABLE: {
        id: 14,
        name: "Table de craft",
        material: "CRAFTING_TABLE",
        texture: "/textures/crafting_table_front.png",
        solid: true
    }
};

export function getBlockById(id) {
    return Object.values(BLOCK).find(
        block => block.id === id
    ) || null;
}
