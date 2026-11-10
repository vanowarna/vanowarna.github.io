/**
 * Background 3D scene: a tilted radar disc with a rotating sweep, plus a
 * drifting particle field. Everything is animated on the GPU (shader
 * uniforms only), so the per-frame JavaScript cost is a handful of
 * assignments regardless of particle count.
 *
 * Loaded lazily by main.js, after the terminal is interactive.
 */

import * as THREE from "../vendor/three.module.min.js";

const TAU = Math.PI * 2;
const MAX_BLIPS = 8;
const SWEEP_SPEED = 0.55; // radians per second
const LOW_POWER_FRAME_SECONDS = 1 / 30; // phones render at 30 fps to save battery
const GREEN = new THREE.Color(0x33ff33);

const radarVertex = /* glsl */ `
    varying vec2 vUv;
    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

const radarFragment = /* glsl */ `
    precision highp float;

    #define TAU 6.28318530718
    #define MAX_BLIPS ${MAX_BLIPS}

    uniform vec3 uColor;
    uniform float uAngle;      // current sweep angle
    uniform float uPing;       // seconds since the last ping (large = none)
    uniform float uLevel;      // soundtrack loudness, 0..1
    uniform int uBlipCount;
    uniform vec2 uBlips[MAX_BLIPS];

    varying vec2 vUv;

    // 1.0 on a line, anti-aliased using screen-space derivatives.
    float stroke(float distance, float width) {
        return 1.0 - smoothstep(0.0, width, distance);
    }

    void main() {
        vec2 p = (vUv - 0.5) * 2.0;
        float r = length(p);
        float angle = atan(p.y, p.x);
        float pixel = fwidth(r);

        // Range rings and bearing spokes.
        float ringDistance = abs(fract(r * 5.0 - 0.5) - 0.5) / 5.0;
        float rings = stroke(ringDistance, pixel * 1.5);
        float spokeDistance = abs(fract(angle / (TAU / 12.0) - 0.5) - 0.5) * (TAU / 12.0) * r;
        float spokes = stroke(spokeDistance, min(fwidth(spokeDistance), 0.01) * 1.5) * step(0.2, r);

        // Sweep: a bright leading edge with a decaying trail behind it.
        float behind = mod(uAngle - angle, TAU);
        float trail = exp(-behind * 1.7);
        float edge = max(stroke(behind * r, pixel * 2.5), stroke((TAU - behind) * r, pixel * 2.0));

        // Blips light up as the sweep passes, then fade until the next pass.
        float blips = 0.0;
        for (int i = 0; i < MAX_BLIPS; i++) {
            if (i >= uBlipCount) break;
            vec2 b = uBlips[i];
            float age = mod(uAngle - atan(b.y, b.x), TAU);
            float glow = 0.12 + exp(-age * 0.8);
            float d = length(p - b);
            blips += (stroke(d, 0.016 + pixel) + exp(-d * 30.0) * 0.7) * glow;
            // Echo ring expanding from a freshly detected blip.
            blips += stroke(abs(d - age * 0.035), pixel * 1.5) * exp(-age * 2.0) * 0.7;
        }

        // Ping: a ring expanding from the centre whenever a command runs.
        float ping = stroke(abs(r - uPing * 0.85), 0.012 + pixel) * exp(-uPing * 1.6);

        float energy = 1.0 + uLevel * 1.4;
        float alpha =
            rings * 0.20 +
            spokes * 0.08 +
            trail * 0.26 * energy +
            edge * 0.6 +
            blips * 0.9 +
            ping * 0.7;

        // Fade out toward the rim so the disc has no hard edge.
        alpha *= smoothstep(1.0, 0.72, r);
        gl_FragColor = vec4(uColor * alpha, alpha);
    }
`;

const particleVertex = /* glsl */ `
    uniform float uTime;
    uniform float uLevel;
    uniform float uPixelRatio;
    attribute float aSeed;
    varying float vAlpha;

    void main() {
        vec3 p = position;
        // Slow, per-particle drift computed entirely in the shader.
        p.x += sin(uTime * 0.11 + aSeed * 31.0) * 0.9;
        p.y += sin(uTime * 0.17 + aSeed * 17.0) * 0.6;
        p.z += cos(uTime * 0.13 + aSeed * 23.0) * 0.9;

        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;

        float twinkle = 0.6 + 0.4 * sin(uTime * 0.9 + aSeed * 90.0);
        vAlpha = twinkle * (0.55 + uLevel * 0.45);
        gl_PointSize = (1.5 + aSeed * 2.5) * (1.0 + uLevel) * uPixelRatio * (14.0 / -mv.z);
    }
`;

const particleFragment = /* glsl */ `
    precision mediump float;
    uniform vec3 uColor;
    varying float vAlpha;

    void main() {
        float d = length(gl_PointCoord - 0.5);
        float alpha = smoothstep(0.5, 0.0, d) * vAlpha;
        gl_FragColor = vec4(uColor * alpha, alpha);
    }
