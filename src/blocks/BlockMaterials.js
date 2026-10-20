
import * as THREE from "three";

const loader = new THREE.TextureLoader();

function loadTexture(path) {
    const texture = loader.load(path);

    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    texture.colorSpace = THREE.SRGBColorSpace;

    return texture;
}

// ================================
// TEXTURES
// ================================

const grassTop = loadTexture("/textures/blocks/grass_top.png");
const grassSide = loadTexture("/textures/blocks/grass_side.png");
const dirt = loadTexture("/textures/blocks/dirt.png");
const stone = loadTexture("/textures/blocks/stone.png");

const oakTop = loadTexture("/textures/blocks/oak_log_top.png");
const oakSide = loadTexture("/textures/blocks/oak_log.png");
const oakPlanks = loadTexture("/textures/blocks/oak_planks.png");

// Feuilles avec pixels transparents
const oakLeaves = loadTexture("/textures/blocks/oak_leaves.png");

const sand = loadTexture("/textures/blocks/sand.png");
const snow = loadTexture("/textures/blocks/snow.png");

const craftingTableFront = loadTexture("/textures/blocks/crafting_table_front.png");
const craftingTableSide = loadTexture("/textures/blocks/crafting_table_side.png");
const craftingTableTop = loadTexture("/textures/blocks/crafting_table_top.png");
// ================================
// MATÉRIAUX
// ================================

function createMaterial(texture) {
    return new THREE.MeshLambertMaterial({
        map: texture
    });
}

const grassTopMaterial = createMaterial(grassTop);
grassTopMaterial.color.setHex(0x91bd59);
const grassSideMaterial = createMaterial(grassSide);
const dirtMaterial = createMaterial(dirt);
const stoneMaterial = createMaterial(stone);

const oakTopMaterial = createMaterial(oakTop);
const oakSideMaterial = createMaterial(oakSide);
const oakPlanksMaterial = createMaterial(oakPlanks);


// Feuilles : transparence découpée

const oakLeavesMaterial = new THREE.MeshLambertMaterial({
    map: oakLeaves,
    color: 0x73b644,

    // Transparence découpée
    transparent: false,
    alphaTest: 0.5,

    // Afficher uniquement les faces avant
    side: THREE.FrontSide,

    // Écriture dans le buffer de profondeur
    depthWrite: true
});


const sandMaterial = new THREE.MeshLambertMaterial({
    map: sand
});

const snowMaterial = new THREE.MeshLambertMaterial({
    map: snow
});

const oreMaterial = (name) => new THREE.MeshLambertMaterial({
    map: loadTexture(`/textures/blocks/${name}.png`)
});

const craftingTableTopMaterial = createMaterial(craftingTableTop);
const craftingTableSideMaterial = createMaterial(craftingTableSide);
const craftingTableFrontMaterial = createMaterial(craftingTableFront);

export const waterTexture = new THREE.TextureLoader().load(
    "/textures/blocks/water_flow.png"
);

waterTexture.magFilter = THREE.NearestFilter;
waterTexture.minFilter = THREE.NearestFilter;
waterTexture.wrapS = THREE.RepeatWrapping;
waterTexture.wrapT = THREE.RepeatWrapping;

export const WATER_FRAMES = 32;

waterTexture.repeat.set(1, 1 / WATER_FRAMES);
waterTexture.offset.set(0, 1 - 1 / WATER_FRAMES);

// ================================
// BLOCS
// ================================

export const BLOCK_MATERIALS = {
    GRASS: [
        grassSideMaterial, // Côté
        grassSideMaterial, // Côté
        grassTopMaterial, // Haut
        dirtMaterial, // Bas
        grassSideMaterial, // Côté
        grassSideMaterial  // Côté
    ],

    DIRT: dirtMaterial,

    STONE: stoneMaterial,

    OAK_LOG: [
        oakSideMaterial,
        oakSideMaterial,
        oakTopMaterial,
        oakTopMaterial,
        oakSideMaterial,
        oakSideMaterial
    ],

    OAK_PLANKS: oakPlanksMaterial,

    OAK_LEAVES: oakLeavesMaterial,

    SAND: sandMaterial,
    SNOW: snowMaterial,

    // Minerais
    COAL_ORE: oreMaterial("coal_ore"),
    IRON_ORE: oreMaterial("iron_ore"),
    COPPER_ORE: oreMaterial("copper_ore"),
    GOLD_ORE: oreMaterial("gold_ore"),
    DIAMOND_ORE: oreMaterial("diamond_ore"),

    CRAFTING_TABLE: [
        craftingTableSideMaterial, // Côté
        craftingTableSideMaterial, // Côté  
        craftingTableTopMaterial, // Haut
        craftingTableTopMaterial, // Bas
        craftingTableFrontMaterial, // Côté avant
        craftingTableSideMaterial  // Côté arrière
    ],

WATER: new THREE.MeshLambertMaterial({
    map: waterTexture,
    color: 0x64b9e8,
    transparent: true,
    opacity: 0.88,
    depthWrite: false,
    depthTest: true,
    side: THREE.FrontSide,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1
}),

};
