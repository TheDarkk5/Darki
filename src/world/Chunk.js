import * as THREE from "three";

import {
    BLOCK
} from "../blocks/BlockTypes.js";

import {
    BLOCK_MATERIALS
} from "../blocks/BlockMaterials.js";

import { TreeGenerator } from "./TreeGenerator.js";
// ==========================================
// MATERIALS UTILISÉS PAR LES CHUNKS
// ==========================================

const CHUNK_MATERIALS = [
    BLOCK_MATERIALS.GRASS[2],   // 0 - Herbe dessus
    BLOCK_MATERIALS.GRASS[0],   // 1 - Herbe côtés
    BLOCK_MATERIALS.DIRT,       // 2 - Terre
    BLOCK_MATERIALS.STONE,      // 3 - Pierre
    BLOCK_MATERIALS.OAK_LOG[2], // 4 - Bois dessus/dessous
    BLOCK_MATERIALS.OAK_LOG[0],  // 5 - Bois côtés
    BLOCK_MATERIALS.OAK_PLANKS,
    BLOCK_MATERIALS.OAK_LEAVES, // 7 - Feuilles de chêne
    BLOCK_MATERIALS.SAND, // index 8
    BLOCK_MATERIALS.SNOW,  // index 9
    BLOCK_MATERIALS.COAL_ORE,    // 10
    BLOCK_MATERIALS.IRON_ORE,    // 11
    BLOCK_MATERIALS.COPPER_ORE,  // 12
    BLOCK_MATERIALS.GOLD_ORE,    // 13
    BLOCK_MATERIALS.DIAMOND_ORE,  // 14
    BLOCK_MATERIALS.CRAFTING_TABLE[0], // 15 - Côtés
    BLOCK_MATERIALS.CRAFTING_TABLE[2], // 16 - Dessus
    BLOCK_MATERIALS.CRAFTING_TABLE[4], // 17 - Devant
    BLOCK_MATERIALS.WATER[0], // 18 - Eau calme
    BLOCK_MATERIALS.WATER[1], // 19 - Eau courante
    BLOCK_MATERIALS.GRAVEL, // 20
    BLOCK_MATERIALS.CLAY,   // 21
];

function createChunkGeometry(materialBuffers, materialIndices) {
    const geometry = new THREE.BufferGeometry();

    const positions = [];
    const normals = [];
    const uvs = [];
    const indices = [];

    let vertexOffset = 0;

    for (const materialIndex of materialIndices) {
        const buffer = materialBuffers[materialIndex];

        if (!buffer || buffer.indices.length === 0) continue;

        const start = indices.length;

        for (const value of buffer.positions) positions.push(value);
        for (const value of buffer.normals) normals.push(value);
        for (const value of buffer.uvs) uvs.push(value);

        for (const index of buffer.indices) {
            indices.push(index + vertexOffset);
        }

        geometry.addGroup(
            start,
            buffer.indices.length,
            materialIndex
        );

        vertexOffset += buffer.positions.length / 3;
    }

    if (indices.length === 0) {
        geometry.dispose();
        return null;
    }

    geometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(positions, 3)
    );

    geometry.setAttribute(
        "normal",
        new THREE.Float32BufferAttribute(normals, 3)
    );

    geometry.setAttribute(
        "uv",
        new THREE.Float32BufferAttribute(uvs, 2)
    );

    geometry.setIndex(indices);
    geometry.computeBoundingSphere();

    return geometry;
}

