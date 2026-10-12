import { RECIPES } from "./CraftingRecipes.js";
import { BLOCK } from "../blocks/BlockTypes.js";

export class CraftingSystem {
    constructor() {
        this.grid = Array(4).fill(null);
    }

    setSlot(index, blockId) {
        if (index < 0 || index >= 4) return;

        this.grid[index] = blockId;
    }

    getRecipe(grid = this.grid) {
        const ingredients = {};

        for (const blockId of grid) {
            if (blockId == null) continue;

            const blockName = Object.keys(BLOCK).find(
                key => BLOCK[key].id === blockId
            );

            if (!blockName) return null;

            ingredients[blockName] =
                (ingredients[blockName] || 0) + 1;
        }

        return RECIPES.find(recipe => {
            const required = recipe.ingredients;

            return (
                Object.keys(ingredients).length ===
                Object.keys(required).length &&
                Object.entries(required).every(
                    ([name, count]) =>
                        ingredients[name] === count
                )
            );
        }) || null;
    }

    getResult(grid = this.grid) {
        const recipe = this.getRecipe(grid);

        if (!recipe) return null;

        const block = BLOCK[recipe.result.item];

        // L'objet doit exister dans BlockTypes.js
        if (!block) return null;

        return {
            blockId: block.id,
            count: recipe.result.count
        };
    }

    craft(grid = this.grid) {
        const result = this.getResult(grid);

        if (!result) return null;

        grid.fill(null);

        return result;
    }
}