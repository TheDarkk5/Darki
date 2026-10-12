export class InventoryStorage {
    constructor() {
        this.slots = Array(36).fill(null);
        this.maxStack = 64;
    }

    addItem(blockId, amount = 1) {
        let remaining = amount;

        // Remplir les piles existantes
        for (const slot of this.slots) {
            if (!slot || slot.blockId !== blockId) continue;

            const space = this.maxStack - slot.count;
            const added = Math.min(space, remaining);

            slot.count += added;
            remaining -= added;

            if (remaining === 0) return 0;
        }

        // Utiliser les cases vides
        for (let i = 0; i < this.slots.length; i++) {
            if (this.slots[i] !== null) continue;

            const added = Math.min(this.maxStack, remaining);

            this.slots[i] = {
                blockId,
                count: added
            };

            remaining -= added;

            if (remaining === 0) return 0;
        }

        return remaining;
    }

    getItemCount(blockId) {
        return this.slots.reduce(
            (total, slot) =>
                total + (slot?.blockId === blockId ? slot.count : 0),
            0
        );
    }

    removeItem(blockId, amount = 1) {
        if (this.getItemCount(blockId) < amount) return false;

        let remaining = amount;

        for (let i = 0; i < this.slots.length; i++) {
            const slot = this.slots[i];

            if (!slot || slot.blockId !== blockId) continue;

            const removed = Math.min(slot.count, remaining);

            slot.count -= removed;
            remaining -= removed;

            if (slot.count === 0) this.slots[i] = null;
            if (remaining === 0) break;
        }

        return true;
    }

    removeFromSlot(index, amount = 1) {
        const slot = this.slots[index];

        if (!slot || slot.count < amount) return false;

        slot.count -= amount;

        if (slot.count === 0) this.slots[index] = null;

        return true;
    }
}