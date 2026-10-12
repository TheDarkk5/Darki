import { BLOCK } from "../blocks/BlockTypes.js";

export class Hotbar {
    constructor() {
        this.selectedSlot = 0;
        this.storage = null;

        this.elements = document.querySelectorAll(".hotbar-slot");
        this.blockName = document.getElementById("selected-block-name");

        window.addEventListener("keydown", event => {
            if (/^Digit[1-9]$/.test(event.code)) {
                this.selectSlot(Number(event.code.slice(-1)) - 1);
            }
        });

        window.addEventListener("wheel", event => {
            if (document.getElementById("inventory")?.style.display === "flex") {
                return;
            }

            this.selectSlot(
                (this.selectedSlot + (event.deltaY > 0 ? 1 : -1) + 9) % 9
            );
        });
    }

    selectSlot(index) {
        if (index < 0 || index > 8) return;

        this.selectedSlot = index;
        this.updateUI();
    }

    getSelectedBlock() {
        return this.storage?.slots[this.selectedSlot]?.blockId ?? null;
    }

    updateUI() {
        this.elements.forEach((element, index) => {
            element.classList.toggle("selected", index === this.selectedSlot);
        });

        const item = this.storage?.slots[this.selectedSlot];

        this.blockName.textContent = item
            ? Object.values(BLOCK).find(block => block.id === item.blockId)?.name ?? `Bloc ${item.blockId}`
            : "";
    }
}