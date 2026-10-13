
export class CaveGenerator {
    constructor(seed = 12345) {
        this.seed = seed;

        this.scale = 0.055;
        this.threshold = 0.38;
        this.minY = 5;
        this.maxY = 45;
    }

    hash(x, y, z) {
        let n = this.seed | 0;

        n ^= Math.imul(x, 374761393);
        n ^= Math.imul(y, 668265263);
        n ^= Math.imul(z, 2147483647);

        n = Math.imul(n ^ (n >>> 13), 1274126177);
        n ^= n >>> 16;

        return (n >>> 0) / 4294967295;
    }

    fade(t) {
        return t * t * (3 - 2 * t);
    }

    lerp(a, b, t) {
        return a + (b - a) * t;
    }

    noise(x, y, z) {
        const ix = Math.floor(x);
        const iy = Math.floor(y);
        const iz = Math.floor(z);

        const fx = this.fade(x - ix);
        const fy = this.fade(y - iy);
        const fz = this.fade(z - iz);

        const sample = (dx, dy, dz) =>
            this.hash(ix + dx, iy + dy, iz + dz);

        const x00 = this.lerp(sample(0, 0, 0), sample(1, 0, 0), fx);
        const x10 = this.lerp(sample(0, 1, 0), sample(1, 1, 0), fx);
        const x01 = this.lerp(sample(0, 0, 1), sample(1, 0, 1), fx);
        const x11 = this.lerp(sample(0, 1, 1), sample(1, 1, 1), fx);

        const y0 = this.lerp(x00, x10, fy);
        const y1 = this.lerp(x01, x11, fy);

        return this.lerp(y0, y1, fz);
    }

    isCave(x, y, z, surfaceY) {
        // Pas de grottes au-dessus du terrain
        if (y < this.minY || y > this.maxY) {
            return false;
        }

        // Conserver au moins 5 blocs de terrain au-dessus
        if (y >= surfaceY - 5) {
            return false;
        }

        const n1 = this.noise(
            x * this.scale,
            y * this.scale,
            z * this.scale
        );

        const n2 = this.noise(
            x * this.scale * 1.8 + 100,
            y * this.scale * 1.8 + 100,
            z * this.scale * 1.8 + 100
        );

        // Zones proches du centre du bruit :
        // tunnels et cavernes irréguliers
        const tunnel = Math.abs(n1 - 0.5) < 0.075
            && Math.abs(n2 - 0.5) < 0.11;

        const cavern = n1 > 0.66 && n2 > 0.57;

        return tunnel || cavern;
    }
}
