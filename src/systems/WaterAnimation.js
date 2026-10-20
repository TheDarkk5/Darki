
import {
    waterTexture,
    WATER_FRAMES
} from "../blocks/BlockMaterials.js";

export class WaterAnimation {
    constructor() {
        this.frame = 0;
        this.timer = 0;
        this.frameDuration = 0.1;
    }

    update(deltaTime) {
        this.timer += deltaTime;

        while (this.timer >= this.frameDuration) {
            this.timer -= this.frameDuration;

            this.frame =
                (this.frame + 1) % WATER_FRAMES;

            // Les frames sont empilées de haut en bas.
            // Les coordonnées UV de Three.js partent du bas.
            waterTexture.offset.y =
                1 - (this.frame + 1) / WATER_FRAMES;
        }
    }
}
