
import { getInventoryItem } from "../items/ItemRegistry.js";

const BLOCK_TEXTURES = {
    GRASS: "/textures/grass_top.png",
    DIRT: "/textures/dirt.png",
    STONE: "/textures/stone.png",
    OAK_LOG: "/textures/oak_log.png",
    OAK_PLANKS: "/textures/oak_planks.png",
    OAK_LEAVES: "/textures/oak_leaves.png",
    SAND: "/textures/sand.png",
    SNOW: "/textures/snow.png",
    COAL_ORE: "/textures/coal_ore.png",
    IRON_ORE: "/textures/iron_ore.png",
    COPPER_ORE: "/textures/copper_ore.png",
    GOLD_ORE: "/textures/gold_ore.png",
    DIAMOND_ORE: "/textures/diamond_ore.png"
};

export class Hotbar {
    constructor() {
        this.selectedSlot = 0;
        this.storage = null;

        this.elements = document.querySelectorAll(".hotbar-slot");
        this.blockName = document.getElementById("selected-block-name");

        window.addEventListener("keydown", event => {
            if (/^Digit[1-9]$/.test(event.code)) {
                this.selectSlot(
                    Number(event.code.slice(-1)) - 1
                );
            }
        });

        window.addEventListener("wheel", event => {
            if (
                document.getElementById("inventory")?.style.display === "flex"
            ) {
                return;
            }

            this.selectSlot(
                (
                    this.selectedSlot +
                    (event.deltaY > 0 ? 1 : -1) +
                    9
                ) % 9
            );
        });
    }

    selectSlot(index) {
        if (index < 0 || index > 8) return;

        this.selectedSlot = index;
        this.updateUI();
    }

    getSelectedBlock() {
        const slot = this.storage?.slots[this.selectedSlot];
        if (!slot) return null;

        const item = getInventoryItem(slot.blockId);

        // Un item ne peut pas être placé comme un bloc
        if (!item || item.type !== "block") {
            return null;
        }

        return slot.blockId;
    }

    getSelectedItem() {
        const slot = this.storage?.slots[this.selectedSlot];

        if (!slot) return null;

        return getInventoryItem(slot.blockId);
    }

    updateUI() {
        this.elements.forEach((element, index) => {
            element.classList.toggle(
                "selected",
                index === this.selectedSlot
            );

            const slot = this.storage?.slots[index];
            const item = slot
                ? getInventoryItem(slot.blockId)
                : null;

            element.replaceChildren();

            if (!item) return;

            const texture = item.texture ?? BLOCK_TEXTURES[item.material];
            const createLabel = () => {
                const label = document.createElement("span");
                label.className = "hotbar-item-label";
                label.textContent = item.name;
                return label;
            };

            if (texture) {
                const image = document.createElement("img");
                image.className = "hotbar-item-icon";
                image.alt = item.name;
                image.draggable = false;
                image.addEventListener("error", () => {
                    if (image.parentNode === element) {
                        image.replaceWith(createLabel());
                    }
                }, { once: true });
                image.src = texture;

                element.appendChild(image);
            } else {
                element.appendChild(createLabel());
            }

            if (slot.count > 1) {
                const count = document.createElement("span");
                count.className = "hotbar-item-count";
                count.textContent = slot.count;

                element.appendChild(count);
            }
        });

        const slot = this.storage?.slots[this.selectedSlot];
        const item = slot
            ? getInventoryItem(slot.blockId)
            : null;

        if (this.blockName) {
            this.blockName.textContent = item?.name ?? "";
        }
    }
}
