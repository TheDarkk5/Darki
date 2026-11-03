
import * as THREE from "three";

export class ThirdPersonCamera {
    constructor(camera, playerModel, world) {
        this.camera = camera;
        this.playerModel = playerModel;
        this.world = world;

        this.mode = 0;
        this.distance = 4;
        this.height = 0.2;

        this.viewCamera = camera.clone();
        this.viewCamera.position.copy(camera.position);

        this.playerModel.group.visible = false;
    }

    switchMode() {
        this.mode = (this.mode + 1) % 3;
        this.playerModel.group.visible = this.mode !== 0;

        return this.mode;
    }

    update() {
        if (this.mode === 0) return;

        const eyePosition = this.camera.position.clone();

        const direction = new THREE.Vector3();
        this.camera.getWorldDirection(direction);

        const sign = this.mode === 1 ? -1 : 1;

        const targetPosition = eyePosition.clone()
            .addScaledVector(direction, sign * this.distance);

        targetPosition.y += this.height;

        this.viewCamera.position.copy(targetPosition);
        this.viewCamera.lookAt(eyePosition);

        this.viewCamera.updateMatrixWorld();
    }

    getActiveCamera() {
        return this.mode === 0
            ? this.camera
            : this.viewCamera;
    }

    resize(aspect) {
        this.viewCamera.aspect = aspect;
        this.viewCamera.updateProjectionMatrix();
    }
}
