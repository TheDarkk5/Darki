import * as THREE from "three";
import "./style.css";

import { World } from "./world/World.js";
import { Player } from "./player/Player.js";
import {BlockInteraction} from "./systems/BlockInteraction.js";
import {Hotbar} from "./ui/Hotbar.js";
import {Inventory} from "./ui/Inventory.js";
import { InventoryStorage } from "./systems/InventoryStorage.js";
import { BLOCK } from "./blocks/BlockTypes.js";
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

const ambientLight =
    new THREE.AmbientLight(
        0xffffff,
        0.7
    );

scene.add(ambientLight);


// ==========================================
// SOLEIL
// ==========================================

const sun =
    new THREE.DirectionalLight(
        0xffffff,
        2
    );

sun.position.set(
    20,
    30,
    20
);

scene.add(sun);


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


const blockInteraction = new BlockInteraction(
        camera,
        world,
        scene,
        player,
        hotbar,
        inventory
);

// inventory.addItem(BLOCK.OAK_LOG.id, 5);

const clock = new THREE.Clock();

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
    optionsMenu.style.display = "flex";
});

// Retour au menu principal
optionsBackButton.addEventListener("click", () => {
    optionsMenu.style.display = "none";
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
    if (event.code === "Escape" && gameStarted) {
        openMainMenu();
    }
});

player.controls.addEventListener("unlock", () => {
    if (gameStarted && !inventory.isOpen) {
        openMainMenu();
    }
});

// ==========================================
// GAME LOOP
// ==========================================

function animate() {

    requestAnimationFrame(
        animate
    );


    const deltaTime =
        Math.min(
            clock.getDelta(),
            0.1
        );

if (gameStarted && !inventory.isOpen) {
    world.update(camera.position);

    if (player.controls.isLocked) {
        player.update(deltaTime);
        blockInteraction.update();
    }
}

    renderer.render(
        scene,
        camera
    );

}
animate();