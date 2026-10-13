import { BLOCK } from "../blocks/BlockTypes.js";
import { ITEM } from "./ItemTypes.js";

export function getInventoryItem(id) {
    const item = Object.values(ITEM).find(
        item => item.id === id
    );

    if (item) {
        return {
            ...item,
            type: "item"
        };
    }

    const block = Object.values(BLOCK).find(
        block => block.id === id
    );

    if (block && block.id !== BLOCK.AIR.id) {
        return {
            ...block,
            type: "block",
            maxStack: 64
        };
    }

    return null;
}