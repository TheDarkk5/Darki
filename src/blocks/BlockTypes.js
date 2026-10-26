
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
        texture: "/textures/blocks/grass_side.png",
        solid: true
    },

    DIRT: {
        id: 2,
        name: "Terre",
        material: "DIRT",
        texture: "/textures/blocks/dirt.png",
        solid: true
    },

    STONE: {
        id: 3,
        name: "Pierre",
        material: "STONE",
        texture: "/textures/blocks/stone.png",
        solid: true
    },

    OAK_LOG: {
        id: 4,
        name: "Bûche de chêne",
        material: "OAK_LOG",
        texture: "/textures/blocks/oak_log.png",
        solid: true
    },

    OAK_PLANKS: {
        id: 5,
        name: "Planches de chêne",
        material: "OAK_PLANKS",
        texture: "/textures/blocks/oak_planks.png",
        solid: true
    },

    OAK_LEAVES: {
        id: 6,
        name: "Feuilles de chêne",
        material: "OAK_LEAVES",
        texture: "/textures/blocks/oak_leaves.png",
        solid: true,
        transparent: true
    },

    SAND: {
        id: 7,
        name: "Sable",
        material: "SAND",
        texture: "/textures/blocks/sand.png",
        solid: true
    },

    SNOW: {
        id: 8,
        name: "Neige",
        material: "SNOW",
        texture: "/textures/blocks/snow.png",
        solid: true
    },

    COAL_ORE: {
        id: 9,
        name: "Minerai de charbon",
        material: "COAL_ORE",
        texture: "/textures/blocks/coal_ore.png",
        solid: true
    },

    IRON_ORE: {
        id: 10,
        name: "Minerai de fer",
        material: "IRON_ORE",
        texture: "/textures/blocks/iron_ore.png",
        solid: true
    },

    COPPER_ORE: {
        id: 11,
        name: "Minerai de cuivre",
        material: "COPPER_ORE",
        texture: "/textures/blocks/copper_ore.png",
        solid: true
    },

    GOLD_ORE: {
        id: 12,
        name: "Minerai d'or",
        material: "GOLD_ORE",
        texture: "/textures/blocks/gold_ore.png",
        solid: true
    },

    DIAMOND_ORE: {
        id: 13,
        name: "Minerai de diamant",
        material: "DIAMOND_ORE",
        texture: "/textures/blocks/diamond_ore.png",
        solid: true
    },

    CRAFTING_TABLE: {
        id: 14,
        name: "Table de craft",
        material: "CRAFTING_TABLE",
        texture: "/textures/blocks/crafting_table_front.png",
        solid: true
    },

    WATER: {
    id: 15,
    name: "Eau"
},

    CLAY: {
        id: 16,
        name: "Argile",
        material: "CLAY",
        texture: "/textures/blocks/clay.png",
        solid: true
    },

    GRAVEL: {
        id: 17,
        name: "Gravier",
        material: "GRAVEL",
        texture: "/textures/blocks/gravel.png",
        solid: true
    }
};

export function getBlockById(id) {
    return Object.values(BLOCK).find(
        block => block.id === id
    ) || null;
}
