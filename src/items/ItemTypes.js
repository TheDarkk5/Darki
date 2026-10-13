export const ITEM = {
    STICK: {
        id: 100,
        name: "Bâton",
        texture: "/textures/items/stick.png",
        maxStack: 64
    },

    COAL: {
        id: 101,
        name: "Charbon",
        texture: "/textures/items/coal.png",
        maxStack: 64
    },

    RAW_IRON: {
        id: 102,
        name: "Fer brut",
        texture: "/textures/items/raw_iron.png",
        maxStack: 64
    },

    RAW_COPPER: {
        id: 103,
        name: "Cuivre brut",
        texture: "/textures/items/raw_copper.png",
        maxStack: 64
    },

    RAW_GOLD: {
        id: 104,
        name: "Or brut",
        texture: "/textures/items/raw_gold.png",
        maxStack: 64
    },

    DIAMOND: {
        id: 105,
        name: "Diamant",
        texture: "/textures/items/diamond.png",
        maxStack: 64
    },

    IRON_INGOT: {
        id: 106,
        name: "Lingot de fer",
        texture: "/textures/items/iron_ingot.png",
        maxStack: 64
    }
};

export function getItemById(id) {
    return Object.values(ITEM).find(item => item.id === id);
}