const CHUNK_FACES = [

            // ==================================
            // DROITE +X
            // ==================================

            {

                direction: [
                    1,
                    0,
                    0
                ],

                normal: [
                    1,
                    0,
                    0
                ],

                corners: [

                    [1, 0, 0],

                    [1, 1, 0],

                    [1, 1, 1],

                    [1, 0, 1]

                ]

            },

            // ==================================
            // GAUCHE -X
            // ==================================

            {

                direction: [
                    -1,
                    0,
                    0
                ],

                normal: [
                    -1,
                    0,
                    0
                ],

                corners: [

                    [0, 0, 1],

                    [0, 1, 1],

                    [0, 1, 0],

                    [0, 0, 0]

                ]

            },

            // ==================================
            // HAUT +Y
            // ==================================

            {

                direction: [
                    0,
                    1,
                    0
                ],

                normal: [
                    0,
                    1,
                    0
                ],

                corners: [

                    [0, 1, 1],

                    [1, 1, 1],

                    [1, 1, 0],

                    [0, 1, 0]

                ]

            },

            // ==================================
            // BAS -Y
            // ==================================

            {

                direction: [
                    0,
                    -1,
                    0
                ],

                normal: [
                    0,
                    -1,
                    0
                ],

                corners: [

                    [0, 0, 0],

                    [1, 0, 0],

                    [1, 0, 1],

                    [0, 0, 1]

                ]

            },

            // ==================================
            // DEVANT +Z
            // ==================================

            {

                direction: [
                    0,
                    0,
                    1
                ],

                normal: [
                    0,
                    0,
                    1
                ],

                corners: [

                    [1, 0, 1],

                    [1, 1, 1],

                    [0, 1, 1],

                    [0, 0, 1]

                ]

            },

            // ==================================
            // DERRIÈRE -Z
            // ==================================

            {

                direction: [
                    0,
                    0,
                    -1
                ],

                normal: [
                    0,
                    0,
                    -1
                ],

                corners: [

                    [0, 0, 0],

                    [0, 1, 0],

                    [1, 1, 0],

                    [1, 0, 0]

                ]

            }

];

export class Chunk {

    static SIZE = 16;
    static HEIGHT = 128;

    constructor(
        scene,
        world,
        chunkX,
        chunkZ
    ) {

    this.scene = scene;

    this.world = world;
    this.treeGenerator = new TreeGenerator(this.world.generator);

    this.chunkX = chunkX;
    this.chunkZ = chunkZ;


// ==========================================
// DONNÉES DES BLOCS
// ==========================================

    this.blocks =
        new Uint8Array(
            Chunk.SIZE *
            Chunk.HEIGHT *
            Chunk.SIZE
        );


    this.mesh = null;
    this.waterMesh = null;


    // Génération des blocs
    this.generate();

}

// ==========================================
// MATERIAL D'UNE FACE
// ==========================================

    getMaterialIndex(blockId, normal) {

    // HERBE
    if (blockId === BLOCK.GRASS.id) {
        if (normal[1] === 1) return 0;
        if (normal[1] === -1) return 2;
        return 1;
    }

    // TERRE
    if (blockId === BLOCK.DIRT.id) {
        return 2;
    }

    // PIERRE
    if (blockId === BLOCK.STONE.id) {
        return 3;
    }

    // BOIS
    if (blockId === BLOCK.OAK_LOG.id) {
        // Dessus et dessous
        if (normal[1] !== 0) return 4;

        // Côtés
        return 5;
    }

 if (blockId === BLOCK.OAK_PLANKS.id) {
        return 6;
    }

    if (blockId === BLOCK.OAK_LEAVES.id) {
        return 7;
    }

    if (blockId === BLOCK.SAND.id) return 8;
    if (blockId === BLOCK.SNOW.id) return 9;
    if (blockId === BLOCK.COAL_ORE.id) return 10;
    if (blockId === BLOCK.IRON_ORE.id) return 11;
    if (blockId === BLOCK.COPPER_ORE.id) return 12;
    if (blockId === BLOCK.GOLD_ORE.id) return 13;
    if (blockId === BLOCK.DIAMOND_ORE.id) return 14;
    if (blockId === BLOCK.CRAFTING_TABLE.id) {
        if (normal[1] === 1) return 16;
        if (normal[2] === 1) return 17;
        return 15;
    }
    if (blockId === BLOCK.WATER.id) {
        // Surface supérieure : eau calme
        if (normal[1] === 1) return 18;

        // Côtés et dessous : eau courante
        return 19;
    }
    if (blockId === BLOCK.GRAVEL.id) return 20;
    if (blockId === BLOCK.CLAY.id) return 21;
}

// ==========================================
// INDEX DU TABLEAU
// ==========================================

    getIndex(
        x,
        y,
        z
    ) {

    return (
        x +
        z * Chunk.SIZE +
        y *
        Chunk.SIZE *
        Chunk.SIZE
    );

    }

// ==========================================
// RÉCUPÉRER UN BLOC
// ==========================================

