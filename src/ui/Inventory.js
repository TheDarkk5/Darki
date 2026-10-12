import { BLOCK } from "../blocks/BlockTypes.js";
import { CraftingSystem } from "../systems/CraftingSystem.js";

export class Inventory {
    constructor(player, hotbar, storage) {
        this.player = player;
        this.hotbar = hotbar;
        this.storage = storage;

        this.crafting = new CraftingSystem();
        this.craftGrid = [null, null, null, null];

        this.cursorItem = null;
        this.isOpen = false;

        this.element = document.getElementById("inventory");
        this.slots = document.querySelectorAll(".inventory-slot");
        this.inventoryHotbar = document.querySelectorAll(".inventory-hotbar-slot"
);
        this.craftSlots = document.querySelectorAll(
            ".craft-slot[data-craft]"
        );
        this.resultSlot = document.getElementById("craft-result");

        this.textures = {
            [BLOCK.GRASS.id]: "/textures/grass_top.png",
            [BLOCK.DIRT.id]: "/textures/dirt.png",
            [BLOCK.STONE.id]: "/textures/stone.png",
            [BLOCK.OAK_LOG.id]: "/textures/oak_log.png",
            [BLOCK.OAK_PLANKS.id]: "/textures/oak_planks.png"
        };

        this.cursorElement = document.createElement("div");
        this.cursorElement.className = "cursor-item";
        document.body.appendChild(this.cursorElement);

        this.setupKeyboard();
        this.setupSlots();
        this.setupCrafting();
        this.setupCursor();

        this.updateUI();
    }

    setupKeyboard() {
        window.addEventListener("keydown", event => {
            if (event.code !== "KeyE" || event.repeat) return;

            if (this.isOpen) {
                this.close();
            } else {
                this.open();
            }
        });
    }

    open() {
        this.isOpen = true;
        this.element.style.display = "flex";

        if (this.player.controls.isLocked) {
            this.player.controls.unlock();
        }

        this.updateUI();
    }

    close() {
        // Replacer l'objet tenu dans le stockage
        if (this.cursorItem) {
            const remaining = this.storage.addItem(
                this.cursorItem.blockId,
                this.cursorItem.count
            );

            if (remaining > 0) {
                // Garder les objets qui ne rentrent pas
                this.cursorItem.count = remaining;
                this.updateUI();
                return;
            }

            this.cursorItem = null;
        }
if (!this.returnCraftItems()) {
    this.updateUI();
    return;
}
        this.isOpen = false;
        this.element.style.display = "none";
        this.player.controls.lock();
        this.updateUI();
    }

    setupSlots() {
        // Les 27 cases de l'inventaire correspondent aux indices 9 à 35
        this.slots.forEach((element, index) => {
            const storageIndex = index + 9;

            element.addEventListener("mousedown", event => {
                if (event.button !== 0 && event.button !== 2) return;

                event.preventDefault();
                this.handleSlot(storageIndex, event.button);
            });
        });

        // Les 9 cases de la hotbar
        this.hotbar.elements.forEach((element, index) => {
            element.addEventListener("mousedown", event => {
                if (!this.isOpen) return;
                if (event.button !== 0 && event.button !== 2) return;

                event.preventDefault();
                this.handleSlot(index, event.button);
            });

        this.inventoryHotbar.forEach((element, index) => {
    element.addEventListener("mousedown", event => {
        if (event.button !== 0 && event.button !== 2) return;

        event.preventDefault();
        this.handleSlot(index, event.button);
    });

    element.addEventListener("contextmenu", event => {
        event.preventDefault();
    });
});
        });
    }

