import { Chunk } from "./Chunk.js";
import { BLOCK } from "../blocks/BlockTypes.js";
import {WorldGenerator} from "./WorldGenerator.js";


export class World {

    constructor(scene) {

        this.scene = scene;

        this.chunks = new Map();

        this.chunkQueue = [];
        this.queuedChunks = new Set();
        this.chunksPerFrame = 1;
        // Budget de génération par frame, en millisecondes
        this.chunkTimeBudget = 4;

        // Mesures de performance
        this.lastChunkBuildMs = 0;
        this.maxChunkBuildMs = 0;

        this.renderDistance = 3;
        this.unloadDistance = this.renderDistance + 2;

        this.lastPlayerChunkX = null;
        this.lastPlayerChunkZ = null;

        this.seed = Math.floor(Math.random() * 2147483647);
        console.log("🌍 Seed du monde :", this.seed);

        this.generator = new WorldGenerator(this.seed);
            
                this.generateWorld();

            }


    // ==========================================
    // CLE D'UN CHUNK
    // ==========================================

    getChunkKey(x, z) {

        return `${x},${z}`;

    }


    // ==========================================
    // GENERATION DU MONDE
    // ==========================================


generateWorld() {
    // Chunk de départ de la caméra : (20, 20)
    const spawnChunkX = Math.floor(20 / Chunk.SIZE);
    const spawnChunkZ = Math.floor(20 / Chunk.SIZE);

    // Générer immédiatement le chunk de départ
    this.createChunk(spawnChunkX, spawnChunkZ);

    const spawnChunk = this.chunks.get(
        this.getChunkKey(spawnChunkX, spawnChunkZ)
    );

    if (spawnChunk) {
        spawnChunk.buildMesh();
    }

    // Les autres chunks seront générés progressivement
    this.loadChunksAroundPlayer(
        spawnChunkX,
        spawnChunkZ
    );
}



    // ==========================================
    // CREER CHUNK
    // ==========================================

    createChunk(chunkX, chunkZ) {

        const key =
            this.getChunkKey(
                chunkX,
                chunkZ
            );


        if (
            this.chunks.has(key)
        ) {

            return;

        }


        const chunk =
            new Chunk(
                this.scene,
                this,
                chunkX,
                chunkZ
            );


        this.chunks.set(
            key,
            chunk
        );

    }


    // ==========================================
    // TROUVER LE CHUNK D'UN BLOC
    // ==========================================

    getChunkFromWorldPosition(
        worldX,
        worldZ
    ) {

        const chunkX =
            Math.floor(
                worldX /
                Chunk.SIZE
            );


        const chunkZ =
            Math.floor(
                worldZ /
                Chunk.SIZE
            );


        const key =
            this.getChunkKey(
                chunkX,
                chunkZ
            );


        return this.chunks.get(key);

    }


    // ==========================================
    // WORLD → LOCAL
    // ==========================================

    worldToLocal(
        worldX,
        worldZ
    ) {

        let x =
            worldX %
            Chunk.SIZE;

        let z =
            worldZ %
            Chunk.SIZE;


        // JavaScript donne des modulo
        // négatifs pour les nombres négatifs.

        if (x < 0) {

            x += Chunk.SIZE;

        }


        if (z < 0) {

            z += Chunk.SIZE;

        }


        return {
            x,
            z
        };

    }


    // ==========================================
    // RECUPERER BLOC
    // ==========================================

    getBlock(
        worldX,
        y,
        worldZ
    ) {

        if (
            y < 0 ||
            y >= Chunk.HEIGHT
        ) {

            return BLOCK.AIR.id;

        }


        const chunk =
            this.getChunkFromWorldPosition(
                worldX,
                worldZ
            );


        if (!chunk) {

            return BLOCK.AIR.id;

        }


        const local =
            this.worldToLocal(
                worldX,
                worldZ
            );


        return chunk.getBlock(
            local.x,
            y,
            local.z
        );

    }


