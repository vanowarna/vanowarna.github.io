/**
 * Film grain: green-tinted per-pixel noise drawn at half resolution over the
 * whole page.
 *
 * The look matches the original effect, but instead of generating fresh
 * noise for every update, a few frames are generated once and then cycled.
 * Per update that leaves a single putImageData call and no allocation.
 */

const FRAME_COUNT = 6;
const UPDATE_EVERY_N_FRAMES = 3; // ~20 updates per second at 60 fps

const noiseFrame = (ctx, width, height) => {
    const image = ctx.createImageData(width, height);
    const data = image.data;
    for (let i = 0; i < data.length; i += 4) {
        const value = 20 + Math.random() * 100;
        data[i] = value * 0.35;
        data[i + 1] = value;
        data[i + 2] = value * 0.2;
        data[i + 3] = 15 + Math.random() * 70;
    }
    return image;
};

/**
 * @param {HTMLCanvasElement} canvas
 * @param {object} options
 * @param {boolean} options.staticFrame  reduced motion: draw one frame, never animate
 */
export const createGrain = (canvas, { staticFrame = false } = {}) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return { setEnabled() {} };

    let frames = [];
    let index = 0;
    let tick = 0;
    let request = 0;
    let running = false;
    let enabled = true;

    const build = () => {
        const width = Math.ceil(window.innerWidth / 2);
        const height = Math.ceil(window.innerHeight / 2);
        canvas.width = width;
        canvas.height = height;
        frames = Array.from({ length: staticFrame ? 1 : FRAME_COUNT }, () => noiseFrame(ctx, width, height));
        ctx.putImageData(frames[0], 0, 0);
    };

    const loop = () => {
        if (!running) return;
        request = requestAnimationFrame(loop);
        tick += 1;
        if (tick % UPDATE_EVERY_N_FRAMES !== 0) return;
        index = (index + 1) % frames.length;
        ctx.putImageData(frames[index], 0, 0);
    };

    const start = () => {
        if (running || !enabled || staticFrame || document.hidden) return;
        running = true;
        loop();
    };

    const stop = () => {
        running = false;
        cancelAnimationFrame(request);
    };

    // Rebuild only once resizing has settled; it reallocates every frame.
    let resizeTimer = 0;
    window.addEventListener("resize", () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (enabled) build();
        }, 200);
    });
    document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));

    build();
    start();

    return {
        setEnabled(on) {
            enabled = on;
            canvas.hidden = !on;
            if (on) {
                build();
                start();
            } else {
                stop();
                frames = []; // release the buffers while switched off
            }
        },
    };
};
