
export class MusicSystem {
    constructor() {
        this.tracks = [
            "/sounds/music/music1.mp3",
            "/sounds/music/music2.mp3",
            "/sounds/music/music3.mp3",
            "/sounds/music/music4.mp3"
        ];

        this.audio = new Audio();
        this.audio.volume = 0.3;
        this.audio.preload = "auto";

        this.enabled = true;
        this.currentTrack = null;

        this.minDelay = 30000;
        this.maxDelay = 120000;
        this.timer = null;

        this.audio.addEventListener("ended", () => {
            this.scheduleNext();
        });

        this.audio.addEventListener("error", () => {
            console.warn("Impossible de charger :", this.audio.src);
            this.scheduleNext();
        });
    }

    playRandom() {
        if (!this.enabled || this.tracks.length === 0) return;

        clearTimeout(this.timer);

        const available = this.tracks.filter(
            track => track !== this.currentTrack
        );

        const list = available.length ? available : this.tracks;

        const track = list[Math.floor(Math.random() * list.length)];

        this.currentTrack = track;
        this.audio.src = track;

        this.audio.play().catch(error => {
            console.warn("Lecture audio bloquée :", error.message);
        });
    }

    scheduleNext() {
        clearTimeout(this.timer);

        if (!this.enabled) return;

        const delay = this.minDelay +
            Math.random() * (this.maxDelay - this.minDelay);

        this.timer = setTimeout(() => this.playRandom(), delay);
    }

    start() {
        if (!this.enabled) return;

        if (this.audio.paused && this.audio.src) {
            this.audio.play().catch(() => {});
        } else if (!this.audio.src) {
            this.playRandom();
        }
    }

    stop() {
        this.enabled = false;
        clearTimeout(this.timer);
        this.audio.pause();
        this.audio.currentTime = 0;
    }

    resume() {
        this.enabled = true;
        this.start();
    }

    setVolume(volume) {
        this.audio.volume = Math.max(0, Math.min(1, volume));
    }
}
