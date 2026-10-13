
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

const grassTop = loadTexture("/textures/grass_top.png");
const grassSide = loadTexture("/textures/grass_side.png");
const dirt = loadTexture("/textures/dirt.png");
const stone = loadTexture("/textures/stone.png");

const oakTop = loadTexture("/textures/oak_log_top.png");
const oakSide = loadTexture("/textures/oak_log.png");
const oakPlanks = loadTexture("/textures/oak_planks.png");

// Feuilles avec pixels transparents
const oakLeaves = loadTexture("/textures/oak_leaves.png");

const sand = loadTexture("/textures/sand.png");
const snow = loadTexture("/textures/snow.png");

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
    alphaTest: 0.5,
    side: THREE.DoubleSide,
    depthWrite: true
});

const sandMaterial = new THREE.MeshLambertMaterial({
    map: sand
});

const snowMaterial = new THREE.MeshLambertMaterial({
    map: snow
});
// ================================
// BLOCS
// ================================

export const BLOCK_MATERIALS = {
    GRASS: [
        grassSideMaterial,
        grassSideMaterial,
        grassTopMaterial,
        dirtMaterial,
        grassSideMaterial,
        grassSideMaterial
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
    SNOW: snowMaterial 
};
