import * as THREE from "three";
import "./style.css";

import { World } from "./world/World.js";
import { Player } from "./player/Player.js";
import {BlockInteraction} from "./systems/BlockInteraction.js";
import {Hotbar} from "./ui/Hotbar.js";
import {Inventory} from "./ui/Inventory.js";
import { InventoryStorage } from "./systems/InventoryStorage.js";
import { BLOCK } from "./blocks/BlockTypes.js";
import { PlayerHand } from "./player/PlayerHand.js";
import { MusicSystem } from "./systems/MusicSystem.js";
import { CraftingTable } from "./ui/CraftingTable.js";
import { BIOME } from "./world/BiomeGenerator.js";
import { DayNightCycle } from "./systems/DayNightCycle.js";
// ==========================================
// SCENE
// ==========================================

const scene = new THREE.Scene();

scene.background =
    new THREE.Color(0x87ceeb);


// ==========================================
// CAMERA
// ==========================================

const camera =
    new THREE.PerspectiveCamera(
        75,
        window.innerWidth /
        window.innerHeight,
        0.1,
        1000
    );

camera.position.set(
    20,
    15,
    20
);

camera.lookAt(
    8,
    3,
    8
);


// ==========================================
// RENDERER
// ==========================================

const renderer =
    new THREE.WebGLRenderer({
        antialias: true
    });

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);

renderer.setPixelRatio(
    Math.min(
        window.devicePixelRatio,
        2
    )
);

document
    .getElementById("game")
    .appendChild(renderer.domElement);


// ==========================================
// LUMIERE AMBIANTE
// ==========================================

const ambientLight = new THREE.AmbientLight(
    0xffffff,
    1
);
scene.add(ambientLight);

// ==========================================
// SOLEIL
// ==========================================

const sun = new THREE.DirectionalLight(
    0xffffff,
    2.5
);
sun.position.set(100, 100, 50);
scene.add(sun);

const dayNightCycle = new DayNightCycle(
    scene,
    sun,
    ambientLight
);
// ==========================================
// MONDE
// ==========================================

const world =
    new World(scene);


// ==========================================
// RESIZE
// ==========================================

window.addEventListener(
    "resize",
    () => {

        camera.aspect =
            window.innerWidth /
            window.innerHeight;

        camera.updateProjectionMatrix();

        renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );

    }
);

// ==========================================
// PLAYER
// ==========================================
const player = new Player(
    camera,
    renderer.domElement,
    world
);

const storage = new InventoryStorage();

const hotbar = new Hotbar();
hotbar.storage = storage;

const inventory = new Inventory(player, hotbar, storage);

// Objets de départ pour tester
storage.addItem(BLOCK.OAK_LOG.id, 5);
storage.addItem(BLOCK.DIRT.id, 32);
storage.addItem(BLOCK.STONE.id, 16);

hotbar.updateUI();
inventory.updateUI();

const hand = new PlayerHand(camera);

const blockInteraction = new BlockInteraction(
        camera,
        world,
        scene,
        player,
        hotbar,
        inventory,
        hand
);

// inventory.addItem(BLOCK.OAK_LOG.id, 5);
const craftingTable = new CraftingTable(inventory);
blockInteraction.setCraftingTable(craftingTable);
document.getElementById("crafting-table-close")
    .addEventListener("click", () => {
        craftingTable.close();
    });

const clock = new THREE.Clock();

// Nécessaire pour afficher les objets attachés à la caméra
scene.add(camera);
// ==========================================
// MENU PRINCIPAL
// ==========================================

const mainMenu =
    document.getElementById(
        "main-menu"
    );

const playButton =
    document.getElementById(
        "play-button"
    );

const quitButton =
    document.getElementById(
        "quit-button"
    );

const crosshair =
    document.getElementById(
        "crosshair"
    );

const instructions =
    document.getElementById(
        "instructions"
    );

const hud =
    document.getElementById(
        "hud"
    );

let gameStarted = false;


// ==========================================
// JOUER
// ==========================================

playButton.addEventListener("click", () => {
        gameStarted = true;

        mainMenu.style.display = "none";
        optionsMenu.style.display = "none";

        hud.style.display = "block";
        crosshair.style.display = "block";
        instructions.style.display = "block";

        player.controls.lock();
    
});

quitButton.addEventListener(
    "click",
    () => {

        alert(
            "Vous pouvez fermer l'onglet."
        );

    }
);


// =================================
// OPTIONS - DISTANCE DE RENDU
// =================================

const optionsMenu = document.getElementById("options-menu");
const optionsButton = document.getElementById("options-button");
const optionsBackButton = document.getElementById("options-back-button");

const renderDistanceSlider = document.getElementById("render-distance");
const renderDistanceValue = document.getElementById("render-distance-value");

// Charger la valeur enregistrée
const savedDistance = Number(localStorage.getItem("renderDistance"));

if (Number.isInteger(savedDistance) && savedDistance >= 2 && savedDistance <= 12) {
    world.setRenderDistance(savedDistance);
}

renderDistanceSlider.value = world.renderDistance;
renderDistanceValue.textContent = world.renderDistance;

