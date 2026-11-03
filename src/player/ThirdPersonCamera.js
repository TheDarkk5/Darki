
import * as THREE from "three";

export class ThirdPersonCamera {
    constructor(camera, playerModel, world) {
        this.camera = camera;
        this.playerModel = playerModel;
        this.world = world;
        this.eyePosition = new THREE.Vector3();

        // 0 = Première personne
        // 1 = Troisième personne arrière
        // 2 = Troisième personne avant
        this.mode = 0;

        this.distance = 4;
        this.height = 0.2;

        this.raycaster = new THREE.Raycaster();
    }
    
    setEyePosition(position) {
    this.eyePosition.copy(position);
}

    switchMode() {
        this.mode = (this.mode + 1) % 3;

        this.playerModel.group.visible = this.mode !== 0;

        console.log("Mode caméra :", this.mode);
    }

    update(playerPosition, yaw, pitch) {
        // La caméra doit déjà être positionnée
        // au niveau des yeux par Player.js.

        if (this.mode === 0) {
            return;
        }

        const eyePosition = playerPosition.clone();

        const direction = new THREE.Vector3(
            -Math.sin(yaw) * Math.cos(pitch),
            Math.sin(pitch),
            -Math.cos(yaw) * Math.cos(pitch)
        );

        // Derrière ou devant le joueur
        const sign = this.mode === 1 ? -1 : 1;

        const targetPosition = eyePosition.clone()
            .addScaledVector(direction, sign * this.distance);

        targetPosition.y += this.height;

        // Positionner la caméra
        this.camera.position.copy(targetPosition);

        // Regarder le joueur
        this.camera.lookAt(eyePosition);
    }
}
