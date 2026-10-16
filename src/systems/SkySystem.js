
import * as THREE from "three";

export class SkySystem {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;

        this.group = new THREE.Group();
        this.scene.add(this.group);

        // Distance visuelle des astres
        this.distance = 250;

        // Soleil carré
        this.sun = this.createCelestialBody(
            0xffffcc,
            22
        );

        // Lune carrée
        this.moon = this.createCelestialBody(
            0xdde6ff,
            16
        );

        // Étoiles
        this.stars = this.createStars(600);

        this.group.add(this.sun);
        this.group.add(this.moon);
        this.group.add(this.stars);
    }

    createCelestialBody(color, size) {
        const geometry = new THREE.PlaneGeometry(
            size,
            size
        );

        const material = new THREE.MeshBasicMaterial({
            color,
            side: THREE.DoubleSide,
            depthWrite: false,
            depthTest: false,
            fog: false,
            toneMapped: false
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.renderOrder = -10;

        return mesh;
    }

    createStars(count) {
        const positions = [];

        for (let i = 0; i < count; i++) {
            const theta = Math.random() * Math.PI * 2;
            const z = Math.random() * 2 - 1;
            const r = Math.sqrt(1 - z * z);

            positions.push(
                r * Math.cos(theta) * this.distance,
                z * this.distance,
                r * Math.sin(theta) * this.distance
            );
        }

        const geometry = new THREE.BufferGeometry();

        geometry.setAttribute(
            "position",
            new THREE.Float32BufferAttribute(
                positions,
                3
            )
        );

        const material = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 1.5,
            sizeAttenuation: false,
            transparent: true,
            opacity: 0,
            depthWrite: false,
            depthTest: false,
            fog: false,
            toneMapped: false
        });

        const stars = new THREE.Points(
            geometry,
            material
        );

        stars.renderOrder = -10;

        return stars;
    }

    update(time) {
        const angle = time * Math.PI * 2;

        // Même trajectoire que DayNightCycle
        const x = -Math.sin(angle);
        const y = -Math.cos(angle);

        // Le soleil et la lune sont opposés
        this.sun.position.set(
            x * this.distance,
            y * this.distance,
            0
        );

        this.moon.position.set(
            -x * this.distance,
            -y * this.distance,
            0
        );

        // Orienter les astres vers la caméra
        this.sun.lookAt(0, 0, 0);
        this.moon.lookAt(0, 0, 0);

        // Apparition progressive des étoiles
        const night = THREE.MathUtils.smoothstep(
            -y,
            -0.1,
            0.25
        );

        this.stars.material.opacity = night;
        this.stars.visible = night > 0.01;

        // Garder le ciel centré sur le joueur
        this.group.position.copy(
            this.camera.position
        );
    }
}