    getBlock(
        x,
        y,
        z
    ) {

        if (
            x < 0 ||
            x >= Chunk.SIZE ||

            y < 0 ||
            y >= Chunk.HEIGHT ||

            z < 0 ||
            z >= Chunk.SIZE
        ) {

            return BLOCK.AIR.id;

        }

        return this.blocks[
            this.getIndex(
                x,
                y,
                z
            )
        ];

    }

// ==========================================
// MODIFIER UN BLOC
// ==========================================

    setBlock(
        x,
        y,
        z,
        id
    ) {

        if (
            x < 0 ||
            x >= Chunk.SIZE ||

            y < 0 ||
            y >= Chunk.HEIGHT ||

            z < 0 ||
            z >= Chunk.SIZE
        ) {

            return;

        }

        this.blocks[
            this.getIndex(
                x,
                y,
                z
            )
        ] = id;

    }

// ==========================================
// GÉNÉRATION DU CHUNK
// ==========================================


generate() {
    const size = Chunk.SIZE;
    const height = Chunk.HEIGHT;

    const generator = this.world.generator;

    // Récupérer la heightmap complète du chunk
    const heightmap = generator.getChunkHeightmap(
        this.chunkX,
        this.chunkZ
    );

    for (let z = 0; z < size; z++) {
        for (let x = 0; x < size; x++) {

            const worldX = this.chunkX * size + x;
            const worldZ = this.chunkZ * size + z;

            const terrainHeight = heightmap[x + z * size];

            // Stocker directement les blocs
            for (let y = 0; y < height; y++) {

                let blockId = BLOCK.AIR.id;

                if (y <= terrainHeight) {
                    blockId = generator.getBlock(worldX, y, worldZ);
                } else if (y <= generator.seaLevel) {
                    blockId = BLOCK.WATER.id;
                    // Les arbres peuvent dépasser la surface.
                    // On conserve leur génération complète
                    // pour les frontières et les terrains voisins.
                } else {    
                    blockId = this.treeGenerator.getBlock(worldX, y, worldZ);
                }

                const index =
                    x +
                    z * size +
                    y * size * size;

                this.blocks[index] = blockId;
            }
        }
    }
}

    // ==========================================
    // CONSTRUIRE LE MESH
    // ==========================================

