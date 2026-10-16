
import * as THREE from "three";

export class SkySystem {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;

        this.group = new THREE.Group();
        this.scene.add(this.group);

        // Distance visuelle des astres
        this.distance = 250;

this.sun = this.createCelestialBody("sun", 22);
this.moon = this.createCelestialBody("moon", 16);

        // Étoiles
        this.stars = this.createStars(600);

        this.group.add(this.sun);
        this.group.add(this.moon);
        this.group.add(this.stars);
    }

createCelestialBody(type, size) {
    const canvas = document.createElement("canvas");
    canvas.width = 16;
    canvas.height = 16;

    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;

    if (type === "sun") {
        // Halo extérieur
        ctx.fillStyle = "#ffdf65";
        ctx.fillRect(1, 1, 14, 14);

        // Surface du soleil
        ctx.fillStyle = "#fff4a3";
        ctx.fillRect(3, 3, 10, 10);

        // Centre lumineux
        ctx.fillStyle = "#fffbd9";
        ctx.fillRect(5, 5, 6, 6);
    } else {
        // Lune
        ctx.fillStyle = "#b9c4d8";
        ctx.fillRect(1, 1, 14, 14);

        ctx.fillStyle = "#e0e7f2";
        ctx.fillRect(3, 3, 10, 10);

        // Cratères
        ctx.fillStyle = "#98a8c1";
        ctx.fillRect(4, 5, 3, 3);
        ctx.fillRect(10, 9, 3, 3);
        ctx.fillRect(8, 3, 2, 2);
    }

    const texture = new THREE.CanvasTexture(canvas);

    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    texture.colorSpace = THREE.SRGBColorSpace;

    const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
        depthTest: false,
        fog: false,
        toneMapped: false
    });

    const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(size, size),
        material
    );

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

this.sun.lookAt(this.group.position);
this.moon.lookAt(this.group.position);
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
