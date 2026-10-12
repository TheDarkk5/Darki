import * as THREE from "three";

import { BLOCK } from "../blocks/BlockTypes.js";


export class BlockInteraction {

    constructor(
        camera,
        world,
        scene,
        player,
        hotbar,
        inventory
    ) {

        this.camera = camera;
        this.world = world;
        this.scene = scene;
        this.player = player;

        this.hotbar = hotbar;
        this.inventory = inventory;

        this.maxDistance = 5;


        // =========================
        // RAYCASTER
        // =========================

        this.raycaster =
            new THREE.Raycaster();

        this.raycaster.far =
            this.maxDistance;


        this.center =
            new THREE.Vector2(
                0,
                0
            );


        this.target = null;


        // =========================
        // CONTOUR
        // =========================

        const geometry =
            new THREE.BoxGeometry(
                1.01,
                1.01,
                1.01
            );


        const edges =
            new THREE.EdgesGeometry(
                geometry
            );


        const material =
            new THREE.LineBasicMaterial({
                color: 0x000000
            });


        this.outline =
            new THREE.LineSegments(
                edges,
                material
            );


        this.outline.visible =
            false;


        this.scene.add(
            this.outline
        );


        this.initEvents();

    }


    // ==========================================
    // EVENEMENTS
    // ==========================================

    initEvents() {

        window.addEventListener(
            "mousedown",
            (event) => {

                if (
                    document.pointerLockElement
                    === null
                ) {

                    return;

                }


                // Gauche
                if (event.button === 0) {

                    this.breakBlock();

                }


                // Droit
                if (event.button === 2) {

                    this.placeBlock();

                }

            }
        );


        window.addEventListener(
            "contextmenu",
            (event) => {

                event.preventDefault();

            }
        );

    }


    // ==========================================
    // RECUPERER LES MESHES
    // ==========================================

    getChunkMeshes() {

        const meshes = [];


        for (
            const chunk
            of this.world.chunks.values()
        ) {

            if (chunk.mesh) {

                meshes.push(
                    chunk.mesh
                );

            }

        }


        return meshes;

    }


    // ==========================================
    // UPDATE
    // ==========================================

    update() {

        this.raycaster.setFromCamera(
            this.center,
            this.camera
        );


        const intersections =
            this.raycaster.intersectObjects(
                this.getChunkMeshes(),
                false
            );


        if (
            intersections.length === 0
        ) {

            this.clearTarget();

            return;

        }


        const hit =
            intersections[0];


        if (
            !hit.face ||
            hit.distance >
            this.maxDistance
        ) {

            this.clearTarget();

            return;

        }


        // =========================
        // NORMALE
        // =========================

        const normal =
            hit.face.normal.clone();


        // =========================
        // BLOC TOUCHE
        // =========================

        // On se déplace légèrement
        // à l'intérieur du bloc.

        const insidePoint =
            hit.point.clone().addScaledVector(
                normal,
                -0.01
            );


        const blockX =
            Math.floor(
                insidePoint.x
            );

        const blockY =
            Math.floor(
                insidePoint.y
            );

        const blockZ =
            Math.floor(
                insidePoint.z
            );


        this.target = {

            x: blockX,
            y: blockY,
            z: blockZ,

            normal: normal

        };


        // =========================
        // CONTOUR
        // =========================

        this.outline.position.set(

            blockX + 0.5,
            blockY + 0.5,
            blockZ + 0.5

        );


        this.outline.visible =
            true;

    }


    // ==========================================
    // EFFACER CIBLE
    // ==========================================

    clearTarget() {

        this.target = null;

        this.outline.visible =
            false;

    }


    // ==========================================
    // CASSER
    // ==========================================

breakBlock() {
    if (!this.target || !this.player.controls.isLocked) {
        return;
    }

    const { x, y, z } = this.target;
    const blockId = this.world.getBlock(x, y, z);

    if (blockId == null || blockId === BLOCK.AIR.id) {
        return;
    }

    // Ne pas casser si l'inventaire est plein
    if (this.inventory.storage.addItem(blockId, 1) > 0) {
        return;
    }

    this.world.removeBlock(x, y, z);

    this.inventory.updateUI();
    this.hotbar.updateUI();
    this.clearTarget();
}

    // ==========================================
    // PLACER
    // ==========================================

placeBlock() {
    if (!this.target || !this.player.controls.isLocked) {
        return;
    }

    const x = this.target.x + Math.round(this.target.normal.x);
    const y = this.target.y + Math.round(this.target.normal.y);
    const z = this.target.z + Math.round(this.target.normal.z);

    const slotIndex = this.hotbar.selectedSlot;
    const item = this.inventory.storage.slots[slotIndex];

    if (!item || item.count <= 0) return;

    if (this.world.getBlock(x, y, z) !== BLOCK.AIR.id) {
        return;
    }

    // Consommer l'objet sélectionné
    if (!this.inventory.storage.removeFromSlot(slotIndex, 1)) {
        return;
    }

    this.world.addBlock(x, y, z, item.blockId);

    this.inventory.updateUI();
    this.hotbar.updateUI();
    this.clearTarget();
}



}