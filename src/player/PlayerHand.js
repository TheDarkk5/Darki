import * as THREE from "three";

export class PlayerHand {
    constructor(camera) {
        this.camera = camera;

        this.group = new THREE.Group();

        // Matériau de la peau
        const skinMaterial = new THREE.MeshLambertMaterial({
            color: 0xd9a066
        });

        // Bras cubique
        const geometry = new THREE.BoxGeometry(
            0.3,
            0.75,
            0.3
        );

        this.arm = new THREE.Mesh(
            geometry,
            skinMaterial
        );

        this.group.add(this.arm);

        // Position de la main à droite
        this.group.position.set(
            0.65,
            -0.65,
            -1
        );

        this.group.rotation.set(
            -0.35,
            0,
            -0.25
        );

        this.camera.add(this.group);

        this.swingTime = 0;
        this.swingDuration = 0.25;
    }

    swing() {
        this.swingTime = this.swingDuration;
    }

    update(deltaTime) {
        if (this.swingTime > 0) {
            this.swingTime = Math.max(
                0,
                this.swingTime - deltaTime
            );

            const progress =
                1 - this.swingTime / this.swingDuration;

            const swing =
                Math.sin(progress * Math.PI);

            this.group.rotation.x =
                -0.35 - swing * 0.9;

            this.group.rotation.z =
                -0.25 + swing * 0.35;
        } else {
            this.group.rotation.x = -0.35;
            this.group.rotation.z = -0.25;
        }
    }
}