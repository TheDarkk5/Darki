
import { BLOCK } from "../blocks/BlockTypes.js";
import { ITEM } from "./ItemTypes.js";

const registry = new Map();

for (const block of Object.values(BLOCK)) {
    registry.set(block.id, {
        ...block,
        type: "block",
        maxStack: 64
    });
}

for (const item of Object.values(ITEM)) {
    registry.set(item.id, {
        ...item,
        type: "item"
    });
}

export function getInventoryItem(id) {
    return registry.get(id) ?? null;
}

export function getItemTexture(id) {
    return getInventoryItem(id)?.texture ?? null;
}
