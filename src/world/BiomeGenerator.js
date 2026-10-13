export const BIOME = {
    PLAINS: "PLAINS",
    FOREST: "FOREST",
    DESERT: "DESERT",
    SNOW: "SNOW",
    MOUNTAINS: "MOUNTAINS"
};

export class BiomeGenerator {
    constructor(seed = 12345) {
        this.seed = seed;
        this.scale = 180;
    }

    hash(x, z) {
        let n = Math.imul(x, 374761393)
              + Math.imul(z, 668265263)
              + this.seed;

        n = Math.imul(n ^ (n >>> 13), 1274126177);
        n ^= n >>> 16;

        return (n >>> 0) / 4294967296;
    }

    noise(x, z) {
        const ix = Math.floor(x);
        const iz = Math.floor(z);

        const fx = x - ix;
        const fz = z - iz;

        const sx = fx * fx * (3 - 2 * fx);
        const sz = fz * fz * (3 - 2 * fz);

        const a = this.hash(ix, iz);
        const b = this.hash(ix + 1, iz);
        const c = this.hash(ix, iz + 1);
        const d = this.hash(ix + 1, iz + 1);

        const top = a + (b - a) * sx;
        const bottom = c + (d - c) * sx;

        return top + (bottom - top) * sz;
    }

    getBiome(x, z) {
        const temperature = this.noise(
            x / this.scale,
            z / this.scale
        );

        const humidity = this.noise(
            x / this.scale + 100,
            z / this.scale + 100
        );

        const mountains = this.noise(
            x / this.scale + 300,
            z / this.scale + 300
        );

        if (mountains > 0.76) return BIOME.MOUNTAINS;
        if (temperature < 0.30) return BIOME.SNOW;
        if (temperature > 0.68 && humidity < 0.45) {
            return BIOME.DESERT;
        }
        if (humidity > 0.55) return BIOME.FOREST;

        return BIOME.PLAINS;
    }
}