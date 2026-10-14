import { BLOCK } from "../blocks/BlockTypes.js";
import { getInventoryItem } from "../items/ItemRegistry.js";
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
        this.inventoryHotbar = document.querySelectorAll(".inventory-hotbar-slot");
        this.craftSlots = document.querySelectorAll(
            ".craft-slot[data-craft]"
        );
        this.resultSlot = document.getElementById("craft-result");

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
        const bindSlot = (element, index) => {
            element.addEventListener("mousedown", event => {
                if (!this.isOpen || (event.button !== 0 && event.button !== 2)) return;
                event.preventDefault();
                this.handleSlot(index, event.button);
            });
            element.addEventListener("contextmenu", event => event.preventDefault());
        };

        // 27 emplacements principaux (9–35) et 9 emplacements de hotbar (0–8).
        this.slots.forEach((element, index) => bindSlot(element, index + 9));
        this.hotbar.elements.forEach((element, index) => bindSlot(element, index));
        this.inventoryHotbar.forEach((element, index) => bindSlot(element, index));
    }

    getMaxStack(blockId) {
        const maxStack = getInventoryItem(blockId)?.maxStack ?? 64;
        return Number.isInteger(maxStack) && maxStack > 0 ? maxStack : 64;
    }

    handleSlot(index, button) {
        if (!this.isOpen || (button !== 0 && button !== 2)) return;
        if (!Number.isInteger(index) || index < 0 || index >= 36) return;
        const slot = this.storage.slots[index];

        if (button === 0) {
            // Clic gauche
            if (!this.cursorItem) {
                if (!slot) return;

                this.cursorItem = slot;
                this.storage.slots[index] = null;
            } else if (!slot) {
                const moved = Math.min(
                    this.getMaxStack(this.cursorItem.blockId),
                    this.cursorItem.count
                );
                this.storage.slots[index] = { ...this.cursorItem, count: moved };
                this.cursorItem.count -= moved;
                if (this.cursorItem.count === 0) this.cursorItem = null;
            } else if (slot.blockId === this.cursorItem.blockId) {
                const space = Math.max(0, this.getMaxStack(slot.blockId) - slot.count);
                const moved = Math.min(space, this.cursorItem.count);

                slot.count += moved;
                this.cursorItem.count -= moved;

                if (this.cursorItem.count === 0) {
                    this.cursorItem = null;
                }
            } else {
                if (this.cursorItem.count > this.getMaxStack(this.cursorItem.blockId)) return;
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
                slot.count < this.getMaxStack(slot.blockId)
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
            element.addEventListener("contextmenu", event => event.preventDefault());
            element.addEventListener("mousedown", event => {
                if (!this.isOpen || (event.button !== 0 && event.button !== 2)) return;

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
                    } else if (this.cursorItem.count < this.getMaxStack(current)) {
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

        this.resultSlot?.addEventListener("contextmenu", event => event.preventDefault());
        this.resultSlot?.addEventListener("mousedown", event => {
            if (!this.isOpen || event.button !== 0) return;

            event.preventDefault();

            const result = this.crafting.getResult(this.craftGrid);
            if (!result || !Number.isInteger(result.count) || result.count <= 0) return;
            const maxStack = this.getMaxStack(result.blockId);
            if (result.count > maxStack) return;

            if (this.cursorItem) {
                if (this.cursorItem.blockId !== result.blockId) return;
                if (this.cursorItem.count + result.count > maxStack) return;

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
        element.querySelectorAll(".item-icon, .item-count, .item-label")
            .forEach(child => child.remove());
        element.removeAttribute("title");
        if (!item) return;

        const definition = getInventoryItem(item.blockId);
        const name = definition?.name ?? String(item.blockId);
        const texture = definition?.texture ?? null;
        element.title = name;

        const createLabel = () => {
            const label = document.createElement("span");
            label.className = "item-label";
            label.textContent = name;
            return label;
        };

        if (texture) {
            const image = document.createElement("img");
            image.className = "item-icon";
            image.alt = name;
            image.draggable = false;
            image.addEventListener("error", () => {
                if (image.parentNode === element) image.replaceWith(createLabel());
            }, { once: true });
            image.src = texture;
            element.appendChild(image);
        } else {
            element.appendChild(createLabel());
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

        // La hotbar du jeu possède son propre rendu : un seul appel.
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
            if (remaining === 0) this.craftGrid[i] = null;
        }

        return this.craftGrid.every(item => item === null);
    }
}
