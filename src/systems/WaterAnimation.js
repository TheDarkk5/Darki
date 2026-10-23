
import {
    waterStillTexture,
    waterFlowTexture,
    WATER_FRAMES
} from "../blocks/BlockMaterials.js";

export class WaterAnimation {
    constructor() {
        this.stillFrame = 0;
        this.flowFrame = 0;

        this.stillTimer = 0;
        this.flowTimer = 0;

        // Eau calme : animation lente
        this.stillFrameDuration = 0.15;

        // Eau courante : animation rapide
        this.flowFrameDuration = 0.08;
    }

    update(deltaTime) {
        this.stillTimer += deltaTime;
        this.flowTimer += deltaTime;

        while (this.stillTimer >= this.stillFrameDuration) {
            this.stillTimer -= this.stillFrameDuration;

            this.stillFrame =
                (this.stillFrame + 1) % WATER_FRAMES;

            waterStillTexture.offset.y =
                1 - (this.stillFrame + 1) / WATER_FRAMES;
        }

        while (this.flowTimer >= this.flowFrameDuration) {
            this.flowTimer -= this.flowFrameDuration;

            this.flowFrame =
                (this.flowFrame + 1) % WATER_FRAMES;

            waterFlowTexture.offset.y =
                1 - (this.flowFrame + 1) / WATER_FRAMES;
        }
    }
}
