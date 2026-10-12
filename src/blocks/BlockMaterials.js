import * as THREE from "three";

const loader = new THREE.TextureLoader();

function loadTexture(path) {

    const texture = loader.load(path);

    // Aspect pixelisé façon Minecraft
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;

    // Nos PNG contiennent des couleurs
    texture.colorSpace = THREE.SRGBColorSpace;

    return texture;
}


// ================================
// TEXTURES
// ================================

const grassTop = loadTexture(
    "/textures/grass_top.png"
);

const grassSide = loadTexture(
    "/textures/grass_side.png"
);

const dirt = loadTexture(
    "/textures/dirt.png"
);

const stone = loadTexture(
    "/textures/stone.png"
);

const oakTop = loadTexture(
    "/textures/oak_log_top.png"
);

const oakSide = loadTexture(
    "/textures/oak_log.png"
);
const oakplanks = loadTexture(
    "/textures/oak_planks.png"
);
// ================================
// MATERIALS
// ================================

const grassTopMaterial =
    new THREE.MeshLambertMaterial({
        map: grassTop
    });

const grassSideMaterial =
    new THREE.MeshLambertMaterial({
        map: grassSide
    });

const dirtMaterial =
    new THREE.MeshLambertMaterial({
        map: dirt
    });

const stoneMaterial =
    new THREE.MeshLambertMaterial({
        map: stone
    });

const oakTopMaterial =
    new THREE.MeshLambertMaterial({
        map: oakTop
    });

const oakSideMaterial =
    new THREE.MeshLambertMaterial({
        map: oakSide
    });
    const oakplanksMaterial =
    new THREE.MeshLambertMaterial({
        map: oakplanks
    });
// ================================
// BLOCS
// ================================

export const BLOCK_MATERIALS = {
    GRASS: [
        // droite
        grassSideMaterial,
        // gauche
        grassSideMaterial,
        // dessus
        grassTopMaterial,
        // dessous
        dirtMaterial,
        // devant
        grassSideMaterial,
        // derrière
        grassSideMaterial
    ],
    DIRT: dirtMaterial,
    STONE: stoneMaterial,
    OAK_LOG: [
            // droite
            oakSideMaterial,
            // gauche
            oakSideMaterial,
            // dessus
            oakTopMaterial,
            // dessous
            oakTopMaterial,
            // devant
            oakSideMaterial,
            // derrière
            oakSideMaterial
        ],
    OAK_PLANKS: oakplanksMaterial,

};