    buildMesh() {

        // ======================================
        // SUPPRIMER L'ANCIEN MESH
        // ======================================

        if (
            this.mesh
        ) {

            this.scene.remove(
                this.mesh
            );

            this.mesh
                .geometry
                .dispose();

            this.mesh = null;

        }

if (this.waterMesh) {
    this.scene.remove(this.waterMesh);
    this.waterMesh.geometry.dispose();
    this.waterMesh = null;
}
        // ======================================
        // BUFFER DATA
        // ======================================

 const materialBuffers = CHUNK_MATERIALS.map(() => ({
    positions: [],
    normals: [],
    uvs: [],
    indices: []
}));

        // ======================================
        // DÉFINITION DES 6 FACES
        // ======================================


        // ======================================
        // PARCOURIR TOUS LES BLOCS
        // ======================================

        for (
            let x = 0;
            x < Chunk.SIZE;
            x++
        ) {

            for (
                let y = 0;
                y < Chunk.HEIGHT;
                y++
            ) {

                for (
                    let z = 0;
                    z < Chunk.SIZE;
                    z++
                ) {

                    // ==================================
                    // BLOC ACTUEL
                    // ==================================

                    const block =
                        this.getBlock(
                            x,
                            y,
                            z
                        );


                    // AIR = RIEN À AFFICHER
                    if (
                        block ===
                        BLOCK.AIR.id
                    ) {

                        continue;

                    }

                    // ==================================
                    // POSITION MONDIALE
                    // ==================================

                    const worldX =
                        this.chunkX *
                        Chunk.SIZE +
                        x;


                    const worldZ =
                        this.chunkZ *
                        Chunk.SIZE +
                        z;

                    // ==================================
                    // PARCOURIR LES 6 FACES
                    // ==================================

for (const face of CHUNK_FACES) {

                        const [
                            dx,
                            dy,
                            dz
                        ] = face.direction;

                        // ==============================
                        // BLOC VOISIN
                        // ==============================

const neighborX = x + dx;
const neighborY = y + dy;
const neighborZ = z + dz;

let neighbor;

// Si le bloc voisin est dans le même chunk,
// on évite une recherche dans World.js
if (
    neighborX >= 0 &&
    neighborX < Chunk.SIZE &&
    neighborY >= 0 &&
    neighborY < Chunk.HEIGHT &&
    neighborZ >= 0 &&
    neighborZ < Chunk.SIZE
) {
    neighbor = this.blocks[
        neighborX +
        neighborZ * Chunk.SIZE +
        neighborY * Chunk.SIZE * Chunk.SIZE
    ];
} else {
    neighbor = this.world.getBlock(
        worldX + dx,
        neighborY,
        worldZ + dz
    );
}

const isWater = block === BLOCK.WATER.id;
const neighborIsWater = neighbor === BLOCK.WATER.id;

const isLeaves = block === BLOCK.OAK_LEAVES.id;
const neighborIsLeaves = neighbor === BLOCK.OAK_LEAVES.id;

let visible = false;

if (isWater) {
    if (face.normal[1] === 1) {
        // Dessus : afficher uniquement si le bloc supérieur
        // n'est pas de l'eau
        visible = neighbor !== BLOCK.WATER.id &&
                  neighbor === BLOCK.AIR.id;
    } else if (face.normal[1] === -1) {
        // Dessous : inutile pour le rendu normal
        visible = false;
    } else {
        // Côtés : uniquement contre l'air
        visible = neighbor === BLOCK.AIR.id;
    }
} else if (neighborIsWater) {
    // Garder les faces des blocs solides sous l'eau
    visible = true;
} else if (neighbor === BLOCK.AIR.id) {
    visible = true;
} else if (isLeaves && neighborIsLeaves) {
    visible = false;
} else if (!isLeaves && neighborIsLeaves) {
    visible = true;
}

if (!visible) continue;
// ==============================
// MATERIAL DE LA FACE
// ==============================

const materialIndex =
this.getMaterialIndex(
    block,
    face.normal
    );

const buffer = materialBuffers[materialIndex];
const vertexIndex = buffer.positions.length / 3;

// ==============================
// SOMMETS
// ==============================

for (
    const corner
    of face.corners
) {

    const isWater = block === BLOCK.WATER.id;

const isSurfaceWater =
    isWater &&
    this.world.getBlock(
        worldX,
        y + 1,
        worldZ
    ) !== BLOCK.WATER.id;

const waterOffset =
    isSurfaceWater && corner[1] === 1
        ? -0.12
        : 0;

    buffer.positions.push(
        x + corner[0],
        y + corner[1] + waterOffset,
        z + corner[2]
    );

                    buffer.normals.push(...face.normal);

                        }

                        // ==============================
                        // UV
                        // ==============================

buffer.uvs.push(
    0, 0,
    0, 1,
    1, 1,
    1, 0
);
                        // ==============================
                        // DEUX TRIANGLES
                        // ==============================

buffer.indices.push(
    vertexIndex,
    vertexIndex + 1,
    vertexIndex + 2,

    vertexIndex,
    vertexIndex + 2,
    vertexIndex + 3
);
                    }

                }

            }

        }

const waterMaterialIndices = [18, 19];

const solidMaterialIndices = CHUNK_MATERIALS
    .map((_, index) => index)
    .filter(index => !waterMaterialIndices.includes(index));

const solidGeometry = createChunkGeometry(
    materialBuffers,
    solidMaterialIndices
);

const waterGeometry = createChunkGeometry(
    materialBuffers,
    waterMaterialIndices
);

const offsetX = this.chunkX * Chunk.SIZE;
const offsetZ = this.chunkZ * Chunk.SIZE;

if (solidGeometry) {
    this.mesh = new THREE.Mesh(
        solidGeometry,
        CHUNK_MATERIALS
    );

    this.mesh.position.set(offsetX, 0, offsetZ);
    this.mesh.userData.chunk = this;

    this.scene.add(this.mesh);
}

if (waterGeometry) {
    this.waterMesh = new THREE.Mesh(
        waterGeometry,
        CHUNK_MATERIALS
    );

    this.waterMesh.position.set(offsetX, 0, offsetZ);
    this.waterMesh.renderOrder = 1;
    this.waterMesh.userData.chunk = this;

    this.scene.add(this.waterMesh);
}  
    }

unload() {
    if (this.mesh) {
        this.scene.remove(this.mesh);
        this.mesh.geometry.dispose();
        this.mesh = null;
    }

    if (this.waterMesh) {
        this.scene.remove(this.waterMesh);
        this.waterMesh.geometry.dispose();
        this.waterMesh = null;
    }
}

}