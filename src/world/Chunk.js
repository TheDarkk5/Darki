import * as THREE from "three";

import {
    BLOCK
} from "../blocks/BlockTypes.js";

import {
    BLOCK_MATERIALS
} from "../blocks/BlockMaterials.js";


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
];




export class Chunk {

    static SIZE = 16;
    static HEIGHT = 64;


    constructor(
        scene,
        world,
        chunkX,
        chunkZ
    ) {

        this.scene = scene;

        this.world = world;

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

        for (
            let x = 0;
            x < Chunk.SIZE;
            x++
        ) {

            for (
                let z = 0;
                z < Chunk.SIZE;
                z++
            ) {


                // ======================================
                // POSITION MONDIALE
                // ======================================

                const worldX =
                    this.chunkX *
                    Chunk.SIZE +
                    x;


                const worldZ =
                    this.chunkZ *
                    Chunk.SIZE +
                    z;



                // ======================================
                // GÉNÉRER LA COLONNE
                // ======================================

                for (
                    let y = 0;
                    y < Chunk.HEIGHT;
                    y++
                ) {


                    const blockId =
                        this.world
                            .generator
                            .getBlock(
                                worldX,
                                y,
                                worldZ
                            );


                    this.setBlock(
                        x,
                        y,
                        z,
                        blockId
                    );

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

        const positions = [];

        const normals = [];

        const uvs = [];

        const indices = [];

        const groups = [];


        let vertexIndex = 0;



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

                        const neighbor =
                            this.world
                                .getBlock(
                                    worldX + dx,
                                    y + dy,
                                    worldZ + dz
                                );



                        // ==============================
                        // FACE CACHÉE
                        // ==============================

                        if (
                            neighbor !==
                            BLOCK.AIR.id
                        ) {

                            continue;

                        }



                        // ==============================
                        // SOMMETS
                        // ==============================

                        for (
                            const corner
                            of face.corners
                        ) {

                            positions.push(

                                x +
                                corner[0],

                                y +
                                corner[1],

                                z +
                                corner[2]

                            );


                            normals.push(
                                ...face.normal
                            );

                        }



                        // ==============================
                        // UV
                        // ==============================

                        uvs.push(

                            0, 0,

                            0, 1,

                            1, 1,

                            1, 0

                        );



                        // ==============================
                        // MATERIAL DE LA FACE
                        // ==============================

                        const materialIndex =
                            this.getMaterialIndex(
                                block,
                                face.normal
                            );



                        // ==============================
                        // GROUPE THREE.JS
                        // ==============================

                        groups.push({

                            start:
                                indices.length,

                            count:
                                6,

                            materialIndex:
                                materialIndex

                        });



                        // ==============================
                        // DEUX TRIANGLES
                        // ==============================

                        indices.push(

                            vertexIndex,

                            vertexIndex + 1,

                            vertexIndex + 2,


                            vertexIndex,

                            vertexIndex + 2,

                            vertexIndex + 3

                        );



                        vertexIndex += 4;

                    }

                }

            }

        }



        // ======================================
        // CRÉATION BUFFER GEOMETRY
        // ======================================

        const geometry =
            new THREE.BufferGeometry();



        // ======================================
        // POSITIONS
        // ======================================

        geometry.setAttribute(

            "position",

            new THREE.Float32BufferAttribute(
                positions,
                3
            )

        );



        // ======================================
        // NORMALES
        // ======================================

        geometry.setAttribute(

            "normal",

            new THREE.Float32BufferAttribute(
                normals,
                3
            )

        );



        // ======================================
        // UV
        // ======================================

        geometry.setAttribute(

            "uv",

            new THREE.Float32BufferAttribute(
                uvs,
                2
            )

        );



        // ======================================
        // INDICES
        // ======================================

        geometry.setIndex(
            indices
        );



        // ======================================
        // GROUPES DE MATERIALS
        // ======================================

        geometry.clearGroups();


        for (
            const group
            of groups
        ) {

            geometry.addGroup(

                group.start,

                group.count,

                group.materialIndex

            );

        }



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