    handleSlot(index, button) {
        const slot = this.storage.slots[index];

        if (button === 0) {
            // Clic gauche
            if (!this.cursorItem) {
                if (!slot) return;

                this.cursorItem = slot;
                this.storage.slots[index] = null;
            } else if (!slot) {
                this.storage.slots[index] = this.cursorItem;
                this.cursorItem = null;
            } else if (slot.blockId === this.cursorItem.blockId) {
                const space = 64 - slot.count;
                const moved = Math.min(space, this.cursorItem.count);

                slot.count += moved;
                this.cursorItem.count -= moved;

                if (this.cursorItem.count === 0) {
                    this.cursorItem = null;
                }
            } else {
                this.storage.slots[index] = this.cursorItem;
                this.cursorItem = slot;
            }
        }

        if (button === 2) {
            // Clic droit
            if (!this.cursorItem) {
                if (!slot) return;

                const count = Math.ceil(slot.count / 2);

                this.cursorItem = {
                    blockId: slot.blockId,
                    count
                };

                slot.count -= count;

                if (slot.count === 0) {
                    this.storage.slots[index] = null;
                }
            } else if (!slot) {
                this.storage.slots[index] = {
                    blockId: this.cursorItem.blockId,
                    count: 1
                };

                this.cursorItem.count--;
            } else if (
                slot.blockId === this.cursorItem.blockId &&
                slot.count < 64
            ) {
                slot.count++;
                this.cursorItem.count--;
            }

            if (this.cursorItem?.count === 0) {
                this.cursorItem = null;
            }
        }

        this.updateUI();
    }

    setupCrafting() {
        this.craftSlots.forEach((element, index) => {
            element.addEventListener("mousedown", event => {
                if (event.button !== 0 && event.button !== 2) return;

                event.preventDefault();

                const current = this.craftGrid[index];

                if (current !== null) {
                    if (this.cursorItem &&
                        this.cursorItem.blockId !== current) return;

                    if (!this.cursorItem) {
                        this.cursorItem = {
                            blockId: current,
                            count: 1
                        };
                    } else if (this.cursorItem.count < 64) {
                        this.cursorItem.count++;
                    } else {
                        return;
                    }

                    this.craftGrid[index] = null;
                } else if (this.cursorItem) {
                    this.craftGrid[index] = this.cursorItem.blockId;
                    this.cursorItem.count--;

                    if (this.cursorItem.count === 0) {
                        this.cursorItem = null;
                    }
                }

                this.updateUI();
            });
        });

        this.resultSlot?.addEventListener("mousedown", event => {
            if (event.button !== 0) return;

            event.preventDefault();

            const result = this.crafting.getResult(this.craftGrid);
            if (!result) return;

            if (this.cursorItem) {
                if (this.cursorItem.blockId !== result.blockId) return;
                if (this.cursorItem.count + result.count > 64) return;

                this.cursorItem.count += result.count;
            } else {
                this.cursorItem = { ...result };
            }

            this.craftGrid.fill(null);
            this.updateUI();
        });
    }

    setupCursor() {
        window.addEventListener("mousemove", event => {
            this.cursorElement.style.left = `${event.clientX + 8}px`;
            this.cursorElement.style.top = `${event.clientY + 8}px`;
        });
    }

renderItem(element, item) {
    element.querySelectorAll(".item-icon, .item-count")
        .forEach(child => child.remove());

    if (!item) return;

    const texture = this.textures[item.blockId];

    if (texture) {
        const image = document.createElement("img");
        image.src = texture;
        image.className = "item-icon";
        element.appendChild(image);
    }

    if (item.count > 1) {
        const count = document.createElement("span");
        count.className = "item-count";
        count.textContent = item.count;
        element.appendChild(count);
    }
}

    updateUI() {
        // Inventaire
        this.slots.forEach((element, index) => {
            this.renderItem(element, this.storage.slots[index + 9]);
        });

        // Hotbar
        this.hotbar.elements.forEach((element, index) => {
            this.renderItem(element, this.storage.slots[index]);
        });

        // Craft
        this.craftSlots.forEach((element, index) => {
            const blockId = this.craftGrid[index];

            this.renderItem(
                element,
                blockId === null ? null : { blockId, count: 1 }
            );
        });

        // Résultat
        if (this.resultSlot) {
            this.renderItem(
                this.resultSlot,
                this.crafting.getResult(this.craftGrid)
            );
        }

        // Objet sur le curseur
        this.renderItem(this.cursorElement, this.cursorItem);

        this.cursorElement.style.display =
            this.isOpen && this.cursorItem ? "block" : "none";

        this.hotbar.updateUI();

        this.inventoryHotbar.forEach((element, index) => {
    this.renderItem(element, this.storage.slots[index]);
});
    }
   returnCraftItems() {
    for (let i = 0; i < this.craftGrid.length; i++) {
        const blockId = this.craftGrid[i];

        if (blockId === null) continue;

        const remaining = this.storage.addItem(blockId, 1);

        if (remaining === 0) {
            this.craftGrid[i] = null;
        }
    }

    return this.craftGrid.every(item => item === null);
} 
}