    // ==========================================
    // SOLIDE ?
    // ==========================================

isSolidBlock(x, y, z) {
    const block = this.getBlock(x, y, z);

    return (
        block !== BLOCK.AIR.id &&
        block !== BLOCK.WATER.id
    );
}

setBlock(
    worldX,
    y,
    worldZ,
    blockId
) {

    if (
        y < 0 ||
        y >= Chunk.HEIGHT
    ) {

        return false;

    }


    const chunk =
        this.getChunkFromWorldPosition(
            worldX,
            worldZ
        );


    if (!chunk) {

        return false;

    }


    const local =
        this.worldToLocal(
            worldX,
            worldZ
        );


    chunk.setBlock(
        local.x,
        y,
        local.z,
        blockId
    );


    // Reconstruit le chunk
    chunk.buildMesh();


    // Si le bloc est sur une frontière,
    // le chunk voisin doit aussi changer.

    if (local.x === 0) {

        this.rebuildChunk(
            chunk.chunkX - 1,
            chunk.chunkZ
        );

    }


    if (
        local.x ===
        Chunk.SIZE - 1
    ) {

        this.rebuildChunk(
            chunk.chunkX + 1,
            chunk.chunkZ
        );

    }


    if (local.z === 0) {

        this.rebuildChunk(
            chunk.chunkX,
            chunk.chunkZ - 1
        );

    }


    if (
        local.z ===
        Chunk.SIZE - 1
    ) {

        this.rebuildChunk(
            chunk.chunkX,
            chunk.chunkZ + 1
        );

    }


    return true;

}

rebuildChunk(
    chunkX,
    chunkZ
) {

    const key =
        this.getChunkKey(
            chunkX,
            chunkZ
        );


    const chunk =
        this.chunks.get(key);


    if (!chunk) {

        return;

    }


    chunk.buildMesh();

}

removeBlock(
    x,
    y,
    z
) {

    return this.setBlock(
        x,
        y,
        z,
        BLOCK.AIR.id
    );

}

addBlock(
    x,
    y,
    z,
    blockId
) {

    // Il y a déjà quelque chose

    if (
        this.getBlock(
            x,
            y,
            z
        ) !== BLOCK.AIR.id
    ) {

        return false;

    }


    return this.setBlock(
        x,
        y,
        z,
        blockId
    );

}


update(playerPosition) {
    const chunkX = Math.floor(
        playerPosition.x / Chunk.SIZE
    );

    const chunkZ = Math.floor(
        playerPosition.z / Chunk.SIZE
    );

    if (
        chunkX !== this.lastPlayerChunkX ||
        chunkZ !== this.lastPlayerChunkZ
    ) {
        this.lastPlayerChunkX = chunkX;
        this.lastPlayerChunkZ = chunkZ;

        // Supprimer les anciennes demandes
        this.chunkQueue = [];
        this.queuedChunks.clear();

        // Préparer les nouveaux chunks
        this.loadChunksAroundPlayer(chunkX, chunkZ);

        this.unloadDistantChunks(chunkX, chunkZ);
    }

    // Un seul nouveau chunk par frame
    this.processChunkQueue(playerPosition);
}



loadChunksAroundPlayer(centerChunkX, centerChunkZ) {
    const pending = [];

    for (
        let x = -this.renderDistance;
        x <= this.renderDistance;
        x++
    ) {
        for (
            let z = -this.renderDistance;
            z <= this.renderDistance;
            z++
        ) {
            const chunkX = centerChunkX + x;
            const chunkZ = centerChunkZ + z;

            const key = this.getChunkKey(chunkX, chunkZ);

            if (
                this.chunks.has(key) ||
                this.queuedChunks.has(key)
            ) {
                continue;
            }

            pending.push({
                chunkX,
                chunkZ,
                distance: x * x + z * z
            });
        }
    }

    pending.sort((a, b) => a.distance - b.distance);

    for (const chunk of pending) {
        this.queueChunk(chunk.chunkX, chunk.chunkZ);
    }
}


unloadDistantChunks(playerChunkX, playerChunkZ) {
    for (const [key, chunk] of this.chunks) {
        const dx = Math.abs(chunk.chunkX - playerChunkX);
        const dz = Math.abs(chunk.chunkZ - playerChunkZ);

        if (
            dx > this.unloadDistance ||
            dz > this.unloadDistance
        ) {
            chunk.unload();
            this.chunks.delete(key);
        }
    }
}

setRenderDistance(distance) {
    const value = Math.max(2, Math.min(12, Math.floor(distance)));

    if (value === this.renderDistance) return;

    this.renderDistance = value;
    this.unloadDistance = value + 2;

    // Force le rechargement des chunks au prochain update()
    this.lastPlayerChunkX = null;
    this.lastPlayerChunkZ = null;
}


queueChunk(chunkX, chunkZ) {
    const key = this.getChunkKey(chunkX, chunkZ);

    if (
        this.chunks.has(key) ||
        this.queuedChunks.has(key)
    ) {
        return;
    }

    this.chunkQueue.push({ chunkX, chunkZ });
    this.queuedChunks.add(key);
}



processChunkQueue(playerPosition) {
    const centerX = Math.floor(
        playerPosition.x / Chunk.SIZE
    );

    const centerZ = Math.floor(
        playerPosition.z / Chunk.SIZE
    );

    const frameStart = performance.now();
    let processed = 0;

    while (
        processed < this.chunksPerFrame &&
        this.chunkQueue.length > 0
    ) {
        // Ne pas commencer un autre chunk
        // si le budget de temps est déjà dépassé
        if (
            processed > 0 &&
            performance.now() - frameStart >= this.chunkTimeBudget
        ) {
            break;
        }

        const next = this.chunkQueue.shift();

        const key = this.getChunkKey(
            next.chunkX,
            next.chunkZ
        );

        this.queuedChunks.delete(key);

        // Ignorer les chunks trop éloignés
        if (
            Math.abs(next.chunkX - centerX) > this.renderDistance ||
            Math.abs(next.chunkZ - centerZ) > this.renderDistance
        ) {
            continue;
        }

        if (this.chunks.has(key)) {
            continue;
        }

        const start = performance.now();

        this.createChunk(next.chunkX, next.chunkZ);

        const chunk = this.chunks.get(key);

        if (chunk) {
            chunk.buildMesh();
        }

        const duration = performance.now() - start;

        this.lastChunkBuildMs = duration;
        this.maxChunkBuildMs = Math.max(
            this.maxChunkBuildMs,
            duration
        );

        processed++;
    }
}


}