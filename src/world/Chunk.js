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
    BLOCK_MATERIALS.DIAMOND_ORE  // 14
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
        // Dessus et dessous
        if (normal[1] !== 0) return 15;

        // Côtés
        return 16;
    }
    return 2;
    
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
    for (let x = 0; x < Chunk.SIZE; x++) {
        for (let z = 0; z < Chunk.SIZE; z++) {

            const worldX = this.chunkX * Chunk.SIZE + x;
            const worldZ = this.chunkZ * Chunk.SIZE + z;

            for (let y = 0; y < Chunk.HEIGHT; y++) {

                const terrainBlock = this.world.generator.getBlock(
                    worldX,
                    y,
                    worldZ
                );

                let blockId = terrainBlock;

                // Générer les arbres uniquement dans l'air
                if (terrainBlock === BLOCK.AIR.id) {
                    blockId = this.treeGenerator.getBlock(
                        worldX,
                        y,
                        worldZ
                    );
                }

                this.setBlock(x, y, z, blockId);
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

        const faces = [


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

                    for (
                        const face
                        of faces
                    ) {


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
    neighbor = this.getBlock(
        neighborX,
        neighborY,
        neighborZ
    );
} else {
    neighbor = this.world.getBlock(
        worldX + dx,
        neighborY,
        worldZ + dz
    );
}

const isLeaves = block === BLOCK.OAK_LEAVES.id;
const neighborIsLeaves = neighbor === BLOCK.OAK_LEAVES.id;

// Air : la face est visible
if (neighbor === BLOCK.AIR.id) {
    // On conserve la face
}
// Feuilles contre feuilles : face inutile
else if (isLeaves && neighborIsLeaves) {
    continue;
}
// Bloc solide contre feuilles : face visible
else if (!isLeaves && neighborIsLeaves) {
    // On conserve la face
}
// Feuilles contre bloc solide : face cachée
else {
    continue;
}

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

                    buffer.positions.push(
                        x + corner[0],
                        y + corner[1],
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



        // ======================================
        // CRÉATION BUFFER GEOMETRY
        // ======================================

const geometry = new THREE.BufferGeometry();

// Tableaux finaux
const positions = [];
const normals = [];
const uvs = [];
const indices = [];

let vertexOffset = 0;

// Fusionner les faces par matériau
materialBuffers.forEach((buffer, materialIndex) => {
    if (buffer.indices.length === 0) {
        return;
    }

    // Début du groupe dans le tableau des indices
    const start = indices.length;

    // Ajouter les sommets
    positions.push(...buffer.positions);
    normals.push(...buffer.normals);
    uvs.push(...buffer.uvs);

    // Décaler les indices pour les nouveaux sommets
    for (const index of buffer.indices) {
        indices.push(index + vertexOffset);
    }

    // Un seul groupe par matériau
    geometry.addGroup(
        start,
        buffer.indices.length,
        materialIndex
    );

    vertexOffset += buffer.positions.length / 3;
});

// Attributs de la géométrie
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

        // ======================================
        // BOUNDING SPHERE
        // ======================================

        geometry.computeBoundingSphere();



        // ======================================
        // CRÉER LE MESH
        // ======================================

        this.mesh =
            new THREE.Mesh(

                geometry,

                CHUNK_MATERIALS

            );


        // ======================================
        // POSITION DU CHUNK
        // ======================================

        this.mesh.position.set(

            this.chunkX *
            Chunk.SIZE,

            0,

            this.chunkZ *
            Chunk.SIZE

        );



        // ======================================
        // RÉFÉRENCE DU CHUNK
        // ======================================

        this.mesh.userData.chunk =
            this;



        // ======================================
        // AJOUT À LA SCÈNE
        // ======================================

        this.scene.add(
            this.mesh
        );

    }

unload() {
    if (this.mesh) {
        this.scene.remove(this.mesh);

        this.mesh.geometry.dispose();

        this.mesh = null;
    }
}

}