// Ouvrir les options
optionsButton.addEventListener("click", () => {
    mainMenu.style.display = "none";
    optionsMenu.style.display = "flex";
});

// Retour au menu principal
optionsBackButton.addEventListener("click", () => {
    optionsMenu.style.display = "none";
    mainMenu.style.display = "flex";
});

// Modifier la distance
renderDistanceSlider.addEventListener("input", (event) => {
    const distance = Number(event.target.value);

    renderDistanceValue.textContent = distance;

    world.setRenderDistance(distance);

    localStorage.setItem("renderDistance", String(distance));
});

function openMainMenu() {
    gameStarted = false;

    mainMenu.style.display = "flex";
    hud.style.display = "none";
    crosshair.style.display = "none";
    instructions.style.display = "none";

    if (player.controls.isLocked) {
        player.controls.unlock();
    }
}

document.addEventListener("keydown", (event) => {
    if (event.code !== "Escape" || !gameStarted) return;

    if (craftingTable.isOpen) {
        craftingTable.close();
        return;
    }

    if (inventory.isOpen) {
        inventory.close();
        return;
    }

    openMainMenu();
});

player.controls.addEventListener("unlock", () => {
    if (gameStarted && !inventory.isOpen) {
        openMainMenu();
    }
});

const music = new MusicSystem();

document.addEventListener("pointerdown", () => {
    music.start();
}, { once: true });


const fpsCounter = document.getElementById("fps-counter");

let fpsFrames = 0;
let fpsLastTime = performance.now();

function updateFPS() {
    fpsFrames++;

    const now = performance.now();
    const elapsed = now - fpsLastTime;

    // Actualisation toutes les 500 ms
    if (elapsed >= 500) {
        const fps = Math.round((fpsFrames * 1000) / elapsed);

        fpsCounter.textContent = `FPS : ${fps}`;

        // Couleur selon les performances
        if (fps >= 55) {
            fpsCounter.style.color = "#55ff55";
        } else if (fps >= 30) {
            fpsCounter.style.color = "#ffff55";
        } else {
            fpsCounter.style.color = "#ff5555";
        }

        fpsFrames = 0;
        fpsLastTime = now;
    }
}


const debugMenu = document.getElementById("debug-menu");

const debugFPS = document.getElementById("debug-fps");
const debugXYZ = document.getElementById("debug-xyz");
const debugBlock = document.getElementById("debug-block");
const debugChunk = document.getElementById("debug-chunk");
const debugFacing = document.getElementById("debug-facing");
const debugBiome = document.getElementById("debug-biome");

let debugVisible = false;

window.addEventListener("keydown", (event) => {
    if (event.key !== "F3" || event.repeat) return;

    event.preventDefault();

    debugVisible = !debugVisible;
    debugMenu.style.display = debugVisible ? "block" : "none";

    document.getElementById("fps-counter").style.display =
        debugVisible ? "none" : "block";
});

const debugDirection = new THREE.Vector3();

function updateDebugMenu(fps) {
    if (!debugVisible) return;

    const position = camera.position;

    const x = position.x;
    const y = position.y;
    const z = position.z;

    debugFPS.textContent = `FPS : ${fps}`;

    debugXYZ.textContent =
        `XYZ : ${x.toFixed(3)} / ${y.toFixed(3)} / ${z.toFixed(3)}`;

    debugBlock.textContent =
        `Block : ${Math.floor(x)} ${Math.floor(y)} ${Math.floor(z)}`;

    const chunkX = Math.floor(x / 16);
    const chunkZ = Math.floor(z / 16);

    debugChunk.textContent = `Chunk : ${chunkX} ${chunkZ}`;

    camera.getWorldDirection(debugDirection);

    const angle = Math.atan2(
        debugDirection.x,
        -debugDirection.z
    );

    const directions = [
        "North (-Z)",
        "East (+X)",
        "South (+Z)",
        "West (-X)"
    ];

    const index =
        ((Math.round(angle / (Math.PI / 2)) % 4) + 4) % 4;

    debugFacing.textContent = `Facing : ${directions[index]}`;

    const biome = world.generator.getBiome(x, z);

     const biomeNames = {
        [BIOME.DESERT]: "Désert",
        [BIOME.SNOW]: "Biome enneigé",
        [BIOME.MOUNTAINS]: "Montagnes",
        [BIOME.PLAINS]: "Plaine",
        [BIOME.FOREST]: "Forêt"
    };


    debugBiome.textContent =
        `Biome : ${biomeNames[biome] ?? biome}`;
}

// ==========================================
// GAME LOOP
// ==========================================


function animate() {
    requestAnimationFrame(animate);

    updateFPS();

    const deltaTime = Math.min(
        clock.getDelta(),
        0.1
    );
    // Cycle jour / nuit
    //dayNightCycle.update(deltaTime);

    // Charger les chunks même depuis le menu principal
    world.update(camera.position);

    if (gameStarted && !inventory.isOpen) {
        if (player.controls.isLocked) {
            player.update(deltaTime);
            hand.update(deltaTime);
            blockInteraction.update();
        }
    }
    updateDebugMenu(Math.round(1 / Math.max(deltaTime, 0.001)));
    renderer.render(scene, camera);
}

animate();

