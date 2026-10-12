import { createNoise2D }
from "simplex-noise";

import alea
from "alea";

import { BLOCK }
from "../blocks/BlockTypes.js";


export class WorldGenerator {

    constructor(seed = "minecraft-threejs") {

        this.seed = seed;

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

        if (y > height) {

            return BLOCK.AIR.id;

        }


        // Surface

        if (y === height) {

            return BLOCK.GRASS.id;

        }


        // Terre

        if (
            y >=
            height - 3
        ) {

            return BLOCK.DIRT.id;

        }


        // Tout le reste

        return BLOCK.STONE.id;

    }

}