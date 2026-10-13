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

        const random =
            alea(seed);

        this.noise2D =
            createNoise2D(random);

    }


    // ==========================================
    // HAUTEUR DU TERRAIN
    // ==========================================

getHeight(worldX, worldZ) {

    // =========================
    // GRANDES FORMES
    // =========================

    const continental =
        this.noise2D(
            worldX * 0.008,
            worldZ * 0.008
        );


    // =========================
    // COLLINES
    // =========================

    const hills =
        this.noise2D(
            worldX * 0.025,
            worldZ * 0.025
        );


    // =========================
    // PETITS DETAILS
    // =========================

    const details =
        this.noise2D(
            worldX * 0.08,
            worldZ * 0.08
        );


   const height =
    48 +
    continental * 18 +
    hills * 9 +
    details * 2.5;

    return Math.floor(
        height
    );

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
        return biome === BIOME.DESERT
            ? BLOCK.SAND.id
            : BLOCK.DIRT.id;
    }

    // Pierre et minerais
    return this.ores.getBlock(x, y, z);
}

}
