/* ===================================================================
   VANOWARNA — Background Visual Effects
   Three.js particles + Film grain + Ambient glitch
   =================================================================== */

(function () {
    "use strict";

    /* ---------- Three.js Particle Field ---------- */
    const canvas = document.getElementById("particles-bg");
    if (canvas && window.THREE) {
        const renderer = new THREE.WebGLRenderer({
            canvas,
            alpha: true,
            antialias: false,
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        renderer.setSize(window.innerWidth, window.innerHeight);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(
            60,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        camera.position.z = 300;

        /* Particles */
        const COUNT = window.innerWidth < 600 ? 180 : 400;
        const geo = new THREE.BufferGeometry();
        const positions = new Float32Array(COUNT * 3);
        const velocities = new Float32Array(COUNT * 3);
        const sizes = new Float32Array(COUNT);

        for (let i = 0; i < COUNT; i++) {
            const i3 = i * 3;
            positions[i3] = (Math.random() - 0.5) * 800;
            positions[i3 + 1] = (Math.random() - 0.5) * 600;
            positions[i3 + 2] = (Math.random() - 0.5) * 500;
            velocities[i3] = (Math.random() - 0.5) * 0.08;
            velocities[i3 + 1] = (Math.random() - 0.5) * 0.06;
            velocities[i3 + 2] = (Math.random() - 0.5) * 0.04;
            sizes[i] = Math.random() * 2.5 + 0.5;
        }

        geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        geo.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

        const mat = new THREE.PointsMaterial({
            color: 0x33ff33,
            size: 1.8,
            transparent: true,
            opacity: 0.25,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            sizeAttenuation: true,
        });

        const points = new THREE.Points(geo, mat);
        scene.add(points);

        /* Optional: faint connecting lines between close particles */
        const lineGeo = new THREE.BufferGeometry();
        const MAX_LINES = 120;
        const linePositions = new Float32Array(MAX_LINES * 6);
        lineGeo.setAttribute(
            "position",
            new THREE.BufferAttribute(linePositions, 3)
        );
        lineGeo.setDrawRange(0, 0);

        const lineMat = new THREE.LineBasicMaterial({
            color: 0x33ff33,
            transparent: true,
            opacity: 0.06,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        });
        const lines = new THREE.LineSegments(lineGeo, lineMat);
        scene.add(lines);

        /* Mouse interaction — subtle parallax */
        let mouseX = 0,
            mouseY = 0;
        document.addEventListener("mousemove", (e) => {
            mouseX = (e.clientX / window.innerWidth - 0.5) * 30;
            mouseY = (e.clientY / window.innerHeight - 0.5) * 20;
        });

        /* Animation loop */
        const clock = new THREE.Clock();
        function animate() {
            requestAnimationFrame(animate);
            const dt = clock.getDelta();
            const posArr = geo.attributes.position.array;

            for (let i = 0; i < COUNT; i++) {
                const i3 = i * 3;
                posArr[i3] += velocities[i3];
                posArr[i3 + 1] += velocities[i3 + 1];
                posArr[i3 + 2] += velocities[i3 + 2];

                /* Wrap around */
                if (posArr[i3] > 400) posArr[i3] = -400;
                if (posArr[i3] < -400) posArr[i3] = 400;
                if (posArr[i3 + 1] > 300) posArr[i3 + 1] = -300;
                if (posArr[i3 + 1] < -300) posArr[i3 + 1] = 300;
                if (posArr[i3 + 2] > 250) posArr[i3 + 2] = -250;
                if (posArr[i3 + 2] < -250) posArr[i3 + 2] = 250;
            }
            geo.attributes.position.needsUpdate = true;

            /* Connect nearby particles with lines */
            let lineIdx = 0;
            const threshold = 80;
            const lp = lineGeo.attributes.position.array;
            for (let i = 0; i < COUNT && lineIdx < MAX_LINES; i++) {
                for (let j = i + 1; j < COUNT && lineIdx < MAX_LINES; j++) {
                    const dx = posArr[i * 3] - posArr[j * 3];
                    const dy = posArr[i * 3 + 1] - posArr[j * 3 + 1];
                    const dz = posArr[i * 3 + 2] - posArr[j * 3 + 2];
                    const dist = dx * dx + dy * dy + dz * dz;
                    if (dist < threshold * threshold) {
                        const li = lineIdx * 6;
                        lp[li] = posArr[i * 3];
                        lp[li + 1] = posArr[i * 3 + 1];
                        lp[li + 2] = posArr[i * 3 + 2];
                        lp[li + 3] = posArr[j * 3];
                        lp[li + 4] = posArr[j * 3 + 1];
                        lp[li + 5] = posArr[j * 3 + 2];
                        lineIdx++;
                    }
                }
            }
            lineGeo.setDrawRange(0, lineIdx * 2);
            lineGeo.attributes.position.needsUpdate = true;

            /* Subtle parallax */
            camera.position.x += (mouseX - camera.position.x) * 0.02;
            camera.position.y += (-mouseY - camera.position.y) * 0.02;
            camera.lookAt(scene.position);

            /* Slow rotation */
            points.rotation.y += 0.0003;
            points.rotation.x += 0.0001;
            lines.rotation.y = points.rotation.y;
            lines.rotation.x = points.rotation.x;

            renderer.render(scene, camera);
        }
        animate();

        /* Resize */
        window.addEventListener("resize", () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    /* ---------- Film Grain ---------- */
    const grainCanvas = document.getElementById("film-grain");
    if (grainCanvas) {
        const ctx = grainCanvas.getContext("2d");
        let gW, gH;

        function resizeGrain() {
            gW = grainCanvas.width = Math.ceil(window.innerWidth / 3);
            gH = grainCanvas.height = Math.ceil(window.innerHeight / 3);
        }
        resizeGrain();
        window.addEventListener("resize", resizeGrain);

        let grainFrame = 0;
        function drawGrain() {
            /* Only update every 3rd frame for perf */
            grainFrame++;
            if (grainFrame % 3 !== 0) { requestAnimationFrame(drawGrain); return; }

            const imageData = ctx.createImageData(gW, gH);
            const data = imageData.data;
            for (let i = 0; i < data.length; i += 4) {
                const v = Math.random() * 40;   /* dark noise, not white */
                data[i] = v * 0.6;               /* slight green tint */
                data[i + 1] = v;
                data[i + 2] = v * 0.4;
                data[i + 3] = Math.random() < 0.4 ? (Math.random() * 18) : 0; /* sparse, very low alpha */
            }
            ctx.putImageData(imageData, 0, 0);
            requestAnimationFrame(drawGrain);
        }
        drawGrain();
    }

    /* ---------- Ambient page-wide glitch bursts ---------- */
    const pageGlitch = document.getElementById("page-glitch");
    if (pageGlitch) {
        function ambientGlitch() {
            pageGlitch.classList.add("active");
            setTimeout(
                () => pageGlitch.classList.remove("active"),
                80 + Math.random() * 150
            );
            setTimeout(ambientGlitch, 3000 + Math.random() * 7000);
        }
        setTimeout(ambientGlitch, 2000);
    }
})();
