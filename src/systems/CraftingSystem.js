
import { RECIPES } from "./CraftingRecipes.js";
import { BLOCK } from "../blocks/BlockTypes.js";

export class CraftingSystem {
    constructor(size = 2) {
        this.size = size;
        this.grid = Array(size * size).fill(null);
    }

    setSlot(index, blockId) {
        if (index < 0 || index >= this.grid.length) return;

        this.grid[index] = blockId;
    }

    getBlockName(blockId) {
        if (blockId == null) return null;

        return Object.keys(BLOCK).find(
            key => BLOCK[key].id === blockId
        ) || null;
    }

    getRecipe(grid = this.grid) {
        const size = Math.sqrt(grid.length);

        if (!Number.isInteger(size)) return null;

        const names = grid.map(id => this.getBlockName(id));

        for (const recipe of RECIPES) {
            const pattern = recipe.pattern;

            const height = pattern.length;
            const width = pattern[0].length;

            if (height > size || width > size) continue;

            for (let offsetY = 0; offsetY <= size - height; offsetY++) {
                for (let offsetX = 0; offsetX <= size - width; offsetX++) {
                    let valid = true;

                    for (let y = 0; y < size && valid; y++) {
                        for (let x = 0; x < size; x++) {
                            const px = x - offsetX;
                            const py = y - offsetY;

                            const expected =
                                py >= 0 && py < height &&
                                px >= 0 && px < width
                                    ? pattern[py][px]
                                    : null;

                            if (names[y * size + x] !== expected) {
                                valid = false;
                                break;
                            }
                        }
                    }

                    if (valid) return recipe;
                }
            }
        }

        return null;
    }

    getResult(grid = this.grid) {
        const recipe = this.getRecipe(grid);

        if (!recipe) return null;

        const item = BLOCK[recipe.result.item];

        if (!item) return null;

        return {
            blockId: item.id,
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
