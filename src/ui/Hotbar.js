
import { getInventoryItem } from "../items/ItemRegistry.js";

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

            const texture = item.texture ?? null;
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
