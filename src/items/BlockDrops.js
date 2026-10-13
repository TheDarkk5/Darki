import { BLOCK } from "../blocks/BlockTypes.js";
import { ITEM } from "./ItemTypes.js";

const DROPS = {
    [BLOCK.COAL_ORE.id]: ITEM.COAL.id,
    [BLOCK.IRON_ORE.id]: ITEM.RAW_IRON.id,
    [BLOCK.COPPER_ORE.id]: ITEM.RAW_COPPER.id,
    [BLOCK.GOLD_ORE.id]: ITEM.RAW_GOLD.id,
    [BLOCK.DIAMOND_ORE.id]: ITEM.DIAMOND.id
};

export function getBlockDrop(blockId) {
    return DROPS[blockId] ?? blockId;
}