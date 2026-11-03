
import * as THREE from "three";

export class PlayerModel {
    constructor(scene, skinPath = "/textures/player/skin.png") {
        this.scene = scene;
        this.group = new THREE.Group();

        const texture = new THREE.TextureLoader().load(skinPath);
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;
        texture.colorSpace = THREE.SRGBColorSpace;

        const material = new THREE.MeshLambertMaterial({
            map: texture,
            transparent: true,
            alphaTest: 0.1
        });

        // Dimensions en pixels du modèle Minecraft
        const atlasSize = 64;

        const makePart = (w, h, d, u, v) => {
            const geometry = new THREE.BoxGeometry(
                w / 16,
                h / 16,
                d / 16
            );

            // UV Minecraft :
            // right, left, top, bottom, front, back
            const faces = [
                [u, v + d, d, h],
                [u + d + w, v + d, d, h],
                [u + d, v, w, d],
                [u + d + w, v, w, d],
                [u + d, v + d, w, h],
                [u + d + w + d, v + d, w, h]
            ];

            const uv = geometry.attributes.uv;

            faces.forEach(([fx, fy, fw, fh], face) => {
                const x0 = fx / atlasSize;
                const x1 = (fx + fw) / atlasSize;

                const y0 = 1 - (fy + fh) / atlasSize;
                const y1 = 1 - fy / atlasSize;

                const index = face * 4;

                uv.setXY(index, x0, y1);
                uv.setXY(index + 1, x1, y1);
                uv.setXY(index + 2, x0, y0);
                uv.setXY(index + 3, x1, y0);
            });

            return new THREE.Mesh(geometry, material);
        };

        // Tête : 8 × 8 × 8
        this.head = makePart(8, 8, 8, 0, 0);
        this.head.position.y = 1.75;

        // Corps : 8 × 12 × 4
        this.body = makePart(8, 12, 4, 16, 16);
        this.body.position.y = 1.125;

        // Bras
        this.leftArm = makePart(4, 12, 4, 32, 48);
        this.rightArm = makePart(4, 12, 4, 40, 16);

        this.leftArm.position.set(0.375, 1.125, 0);
        this.rightArm.position.set(-0.375, 1.125, 0);

        // Jambes
        this.leftLeg = makePart(4, 12, 4, 16, 48);
        this.rightLeg = makePart(4, 12, 4, 0, 16);

        this.leftLeg.position.set(0.125, 0.375, 0);
        this.rightLeg.position.set(-0.125, 0.375, 0);

        this.group.add(
            this.head,
            this.body,
            this.leftArm,
            this.rightArm,
            this.leftLeg,
            this.rightLeg
        );

        this.scene.add(this.group);
    }

    update(position, rotationY = 0) {
        this.group.position.copy(position);
        this.group.rotation.y = rotationY;
    }
}
