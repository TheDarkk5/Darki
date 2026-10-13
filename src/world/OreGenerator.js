
import { BLOCK } from "../blocks/BlockTypes.js";

export class OreGenerator {
    constructor(seed) {
        this.seed = seed;
        this.ores = [
            { id: BLOCK.COAL_ORE.id, minY: 5, maxY: 55, chance: 0.35, radius: 2 },
            { id: BLOCK.IRON_ORE.id, minY: 5, maxY: 45, chance: 0.25, radius: 2 },
            { id: BLOCK.COPPER_ORE.id, minY: 10, maxY: 50, chance: 0.30, radius: 2 },
            { id: BLOCK.GOLD_ORE.id, minY: 5, maxY: 30, chance: 0.12, radius: 1.5 },
            { id: BLOCK.DIAMOND_ORE.id, minY: 1, maxY: 18, chance: 0.06, radius: 1.3 }
        ];

        this.cellSize = 8;
    }

    random(x, y, z, salt = 0) {
        let n = this.seed | 0;
        n = Math.imul(n ^ x, 374761393);
        n = Math.imul(n ^ y, 668265263);
        n = Math.imul(n ^ z, 1274126177);
        n = Math.imul(n ^ salt, 1597334677);
        n ^= n >>> 16;

        return (n >>> 0) / 4294967296;
    }

    getBlock(x, y, z) {
        const size = this.cellSize;

        const cx = Math.floor(x / size);
        const cy = Math.floor(y / size);
        const cz = Math.floor(z / size);

        for (let oreIndex = this.ores.length - 1; oreIndex >= 0; oreIndex--) {
            const ore = this.ores[oreIndex];

            if (y < ore.minY || y > ore.maxY) continue;

            for (let dx = -1; dx <= 1; dx++) {
                for (let dy = -1; dy <= 1; dy++) {
                    for (let dz = -1; dz <= 1; dz++) {
                        const gx = cx + dx;
                        const gy = cy + dy;
                        const gz = cz + dz;

                        if (this.random(gx, gy, gz, oreIndex * 10) > ore.chance) {
                            continue;
                        }

                        const centerX = gx * size +
                            this.random(gx, gy, gz, oreIndex * 10 + 1) * size;

                        const centerY = gy * size +
                            this.random(gx, gy, gz, oreIndex * 10 + 2) * size;

                        const centerZ = gz * size +
                            this.random(gx, gy, gz, oreIndex * 10 + 3) * size;

                        const distance =
                            ((x - centerX) / ore.radius) ** 2 +
                            ((y - centerY) / ore.radius) ** 2 +
                            ((z - centerZ) / ore.radius) ** 2;

                        if (distance <= 1) {
                            return ore.id;
                        }
                    }
                }
            }
        }

        return BLOCK.STONE.id;
    }
}
