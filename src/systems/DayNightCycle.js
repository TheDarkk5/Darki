
import * as THREE from "three";

export class DayNightCycle {
    constructor(scene, sun, ambientLight) {
        this.scene = scene;
        this.sun = sun;
        this.ambientLight = ambientLight;

        // Durée d'une journée complète en secondes
        this.dayDuration = 1200; // 20 minutes

        // Heure initiale : 8 h
        this.time = 8 / 24;

        this.speed = 1;
        this.paused = false;

        this.skyColor = new THREE.Color();
        this.daySky = new THREE.Color(0x87ceeb);
        this.nightSky = new THREE.Color(0x070c20);
        this.sunsetSky = new THREE.Color(0xf18b55);

        this.updateLighting();
    }

    update(deltaTime) {
        if (!this.paused) {
            this.time = (
                this.time +
                (deltaTime * this.speed) / this.dayDuration
            ) % 1;
        }

        this.updateLighting();
    }

    updateLighting() {
        // Midi = soleil au plus haut
        const angle = (this.time - 0.25) * Math.PI * 2;

        const sunHeight = Math.sin(angle);

        this.sun.position.set(
            Math.cos(angle) * 100,
            sunHeight * 100,
            30
        );

        // Luminosité du soleil selon sa hauteur
        const daylight = THREE.MathUtils.smoothstep(
            sunHeight,
            -0.12,
            0.25
        );

        this.sun.intensity = daylight * 2;

        // Lumière ambiante, même pendant la nuit
        this.ambientLight.intensity =
            0.12 + daylight * 0.58;

        // Couleur du ciel
        this.skyColor.copy(this.nightSky);
        this.skyColor.lerp(this.daySky, daylight);

        // Teinte orange près de l'horizon
        const sunset = Math.max(
            0,
            1 - Math.abs(sunHeight) / 0.25
        );

        this.skyColor.lerp(
            this.sunsetSky,
            sunset * 0.65
        );

        this.scene.background.copy(this.skyColor);

        // Ajuster la couleur de la lumière
        this.sun.color.set(0xffffff);
        this.sun.color.lerp(
            new THREE.Color(0xffb36b),
            sunset * 0.6
        );
    }

    getTimeString() {
        const totalMinutes = Math.floor(this.time * 1440);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;

        return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
    }

    setTime(hours) {
        this.time = (((hours % 24) + 24) % 24) / 24;
        this.updateLighting();
    }
}