`;

/** Deterministic pseudo-random number in [0, 1) so blips do not move between visits. */
const seeded = (n) => {
    const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
    return x - Math.floor(x);
};

/**
 * @param {HTMLCanvasElement} canvas
 * @param {object} options
 * @param {number} options.blipCount  number of radar detections to show
 * @param {boolean} options.lowPower  phones: fewer particles, lower resolution
 * @param {boolean} options.staticFrame  reduced motion: draw once, never animate
 * @param {() => number} options.level  current soundtrack loudness, 0..1
 */
export const createScene = (canvas, { blipCount = 6, lowPower = false, staticFrame = false, level = () => 0 }) => {
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
    // The scene is a soft background, so phones render it at CSS resolution:
    // on a 3x display that is 9x fewer pixels to shade, with no visible loss.
    const pixelRatio = lowPower ? 1 : Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(pixelRatio);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    const lookTarget = new THREE.Vector3(0, -0.6, 0);

    /* Radar disc */
    const blips = [];
    const count = Math.min(blipCount, MAX_BLIPS);
    for (let i = 0; i < MAX_BLIPS; i++) {
        const angle = seeded(i + 1) * TAU;
        const radius = 0.25 + seeded(i + 11) * 0.5;
        blips.push(new THREE.Vector2(Math.cos(angle) * radius, Math.sin(angle) * radius));
    }

    const radarUniforms = {
        uColor: { value: GREEN },
        uAngle: { value: 0.9 },
        uPing: { value: 100 },
        uLevel: { value: 0 },
        uBlipCount: { value: count },
        uBlips: { value: blips },
    };
    const radar = new THREE.Mesh(
        new THREE.PlaneGeometry(1, 1),
        new THREE.ShaderMaterial({
            uniforms: radarUniforms,
            vertexShader: radarVertex,
            fragmentShader: radarFragment,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            premultipliedAlpha: true,
        })
    );
    radar.rotation.x = -Math.PI / 2;
    radar.position.y = -2.2;
    scene.add(radar);

    /* Particles */
    const particleCount = lowPower ? 140 : 360;
    const positions = new Float32Array(particleCount * 3);
    const seeds = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 30;
        positions[i * 3 + 1] = Math.random() * 11 - 2.5;
        positions[i * 3 + 2] = Math.random() * -18 + 5;
        seeds[i] = Math.random();
    }
    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));

    const particleUniforms = {
        uColor: { value: GREEN },
        uTime: { value: 0 },
        uLevel: { value: 0 },
        uPixelRatio: { value: pixelRatio },
    };
    const particles = new THREE.Points(
        particleGeometry,
        new THREE.ShaderMaterial({
            uniforms: particleUniforms,
            vertexShader: particleVertex,
            fragmentShader: particleFragment,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            premultipliedAlpha: true,
        })
    );
    particles.frustumCulled = false; // positions move in the shader
    scene.add(particles);

    /* Framing: keep the disc wide enough to show around the terminal. */
    const resize = () => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const aspect = width / height;
        renderer.setSize(width, height, false);
        camera.aspect = aspect;
        camera.updateProjectionMatrix();

        const size = aspect < 1 ? 17 : 30;
        radar.scale.set(size, size, 1);
        camera.position.set(0, aspect < 1 ? 4.2 : 3.4, aspect < 1 ? 13 : 12);
        camera.lookAt(lookTarget);
        if (!running) draw();
    };

    /* Pointer parallax (desktop only; phones keep a gentle automatic sway). */
    const pointer = { x: 0, y: 0 };
    if (!lowPower) {
        window.addEventListener(
            "pointermove",
            (e) => {
                pointer.x = e.clientX / window.innerWidth - 0.5;
                pointer.y = e.clientY / window.innerHeight - 0.5;
            },
            { passive: true }
        );
    }

    const clock = new THREE.Clock();
    let running = false;
    let enabled = true;
    let frame = 0;
    let smoothLevel = 0;
    let sinceLastDraw = 0;
    const basePosition = new THREE.Vector3();

    const draw = () => renderer.render(scene, camera);

    const tick = () => {
        if (!running) return;
        frame = requestAnimationFrame(tick);

        sinceLastDraw += clock.getDelta();
        if (lowPower && sinceLastDraw < LOW_POWER_FRAME_SECONDS * 0.9) return;
        const dt = Math.min(sinceLastDraw, 0.1);
        sinceLastDraw = 0;
        const time = clock.elapsedTime;

        smoothLevel += (level() - smoothLevel) * Math.min(dt * 9, 1);
        radarUniforms.uAngle.value = (radarUniforms.uAngle.value + dt * SWEEP_SPEED) % TAU;
        radarUniforms.uPing.value += dt;
        radarUniforms.uLevel.value = smoothLevel;
        particleUniforms.uTime.value = time;
        particleUniforms.uLevel.value = smoothLevel;

        const targetX = basePosition.x + pointer.x * 1.6 + Math.sin(time * 0.12) * 0.4;
        const targetY = basePosition.y - pointer.y * 0.8;
        const ease = Math.min(dt * 2.5, 1);
        camera.position.x += (targetX - camera.position.x) * ease;
        camera.position.y += (targetY - camera.position.y) * ease;
        camera.lookAt(lookTarget);

        draw();
    };

    const start = () => {
        if (running || !enabled || staticFrame || document.hidden) return;
        running = true;
        clock.getDelta(); // discard time spent paused
        sinceLastDraw = 0;
        tick();
    };

    const stop = () => {
        running = false;
        cancelAnimationFrame(frame);
    };

    document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
    window.addEventListener("resize", () => {
        resize();
        basePosition.copy(camera.position);
    });

    resize();
    basePosition.copy(camera.position);
    draw();
    start();

    return {
        setEnabled(on) {
            enabled = on;
            canvas.hidden = !on;
            if (on) {
                draw();
                start();
            } else {
                stop();
            }
        },
        /** Sends a ring out from the centre of the radar. */
        ping() {
            radarUniforms.uPing.value = 0;
        },
    };
};
