
import { CraftingSystem } from "../systems/CraftingSystem.js";

export class CraftingTable {
    constructor(inventory) {
        this.inventory = inventory;
        this.crafting = new CraftingSystem(3);
        this.grid = Array(9).fill(null);
        this.isOpen = false;

        this.element = document.getElementById("crafting-table-menu");

        this.slots = this.element.querySelectorAll(
            ".table-craft-slot:not(#table-craft-result)"
        );

        this.resultSlot = document.getElementById("table-craft-result");

        this.inventoryGrid = document.getElementById("table-inventory-grid");
        this.hotbarGrid = document.getElementById("table-hotbar-grid");

        this.inventorySlots = [];
        this.hotbarSlots = [];

        this.createInventorySlots();
        this.setupEvents();
    }

    createInventorySlots() {
        const createSlot = (container, index) => {
            const element = document.createElement("div");
            element.className = "table-inventory-slot";

            element.addEventListener("contextmenu", event => {
                event.preventDefault();
            });

            element.addEventListener("mousedown", event => {
                if (!this.isOpen) return;
                if (event.button !== 0 && event.button !== 2) return;

                event.preventDefault();

                this.inventory.handleSlot(index, event.button);
                this.updateUI();
            });

            container.appendChild(element);
            return element;
        };

        for (let i = 9; i < 36; i++) {
            this.inventorySlots.push(
                createSlot(this.inventoryGrid, i)
            );
        }

        for (let i = 0; i < 9; i++) {
            this.hotbarSlots.push(
                createSlot(this.hotbarGrid, i)
            );
        }
    }

    setupEvents() {
        this.slots.forEach((element, index) => {
            element.addEventListener("contextmenu", event => {
                event.preventDefault();
            });

            element.addEventListener("mousedown", event => {
                if (!this.isOpen) return;
                if (event.button !== 0 && event.button !== 2) return;

                event.preventDefault();

                const cursor = this.inventory.cursorItem;
                const current = this.grid[index];

                if (current !== null) {
                    if (cursor && cursor.blockId !== current) return;

                    if (!cursor) {
                        this.inventory.cursorItem = {
                            blockId: current,
                            count: 1
                        };
                    } else {
                        if (
                            cursor.count >=
                            this.inventory.getMaxStack(current)
                        ) return;

                        cursor.count++;
                    }

                    this.grid[index] = null;
                } else if (cursor) {
                    this.grid[index] = cursor.blockId;
                    cursor.count--;

                    if (cursor.count <= 0) {
                        this.inventory.cursorItem = null;
                    }
                }

                this.updateUI();
            });
        });

        this.resultSlot.addEventListener("contextmenu", event => {
            event.preventDefault();
        });

        this.resultSlot.addEventListener("mousedown", event => {
            if (!this.isOpen || event.button !== 0) return;

            event.preventDefault();

            const result = this.crafting.getResult(this.grid);
            if (!result) return;

            const cursor = this.inventory.cursorItem;
            const maxStack = this.inventory.getMaxStack(result.blockId);

            if (result.count > maxStack) return;

            if (cursor) {
                if (cursor.blockId !== result.blockId) return;
                if (cursor.count + result.count > maxStack) return;

                cursor.count += result.count;
            } else {
                this.inventory.cursorItem = { ...result };
            }

            // Consommer les ingrédients
            this.grid.fill(null);
            this.updateUI();
        });
  
    }

    open() {
        if (this.isOpen || this.inventory.isOpen) return;

        this.isOpen = true;
        this.inventory.isOpen = true;

        if (this.inventory.player.controls.isLocked) {
            this.inventory.player.controls.unlock();
        }

        this.element.style.display = "flex";
        this.inventory.element.style.display = "none";

        this.updateUI();
    }

    close() {
        if (!this.isOpen) return;

        const inventory = this.inventory;

        // Retourner l'objet tenu au stockage
        if (inventory.cursorItem) {
            const remaining = inventory.storage.addItem(
                inventory.cursorItem.blockId,
                inventory.cursorItem.count
            );

            if (remaining > 0) {
                inventory.cursorItem.count = remaining;
                this.updateUI();
                return;
            }

            inventory.cursorItem = null;
        }

        // Retourner les ingrédients de la grille
        for (let i = 0; i < this.grid.length; i++) {
            const id = this.grid[i];
            if (id === null) continue;

            const remaining = inventory.storage.addItem(id, 1);

            if (remaining === 0) {
                this.grid[i] = null;
            }
        }

        // Ne pas fermer si l'inventaire est plein
        if (this.grid.some(id => id !== null)) {
            this.updateUI();
            return;
        }

        this.isOpen = false;
        inventory.isOpen = false;

        this.element.style.display = "none";
        inventory.element.style.display = "none";

        inventory.updateUI();
        inventory.player.controls.lock();
    }

    updateUI() {
        const inventory = this.inventory;

        this.slots.forEach((element, index) => {
            const id = this.grid[index];

            inventory.renderItem(
                element,
                id === null ? null : {
                    blockId: id,
                    count: 1
                }
            );
        });

        inventory.renderItem(
            this.resultSlot,
            this.crafting.getResult(this.grid)
        );

        this.inventorySlots.forEach((element, index) => {
            inventory.renderItem(
                element,
                inventory.storage.slots[index + 9]
            );
        });

        this.hotbarSlots.forEach((element, index) => {
            inventory.renderItem(
                element,
                inventory.storage.slots[index]
            );
        });

        inventory.updateUI();
    }
}
