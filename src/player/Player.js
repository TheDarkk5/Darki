import * as THREE from "three";

import { PointerLockControls }
from "three/addons/controls/PointerLockControls.js";


export class Player {

    constructor(camera, domElement, world) {

        this.camera = camera;
        this.world = world;

        this.controls =
            new PointerLockControls(
                camera,
                domElement
            );


        // =========================
        // TAILLE DU JOUEUR
        // =========================

 this.height = 2;
this.radius = 0.3;

        // =========================
        // POSITION DE DEPART
        // =========================

const spawnX = 8;
const spawnZ = 8;
const spawnY = this.findSafeSpawn(spawnX, spawnZ);

this.camera.position.set(
    spawnX + 0.5,
    spawnY + this.height,
    spawnZ + 0.5
);


        // =========================
        // DEPLACEMENT
        // =========================

        this.speed = 5;
        this.sprintSpeed = 8;

        this.keys = {

            forward: false,
            backward: false,
            left: false,
            right: false,
            sprint: false

        };


        // =========================
        // PHYSIQUE
        // =========================

        this.velocity =
            new THREE.Vector3();

        this.gravity = 25;

        this.jumpForce = 9;

        this.onGround = false;


        // =========================
        // INTERFACE
        // =========================

        this.instructions =
            document.getElementById(
                "instructions"
            );


        this.controls.addEventListener(
            "lock",
            () => {

                if (this.instructions) {

                    this.instructions.style.display =
                        "none";

                }

            }
        );


        this.controls.addEventListener(
            "unlock",
            () => {

                if (this.instructions) {

                    this.instructions.style.display =
                        "block";

                }

            }
        );


        this.initControls();
        
this.controls.addEventListener("unlock", () => {
    Object.keys(this.keys).forEach(key => {
        this.keys[key] = false;
    });

    this.velocity.y = 0;
});

    }


    // ==========================================
    // CONTROLES
    // ==========================================

    initControls() {

        document.addEventListener("keydown", (event) => {
            if(!this.controls.isLocked) return;
                switch (event.code) {

                    case "KeyZ":

                        this.keys.forward = true;

                        break;


                    case "KeyS":

                        this.keys.backward = true;

                        break;


                    case "KeyQ":

                        this.keys.left = true;

                        break;


                    case "KeyD":

                        this.keys.right = true;

                        break;


                    case "ShiftLeft":

                        this.keys.sprint = true;

                        break;


                    case "Space":

                        if (this.onGround) {

                            this.velocity.y =
                                this.jumpForce;

                            this.onGround = false;

                        }

                        break;

                }

            }
        );


        document.addEventListener(
            "keyup",
            (event) => {

                switch (event.code) {

                    case "KeyZ":

                        this.keys.forward = false;

                        break;


                    case "KeyS":

                        this.keys.backward = false;

                        break;


                    case "KeyQ":

                        this.keys.left = false;

                        break;


                    case "KeyD":

                        this.keys.right = false;

                        break;


                    case "ShiftLeft":

                        this.keys.sprint = false;

                        break;

                }

            });

    }


    // ==========================================
    // UPDATE
    // ==========================================

update(deltaTime) {
    if (!this.controls.isLocked) return;

    const dt = Math.min(deltaTime, 0.05);

    this.updateMovement(dt);
    this.updateGravity(dt);
}


    // ==========================================
    // DEPLACEMENT
    // ==========================================

    updateMovement(deltaTime) {

        let speed = this.speed;


        if (this.keys.sprint) {

            speed =
                this.sprintSpeed;

        }


        const distance =
            speed * deltaTime;


        // Sauvegarde ancienne position

        const oldPosition =
            this.camera.position.clone();


        // =========================
        // AVANCER / RECULER
        // =========================

        if (this.keys.forward) {

            this.controls.moveForward(
                distance
            );

        }


        if (this.keys.backward) {

            this.controls.moveForward(
                -distance
            );

        }


        // Vérification collision

        if (this.checkCollision()) {

            this.camera.position.x =
                oldPosition.x;

            this.camera.position.z =
                oldPosition.z;

        }


        // Nouvelle sauvegarde

        const positionBeforeSide =
            this.camera.position.clone();


        // =========================
        // GAUCHE / DROITE
        // =========================

        if (this.keys.left) {

            this.controls.moveRight(
                -distance
            );

        }


        if (this.keys.right) {

            this.controls.moveRight(
                distance
            );

        }


        if (this.checkCollision()) {

            this.camera.position.x =
                positionBeforeSide.x;

            this.camera.position.z =
                positionBeforeSide.z;

        }

    }


    // ==========================================
    // GRAVITE
    // ==========================================

updateGravity(deltaTime) {
    const dt = Math.min(deltaTime, 0.05);

    this.velocity.y -= this.gravity * dt;

    const oldY = this.camera.position.y;
    const targetY = oldY + this.velocity.y * dt;

    // Sous-étapes pour éviter de traverser un bloc
    const steps = Math.max(
        1,
        Math.ceil(Math.abs(targetY - oldY) / 0.1)
    );

    const stepY = (targetY - oldY) / steps;

    this.onGround = false;

    for (let i = 0; i < steps; i++) {
        this.camera.position.y += stepY;

        if (this.checkCollision()) {
            this.camera.position.y -= stepY;

            if (this.velocity.y < 0) {
                this.onGround = true;
            }

            this.velocity.y = 0;
            break;
        }
    }
}


    // ==========================================
    // COLLISION
    // ==========================================

checkCollision() {
    const p = this.camera.position;
    const epsilon = 0.001;

    const minX = Math.floor(p.x - this.radius + epsilon);
    const maxX = Math.floor(p.x + this.radius - epsilon);

    const minY = Math.floor(p.y - this.height + epsilon);
    const maxY = Math.floor(p.y - epsilon);

    const minZ = Math.floor(p.z - this.radius + epsilon);
    const maxZ = Math.floor(p.z + this.radius - epsilon);

    for (let x = minX; x <= maxX; x++) {
        for (let y = minY; y <= maxY; y++) {
            for (let z = minZ; z <= maxZ; z++) {
                if (this.isSolidBlock(x, y, z)) {
                    return true;
                }
            }
        }
    }

    return false;
}


    // ==========================================
    // BLOC SOLIDE ?
    // ==========================================

isSolidBlock(x, y, z) {

    return this.world.isSolidBlock(
        x,
        y,
        z
    );

}

findSafeSpawn(x, z) {
    const height = this.world.generator.getHeight(x, z);

    for (let y = height + 1; y < 64 - this.height; y++) {
        let free = true;

        for (let offset = 0; offset < Math.ceil(this.height); offset++) {
            if (this.world.isSolidBlock(x, y + offset, z)) {
                free = false;
                break;
            }
        }

        if (
            free &&
            this.world.isSolidBlock(x, y - 1, z)
        ) {
            return y;
        }
    }

    return height + 1;
}

}
