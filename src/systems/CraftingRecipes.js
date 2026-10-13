
export const RECIPES = [
    {
        id: "oak_planks",
        pattern: [
            ["OAK_LOG"]
        ],
        result: {
            item: "OAK_PLANKS",
            count: 4
        }
    },

    {
        id: "crafting_table",
        pattern: [
            ["OAK_PLANKS", "OAK_PLANKS"],
            ["OAK_PLANKS", "OAK_PLANKS"]
        ],
        result: {
            item: "CRAFTING_TABLE",
            count: 1
        }
    },

    {
        id: "stick",
        pattern: [
            ["OAK_PLANKS"],
            ["OAK_PLANKS"]
        ],
        result: {
            item: "STICK",
            count: 4
        }
    },

    {
        id: "wooden_pickaxe",
        pattern: [
            ["OAK_PLANKS", "OAK_PLANKS", "OAK_PLANKS"],
            [null, "STICK", null],
            [null, "STICK", null]
        ],
        result: {
            item: "WOODEN_PICKAXE",
            count: 1
        }
    },

    {
        id: "wooden_axe",
        pattern: [
            ["OAK_PLANKS", "OAK_PLANKS"],
            ["OAK_PLANKS", "STICK"],
            [null, "STICK"]
        ],
        result: {
            item: "WOODEN_AXE",
            count: 1
        }
    },

    {
        id: "wooden_sword",
        pattern: [
            ["OAK_PLANKS"],
            ["OAK_PLANKS"],
            ["STICK"]
        ],
        result: {
            item: "WOODEN_SWORD",
            count: 1
        }
    }
];
