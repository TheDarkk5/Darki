import { createNoise2D }
from "simplex-noise";

import alea
from "alea";

import { BLOCK }
from "../blocks/BlockTypes.js";
import { BiomeGenerator, BIOME } from "./BiomeGenerator.js";
import { OreGenerator } from "./OreGenerator.js";
import { CaveGenerator } from "./CaveGenerator.js";

export class WorldGenerator {

constructor(seed) {
    this.seed = seed;
    this.biomes = new BiomeGenerator(seed);
    this.ores = new OreGenerator(this.seed);
    this.caves = new CaveGenerator(seed);
    this.seaLevel = 48;
    // Cache des hauteurs du terrain
    this.heightCache = new Map();

    // Taille d'un chunk
    this.chunkSize = 16;

    // Nombre maximum de chunks conservés
    this.maxCachedChunks = 256;

        const random =
            alea(seed);

        this.noise2D =
            createNoise2D(random);

    }


    // ==========================================
    // HAUTEUR DU TERRAIN
    // ==========================================


calculateHeight(worldX, worldZ) {

    // ==========================================
    // NOISE ORIGINAL DU TERRAIN
    // ==========================================

    const continental = this.noise2D(
        worldX * 0.008,
        worldZ * 0.008
    );

    const hills = this.noise2D(
        worldX * 0.025,
        worldZ * 0.025
    );

    const details = this.noise2D(
        worldX * 0.08,
        worldZ * 0.08
    );

    const normalHeight =
        48 +
        continental * 18 +
        hills * 9 +
        details * 2.5;

    // ==========================================
    // NOISE DES PLAINES
    // ==========================================

    const plainsHeight =
        48 +
        this.noise2D(
            worldX * 0.006,
            worldZ * 0.006
        ) * 3 +
        hills * 1.5 +
        details * 0.5;

    // ==========================================
    // TRANSITION ENTRE BIOMES
    // ==========================================

    const blendRadius = 12;
    const step = 4;

    let plainsWeight = 0;
    let totalWeight = 0;

    for (let dx = -blendRadius; dx <= blendRadius; dx += step) {
        for (let dz = -blendRadius; dz <= blendRadius; dz += step) {

            const distance = Math.sqrt(dx * dx + dz * dz);

            if (distance > blendRadius) continue;

            const biome = this.biomes.getBiome(
                worldX + dx,
                worldZ + dz
            );

            // Plus un point est proche, plus il compte
            const weight = Math.pow(
                1 - distance / (blendRadius + 1),
                2
            );

            totalWeight += weight;

            if (biome === BIOME.PLAINS) {
                plainsWeight += weight;
            }
        }
    }

    const blend = totalWeight > 0
        ? plainsWeight / totalWeight
        : 0;

    // Mélange progressif des deux reliefs
    const finalHeight =
        normalHeight +
        (plainsHeight - normalHeight) * blend;

    return Math.floor(finalHeight);
}


generateHeightmap(chunkX, chunkZ) {
    const size = this.chunkSize;

    const heightmap = new Int16Array(size * size);

    for (let localZ = 0; localZ < size; localZ++) {
        for (let localX = 0; localX < size; localX++) {

            const worldX = chunkX * size + localX;
            const worldZ = chunkZ * size + localZ;

            const index = localX + localZ * size;

            heightmap[index] = this.calculateHeight(
                worldX,
                worldZ
            );
        }
    }

    return heightmap;
}


getChunkHeightmap(chunkX, chunkZ) {
    const key = `${chunkX},${chunkZ}`;

    let heightmap = this.heightCache.get(key);

    if (!heightmap) {
        heightmap = this.generateHeightmap(chunkX, chunkZ);
    } else {
        // Actualiser l'ordre du cache (LRU)
        this.heightCache.delete(key);
    }

    this.heightCache.set(key, heightmap);

    // Limiter la mémoire utilisée
    if (this.heightCache.size > this.maxCachedChunks) {
        const oldestKey = this.heightCache.keys().next().value;
        this.heightCache.delete(oldestKey);
    }

    return heightmap;
}

getHeight(worldX, worldZ) {
    worldX = Math.floor(worldX);
    worldZ = Math.floor(worldZ);

    const size = this.chunkSize;

    const chunkX = Math.floor(worldX / size);
    const chunkZ = Math.floor(worldZ / size);

    const heightmap = this.getChunkHeightmap(
        chunkX,
        chunkZ
    );

    const localX = worldX - chunkX * size;
    const localZ = worldZ - chunkZ * size;

    return heightmap[localX + localZ * size];
}



// Supprimer le cache d'un chunk
clearHeightCache(chunkX, chunkZ) {
    this.heightCache.delete(`${chunkX},${chunkZ}`);
}

// Vider entièrement le cache
clearAllHeightCache() {
    this.heightCache.clear();
}

getHeightCacheStats() {
    return {
        chunks: this.heightCache.size,
        maxChunks: this.maxCachedChunks,
        columns: this.heightCache.size * 256,
        memoryKB: (
            this.heightCache.size *
            256 *
            Int16Array.BYTES_PER_ELEMENT / 1024
        ).toFixed(1)
    };
}
    // ==========================================
    // TYPE DE BLOC
    // ==========================================
getUnderwaterBlock(x, z) {
    const value = this.noise2D(x * 0.035, z * 0.035);

    if (value < -0.45) {
        return BLOCK.CLAY.id;
    }

    if (value < -0.15) {
        return BLOCK.GRAVEL.id;
    }

    return BLOCK.SAND.id;
}


getBlock(x, y, z) {
    if (y < 0 || y >= 128) {
        return BLOCK.AIR.id;
    }

    const biome = this.biomes.getBiome(x, z);
    const height = this.getHeight(x, z);

    const isUnderwater = height < this.seaLevel;

    // Eau au-dessus du terrain
    if (y > height) {
        return y <= this.seaLevel
            ? BLOCK.WATER.id
            : BLOCK.AIR.id;
    }

    // Grottes souterraines
    if (
        y < height - 4 &&
        this.caves.isCave(x, y, z, height)
    ) {
        return BLOCK.AIR.id;
    }

    // Fond sous-marin
    if (isUnderwater) {
        const depth = height - y;

        // Surface + 3 blocs de profondeur
        if (depth < 3) {
            return this.getUnderwaterBlock(x, z);
        }
    }

    // Surface normale
    if (y === height) {
        if (biome === BIOME.DESERT) {
            return BLOCK.SAND.id;
        }

        if (biome === BIOME.SNOW) {
            return BLOCK.SNOW.id;
        }

        if (biome === BIOME.MOUNTAINS) {
            return BLOCK.STONE.id;
        }

        return BLOCK.GRASS.id;
    }

    // Couches sous la surface
    if (y >= height - 3) {
        if (biome === BIOME.DESERT) {
            return BLOCK.SAND.id;
        }

        if (biome === BIOME.SNOW) {
            return BLOCK.SNOW.id;
        }

        if (biome === BIOME.MOUNTAINS) {
            return BLOCK.STONE.id;
        }

        return BLOCK.DIRT.id;
    }

    // Pierre et minerais
    return this.ores.getBlock(x, y, z);
}


getBiome(x, z) {
    return this.biomes.getBiome(
        Math.floor(x),
        Math.floor(z)
    );
}
}
