import { createNoise2D }
from "simplex-noise";

import alea
from "alea";

import { BLOCK }
from "../blocks/BlockTypes.js";
import { BiomeGenerator, BIOME } from "./BiomeGenerator.js";

export class WorldGenerator {

    constructor(seed = "minecraft-threejs") {

        this.seed = seed;
        this.biomes = new BiomeGenerator(12345);

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
        12 +

        continental * 8 +

        hills * 4 +

        details * 1.5;


    return Math.floor(
        height
    );

}


    // ==========================================
    // TYPE DE BLOC
    // ==========================================

    getBlock(
        worldX,
        y,
        worldZ
    ) {

        const height =
            this.getHeight(
                worldX,
                worldZ
            );


        // Au-dessus du terrain

if (y > height) return BLOCK.AIR.id;

        // Surface

 if (y === height) {
    if (biome === BIOME.DESERT) return BLOCK.SAND.id;
    if (biome === BIOME.SNOW) return BLOCK.SNOW.id;
    if (biome === BIOME.MOUNTAINS) return BLOCK.STONE.id;

    return BLOCK.GRASS.id;
}

        // Terre
        
if (y >= height - 3) {
    return biome === BIOME.DESERT
        ? BLOCK.SAND.id
        : BLOCK.DIRT.id;
}

return BLOCK.STONE.id;

    }

}