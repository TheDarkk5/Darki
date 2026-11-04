
import * as THREE from "three";

export class SkinManager {
    constructor(playerModel) {
        this.playerModel = playerModel;
        this.loader = new THREE.TextureLoader();

        this.skins = {
            steve: "/textures/player/steve.png",
            alex: "/textures/player/alex.png"
        };

        this.currentSkin = "steve";
    }

    applyTexture(texture) {
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;
        texture.colorSpace = THREE.SRGBColorSpace;

        const oldTexture = this.playerModel.head.material.map;

        // Toutes les parties du modèle partagent
        // le même matériau.
        this.playerModel.head.material.map = texture;
        this.playerModel.head.material.needsUpdate = true;

        if (oldTexture && oldTexture !== texture) {
            oldTexture.dispose();
        }
    }

    async setSkin(name) {
        const path = this.skins[name];
        if (!path) return;

        const texture = await this.loader.loadAsync(path);

        this.applyTexture(texture);
        this.currentSkin = name;

        localStorage.setItem("darkcraft-skin", name);
        localStorage.removeItem("darkcraft-custom-skin");
    }

    async importSkin(file) {
        if (!file || file.type !== "image/png") {
            throw new Error("Sélectionne une image PNG.");
        }

        const dataURL = await new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;

            reader.readAsDataURL(file);
        });

        const image = new Image();
        image.src = dataURL;
        await image.decode();

        if (image.width !== 64 || image.height !== 64) {
            throw new Error("Le skin doit mesurer 64 × 64 pixels.");
        }

        const texture = await this.loader.loadAsync(dataURL);

        this.applyTexture(texture);
        this.currentSkin = "custom";

        try {
            localStorage.setItem("darkcraft-custom-skin", dataURL);
            localStorage.setItem("darkcraft-skin", "custom");
        } catch {
            console.warn("Impossible de sauvegarder le skin localement.");
        }
    }

    async loadSavedSkin() {
        const name = localStorage.getItem("darkcraft-skin");

        if (name === "custom") {
            const dataURL = localStorage.getItem(
                "darkcraft-custom-skin"
            );

            if (dataURL) {
                const texture = await this.loader.loadAsync(dataURL);
                this.applyTexture(texture);
                this.currentSkin = "custom";
                return;
            }
        }

        await this.setSkin(this.skins[name] ? name : "steve");
    }
}
