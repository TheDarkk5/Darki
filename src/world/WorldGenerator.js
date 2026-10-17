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


getHeight(worldX, worldZ) {
    worldX = Math.floor(worldX);
    worldZ = Math.floor(worldZ);

    const size = this.chunkSize;

    const chunkX = Math.floor(worldX / size);
    const chunkZ = Math.floor(worldZ / size);

    const key = `${chunkX},${chunkZ}`;

    // Récupérer le cache du chunk
    let cache = this.heightCache.get(key);

    if (!cache) {
        cache = new Float32Array(size * size);
        cache.fill(NaN);

        // Limiter la mémoire utilisée
        if (this.heightCache.size >= this.maxCachedChunks) {
            const oldestKey =
                this.heightCache.keys().next().value;

            this.heightCache.delete(oldestKey);
        }

        this.heightCache.set(key, cache);
    }

    // Coordonnées locales, compatibles avec les négatifs
    const localX = worldX - chunkX * size;
    const localZ = worldZ - chunkZ * size;

    const index = localX + localZ * size;

    // Hauteur déjà calculée
    if (!Number.isNaN(cache[index])) {
        return cache[index];
    }

    // Calculer une seule fois
    const height = this.calculateHeight(worldX, worldZ);

    cache[index] = height;

    return height;
}

// Supprimer le cache d'un chunk
clearHeightCache(chunkX, chunkZ) {
    this.heightCache.delete(`${chunkX},${chunkZ}`);
}

// Vider entièrement le cache
clearAllHeightCache() {
    this.heightCache.clear();
}



    // ==========================================
    // TYPE DE BLOC
    // ==========================================

getBlock(x, y, z) {
    if (y < 0 || y >= 128) {
        return BLOCK.AIR.id;
    }

    const biome = this.biomes.getBiome(x, z);
    const height = this.getHeight(x, z);

    // Air au-dessus du terrain
if (y > height) {
    return BLOCK.AIR.id;
}

    // Surface du biome
    if (y === height) {
        if (biome === BIOME.DESERT) return BLOCK.SAND.id;
        if (biome === BIOME.SNOW) return BLOCK.SNOW.id;
        if (biome === BIOME.MOUNTAINS) return BLOCK.STONE.id;

        return BLOCK.GRASS.id;
    }

    // Grottes souterraines
    if (
        y < height - 4 &&
        this.caves.isCave(x, y, z, height)
    ) {
        return BLOCK.AIR.id;
    }

    // Couches proches de la surface
    if (y >= height - 3) {
        if (biome === BIOME.DESERT) return BLOCK.SAND.id;
        if (biome === BIOME.SNOW) return BLOCK.SNOW.id;
        if (biome === BIOME.MOUNTAINS) return BLOCK.STONE.id;

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
