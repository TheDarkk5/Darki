
import { BLOCK } from "../blocks/BlockTypes.js";
import { ITEM } from "../items/ItemTypes.js";

const registry = new Map();

for (const block of Object.values(BLOCK)) {
    registry.set(block.id, block);
}

for (const item of Object.values(ITEM)) {
    registry.set(item.id, item);
}

export function getObjectById(id) {
    return registry.get(id) || null;
}

export function getObjectTexture(id) {
    return getObjectById(id)?.texture || null;
}
