
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
    // 00:00 = minuit
    // 06:00 = lever du soleil
    // 12:00 = midi
    // 18:00 = coucher du soleil

    const angle = this.time * Math.PI * 2;

    // Soleil au plus haut à midi
    const sunHeight = -Math.cos(angle);

    // Position du soleil
    this.sun.position.set(
        -Math.sin(angle) * 100,
        sunHeight * 100,
        30
    );

    // Luminosité progressive
    const daylight = THREE.MathUtils.smoothstep(
        sunHeight,
        -0.1,
        0.25
    );

    // Soleil
    this.sun.intensity = 2.5 * daylight;

    // Lumière ambiante
    this.ambientLight.intensity =
        0.35 + daylight * 0.65;

    // Couleur du ciel
    this.skyColor.copy(this.nightSky);
    this.skyColor.lerp(this.daySky, daylight);

    // Lever et coucher du soleil
    const sunset = Math.max(
        0,
        1 - Math.abs(sunHeight) / 0.25
    );

    this.skyColor.lerp(
        this.sunsetSky,
        sunset * 0.65
    );

    this.scene.background.copy(this.skyColor);

    // Couleur du soleil
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
