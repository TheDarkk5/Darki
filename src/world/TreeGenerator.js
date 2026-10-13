
import { BLOCK } from "../blocks/BlockTypes.js";

export class TreeGenerator {
    constructor(worldGenerator) {
        this.generator = worldGenerator;
        this.seed = worldGenerator.seed;
        this.spacing = 7;
    }

    random(x, z) {
        let n = Math.imul(x, 374761393)
              + Math.imul(z, 668265263)
              + this.seed;

        n = Math.imul(n ^ (n >>> 13), 1274126177);
        n ^= n >>> 16;

        return (n >>> 0) / 4294967296;
    }

    getTree(x, z) {
        const cellX = Math.floor(x / this.spacing);
        const cellZ = Math.floor(z / this.spacing);

        const baseX = cellX * this.spacing;
        const baseZ = cellZ * this.spacing;

        const treeX = baseX + Math.floor(
            this.random(cellX, cellZ) * this.spacing
        );

        const treeZ = baseZ + Math.floor(
            this.random(cellX + 1000, cellZ) * this.spacing
        );

        if (x !== treeX || z !== treeZ) return null;

        if (this.random(cellX + 2000, cellZ) > 0.55) {
            return null;
        }

        const groundY = this.generator.getHeight(x, z);

        return {
            x,
            y: groundY + 1,
            z,
            height: 4 + Math.floor(
                this.random(cellX + 3000, cellZ) * 3
            )
        };
    }

    getBlock(x, y, z) {
        // Chercher les arbres proches, y compris
        // ceux dont le tronc est dans un autre chunk.
        const cellX = Math.floor(x / this.spacing);
        const cellZ = Math.floor(z / this.spacing);

        let leaves = false;

        for (let cx = cellX - 1; cx <= cellX + 1; cx++) {
            for (let cz = cellZ - 1; cz <= cellZ + 1; cz++) {
                const baseX = cx * this.spacing;
                const baseZ = cz * this.spacing;

                const treeX = baseX + Math.floor(
                    this.random(cx, cz) * this.spacing
                );

                const treeZ = baseZ + Math.floor(
                    this.random(cx + 1000, cz) * this.spacing
                );

                const tree = this.getTree(treeX, treeZ);
                if (!tree) continue;

                const dx = x - tree.x;
                const dz = z - tree.z;
                const top = tree.y + tree.height - 1;

                // Tronc vertical
                if (
                    dx === 0 &&
                    dz === 0 &&
                    y >= tree.y &&
                    y <= top
                ) {
                    return BLOCK.OAK_LOG.id;
                }

                // Couronne de feuilles
                const dy = y - top;

                if (dy >= -2 && dy <= 1) {
                    const radius = dy === 1 ? 1 : 2;

                    if (
                        Math.abs(dx) <= radius &&
                        Math.abs(dz) <= radius
                    ) {
                        // Coins moins réguliers
                        if (
                            Math.abs(dx) === 2 &&
                            Math.abs(dz) === 2 &&
                            this.random(x + y, z) > 0.45
                        ) {
                            continue;
                        }

                        leaves = true;
                    }
                }
            }
        }

        return leaves ? BLOCK.OAK_LEAVES.id : BLOCK.AIR.id;
    }
}
