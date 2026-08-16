/* ===================================================================
   VANOWARNA — Interactive CV Terminal
   =================================================================== */

const outputEl = document.getElementById("output");
const inputEl = document.getElementById("command-input");
const bodyEl = document.getElementById("terminal-body");
const cursorGlow = document.getElementById("cursor-glow");

const history = [];
let histIdx = -1;

/* ---------- cursor-following glow ---------- */
document.addEventListener("mousemove", (e) => {
    cursorGlow.style.left = e.clientX + "px";
    cursorGlow.style.top = e.clientY + "px";
});

/* ---------- Boot section modules ---------- */
const BOOT_SECTIONS = [
    "education", "experience", "skills", "publications",
    "research", "awards", "leadership", "contact",
];

const isMobile = () => window.innerWidth <= 600;

/* ---------- CV DATA ---------- */
const CV = {
    name: "Vanodhya Warnasooriya",
    title: "M.Eng. Candidate in Electrical Engineering \u2014 Vision, Generative & Interactive Computing",
    location: "Alawwa, Sri Lanka",
    email: "vanowarna@gmail.com",
    linkedin: "linkedin.com/in/vanowarna",
    github: "github.com/vanowarna",
    scholar: "scholar.google.com/citations?user=Ne3ko0AAAAAJ&hl=en",
    summary:
        "I build generative and interactive visual computing systems, " +
        "uniting deep learning, computational imaging, and human-computer " +
        "interaction. My work aims to create robust, real-time applications " +
        "for human-AI collaboration and scene understanding, with a " +
        "specialization in hardware-aware optimization for edge devices " +
        "and bandwidth-constrained environments.",
    interests: [
        "Computer Vision",
        "Vision\u2013Language Models (VLMs)",
        "Generative Models",
        "AR/VR & Human\u2013AI Interaction",
        "Multimodal Learning on Edge/Embedded Devices",
    ],
    education: [
        {
            school: "Chulalongkorn University \u2014 Thailand",
            degree: "M.Eng. in Electrical Engineering",
            years: "2026 \u2013 Present",
        },
        {
            school: "University of Peradeniya \u2014 Sri Lanka",
            degree: "B.Sc. Eng. in Electrical & Electronic Eng., Second Class Honours (Upper)",
            years: "2018 \u2013 2023",
            extra: "GPA 3.35/4.00 \u00b7 Rank 141 / 32,075 in GCE A-Level Physical Science (2017)",
        },
    ],
    publications: [
        {
            title: "Real-Time Video Anomaly Detection Using YOLO Pose Estimation and CLIP-Based Semantic Scoring",
            venue: "2026",
            link: "#",
            note: "Two-stage framework (YOLO v11n-pose + CLIP ViT-B/32) achieving 51 FPS with 3.36\u00d7 speedup; deployed on live CCTV at Chulalongkorn University.",
            status: "Preprint",
        },
        {
            title: "Sum Rate Maximization in STAR-RIS Assisted Full-Duplex Communication Systems",
            venue: "IEEE ICC 2022, Seoul",
            link: "https://ieeexplore.ieee.org/document/9838477",
            note: "Implemented convex optimization algorithms in MATLAB; developed simulation framework.",
            status: "Published",
        },
        {
            title: "Damage Assessment after Natural Disasters with UAVs",
            venue: "Manuscript in preparation",
            link: "https://arxiv.org/pdf/2412.10756",
            note: "Led data preprocessing, model inferencing, and performance evaluation for onboard UAV deployment.",
            status: "Preprint",
        },
    ],
    research: [
        {
            title: "Real-Time Video Anomaly Detection (YOLO + CLIP)",
            period: "2026 (M.Eng. Research)",
            supervisors: "Prof. Supavadee Aramvith",
            bullets: [
                "51 FPS end-to-end on NVIDIA Titan XP \u2014 3.36\u00d7 speedup over multi-feature baselines",
                "AUROC: 89.26% (CUHK Avenue), 84.13% (CU Indoor), 70.26% (ShanghaiTech)",
                "Zero-shot CLIP scoring replaces optical flow, AlphaPose & GMM/kNN density estimation",
                "Deployed on live CCTV feeds at Chulalongkorn University",
            ],
        },
        {
            title: "Attention-based Semantic Communication for Video Conferencing",
            period: "2022 \u2013 2023 (Undergraduate Thesis)",
            supervisors: "Dr. Himal A. Suraweera, Prof. Maheshi B. Dissanayake",
            bullets: [
                "~80% bandwidth savings via gaze-based semantic communication",
                "Robust pipeline: Dlib + OpenCV for head pose/gaze estimation",
                "GAN-based (GFPGAN) reconstruction \u2014 SSIM 0.81 over noisy channels",
            ],
        },
        {
            title: "Semantic Feature Extraction for UAV-based Disaster Assessment",
            period: "2024",
            supervisors: "Dr. T. Fernando, Dr. H. A. Suraweera, Prof. S. Sridharan, Prof. C. Fookes",
            bullets: [
                "Up to 92% reduction in transmitted data with minimal accuracy loss",
                "~13x lower transmission latency; ~70 GFLOPs on Jetson platforms",
            ],
        },
    ],
    work: [
        {
            role: "Electronic Engineer (R&D)",
            org: "Zone24x7 (Pvt.) Ltd.",
            period: "Jul 2025 \u2013 Jan 2026",
            bullets: [
                "On-device CV within Apple AVFoundation \u2014 real-time facial analysis & orientation tracking",
                "Interactive HCI guidance systems for high-quality data capture on mobile",
            ],
        },
        {
            role: "Co-Founder & Lead Engineer",
            org: "Resowave (Pvt.) Ltd.",
            period: "Feb 2025 \u2013 Present",
            bullets: ["Real-time signal visualization with Python & OpenGL"],
        },
        {
            role: "Electronic Engineer",
            org: "Vega Innovations (Pvt.) Ltd.",
            period: "Jan 2024 \u2013 Feb 2025",
            bullets: [
                "Lightweight anti-spoofing (RGB+Depth+IR) for edge facial recognition",
                "LoRa smart-farm sensor network with LLM-optimized decision-making",
            ],
        },
    ],
    skills: {
        Programming: "Python, C++, C, MATLAB",
        "ML & Vision": "PyTorch, TensorFlow, OpenCV, CUDA, TensorRT",
        "Tools & Platforms": "Git, Docker, Conda, Jetson (Nano, Orin), Raspberry Pi, ESP32",
        "Design & Graphics": "KiCAD, Altium, SolidWorks, OpenGL",
    },
    awards: [
        "1st Place \u2014 Undergrad Thesis Project, IEEE Signal Processing Society (2023)",
        "1st Place \u2014 IEEE Innovation Nation Sri Lanka, Central Province (2023)",
        "2nd Runners-Up \u2014 Hack:AI Competition (50+ university teams, 2022)",
        "Global Finalist \u2014 NASA EO Dashboard Hackathon (2021)",
        "8th Place \u2014 Intl. Rover Design Challenge, Mars Society South Asia (2021)",
    ],
    leadership: [
        "Chairperson, IEEE Student Branch, University of Peradeniya (2022\u20132023)",
        "Member, Advisory Board, SEDS Sri Lanka (2021\u2013Present)",
        "Mathematics Tutor & Mentor, Sasnaka Sansada (2019\u20132021)",
    ],
};

/* ---------- COMMANDS ---------- */
const commands = {
    help: () => [
        { text: "", cls: "" },
        { text: "  COMMANDS", cls: "heading" },
        { text: "  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500", cls: "dim" },
        { text: "  about       who I am & summary", cls: "" },
        { text: "  interests   research interests", cls: "" },
        { text: "  edu         education history", cls: "" },
        { text: "  skills      technical skills", cls: "" },
        { text: "  work        professional experience", cls: "" },
        { text: "  research    research projects", cls: "" },
        { text: "  publications  publications & preprints", cls: "" },
        { text: "  awards      honours & achievements", cls: "" },
        { text: "  leadership  service & leadership", cls: "" },
        { text: "  contact     email / LinkedIn / GitHub", cls: "" },
        { text: "  all         print full CV", cls: "" },
        { text: "  clear       clear terminal", cls: "" },
        { text: "  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500", cls: "dim" },
    ],

    about: () => {
        const lines = [];
        lines.push({ text: "  " + CV.name, cls: "heading" });
        lines.push({ text: "  " + CV.title, cls: "sub" });
        lines.push({ text: "  " + CV.location, cls: "dim" });
        lines.push({ text: "", cls: "" });
        const words = CV.summary.split(" ");
        let buf = "  ";
        for (const w of words) {
            if (buf.length + w.length > 68) { lines.push({ text: buf, cls: "" }); buf = "  "; }
            buf += w + " ";
        }
        if (buf.trim()) lines.push({ text: buf, cls: "" });
        return lines;
    },

    interests: () => {
        const lines = [{ text: "  Research Interests", cls: "heading" }, { text: "", cls: "" }];
        CV.interests.forEach((i) => lines.push({ text: "  \u25cf " + i, cls: "" }));
        return lines;
    },

    edu: () => {
        const lines = [{ text: "  Education", cls: "heading" }, { text: "", cls: "" }];
        CV.education.forEach((e) => {
            lines.push({ text: "  \u25a0 " + e.school, cls: "sub" });
            lines.push({ text: "    " + e.degree + "  (" + e.years + ")", cls: "" });
            if (e.extra) lines.push({ text: "    " + e.extra, cls: "dim" });
            lines.push({ text: "", cls: "" });
        });
        return lines;
    },

    skills: () => {
        const lines = [{ text: "  Technical Skills", cls: "heading" }, { text: "", cls: "" }];
        Object.entries(CV.skills).forEach(([k, v]) => {
            lines.push({ text: "  " + k, cls: "sub" });
            lines.push({ text: "    " + v, cls: "" });
        });
        return lines;
    },

    work: () => {
        const lines = [{ text: "  Professional Experience", cls: "heading" }, { text: "", cls: "" }];
        CV.work.forEach((w) => {
            lines.push({ text: "  \u25a0 " + w.role + "  \u2014  " + w.org, cls: "sub" });
            lines.push({ text: "    " + w.period, cls: "dim" });
            w.bullets.forEach((b) => lines.push({ text: "    \u00b7 " + b, cls: "" }));
            lines.push({ text: "", cls: "" });
        });
        return lines;
    },

    research: () => {
        const lines = [{ text: "  Research Experience", cls: "heading" }, { text: "", cls: "" }];
        CV.research.forEach((r) => {
            lines.push({ text: "  \u25a0 " + r.title, cls: "sub" });
            lines.push({ text: "    " + r.period, cls: "dim" });
            lines.push({ text: "    Supervisors: " + r.supervisors, cls: "dim" });
            r.bullets.forEach((b) => lines.push({ text: "    \u00b7 " + b, cls: "" }));
            lines.push({ text: "", cls: "" });
        });
        return lines;
    },

    publications: () => {
        const lines = [{ text: "  Publications & Preprints", cls: "heading" }, { text: "", cls: "" }];
        CV.publications.forEach((p) => {
            lines.push({ text: "  [" + p.status + "] " + p.title, cls: "sub" });
            lines.push({ text: "    " + p.venue, cls: "dim" });
            lines.push({ text: "    " + p.note, cls: "" });
            if (p.link && p.link !== "#") {
                lines.push({ text: "    \u2192 " + p.link, cls: "dim", link: p.link });
            }
            lines.push({ text: "", cls: "" });
        });
        return lines;
    },

    awards: () => {
        const lines = [{ text: "  Awards & Achievements", cls: "heading" }, { text: "", cls: "" }];
        CV.awards.forEach((a) => lines.push({ text: "  \u2605 " + a, cls: "" }));
        return lines;
    },

    leadership: () => {
        const lines = [{ text: "  Leadership & Service", cls: "heading" }, { text: "", cls: "" }];
        CV.leadership.forEach((l) => lines.push({ text: "  \u25cf " + l, cls: "" }));
        return lines;
    },

    contact: () => [
        { text: "  Contact", cls: "heading" },
        { text: "", cls: "" },
        { text: "  \u2709  " + CV.email, cls: "", link: "mailto:" + CV.email },
        { text: "  in " + CV.linkedin, cls: "", link: "https://" + CV.linkedin },
        { text: "  \u2302  " + CV.github, cls: "", link: "https://" + CV.github },
        { text: "  \ud83c\udf93 " + "Google Scholar", cls: "", link: "https://" + CV.scholar },
    ],

    all: () => {
        let lines = [];
        ["about","interests","edu","skills","work","research","publications","awards","leadership","contact"].forEach((cmd) => {
            lines = lines.concat(commands[cmd]());
            lines.push({ text: "  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500", cls: "dim" });
        });
        return lines;
    },

    clear: () => { outputEl.innerHTML = ""; return null; },
};

/* ---------- RENDER ---------- */
const addLine = (text, cls, link) => {
    const el = document.createElement("div");
    el.className = "line " + (cls || "");
    if (link) {
        const a = document.createElement("a");
        a.href = link;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.textContent = text;
        a.className = "terminal-link";
        el.appendChild(a);
    } else {
        el.textContent = text;
    }
    outputEl.appendChild(el);
};

const scrollDown = () => { bodyEl.scrollTop = bodyEl.scrollHeight; };

const renderResult = async (result, options = {}) => {
    const { stream = true } = options;
    if (!result) return;
    if (Array.isArray(result)) {
        for (const item of result) {
            if (typeof item === "string") addLine(item, "");
            else addLine(item.text, item.cls || "", item.link || null);
            if (stream) {
                scrollDown();
                await sleep(15); // Stream effect: 15ms delay per line
            }
        }
        if (stream) {
            scrollDown();
        }
        // For 'all' command: don't scroll, just load everything at top
    } else if (typeof result === "string") {
        addLine(result, "");
        scrollDown();
    }
};

/* ---------- EXECUTE ---------- */
const runCommand = async (raw) => {
    const trimmed = raw.trim();
    if (!trimmed) return;
    
    // Special handling for 'all' command
    const isAllCommand = trimmed.toLowerCase() === "all";
    
    if (isAllCommand) {
        // Clear terminal and scroll to top
        outputEl.innerHTML = "";
        bodyEl.scrollTop = 0; // Explicitly scroll to the very top
        triggerGlitch(); // Trigger glitch effect
    } else {
        addLine("visitor@cv> " + trimmed, "command");
    }
    
    const handler = commands[trimmed.toLowerCase()];
    if (!handler) {
        addLine("  command not found: " + trimmed + " \u2014 type 'help'", "muted");
        scrollDown();
        return;
    }
    
    await renderResult(handler(), { stream: !isAllCommand });
};

/* ---------- BOOT SEQUENCE ---------- */
const bootLines = [];

const boot = async () => {
    const barWidth = isMobile() ? 20 : 30;

    /* Title line */
    addLine("vanowarna terminal v3.0", "heading");
    await sleep(120);

    /* Create progress bar element */
    const barEl = document.createElement("div");
    barEl.className = "line dim";
    outputEl.appendChild(barEl);

    /* Animate loading bar from 0 → 100% while logging sections */
    const total = BOOT_SECTIONS.length;
    for (let i = 0; i < total; i++) {
        const pct = Math.round(((i + 1) / total) * 100);
        const filled = Math.round((pct / 100) * barWidth);
        const empty = barWidth - filled;
        const bar = "  [" + "█".repeat(filled) + "░".repeat(empty) + "]  " + pct + "%";
        barEl.textContent = bar;
        scrollDown();

        await sleep(60 + Math.random() * 80);
        addLine("  mounting /cv/" + BOOT_SECTIONS[i] + " ... ok", "dim");
        scrollDown();
    }

    await sleep(100);
    addLine("", "");
    addLine("  All modules loaded. Terminal ready.", "sub");
    scrollDown();

    await sleep(120);
    const welcomeMsg = isMobile()
        ? "  Welcome. Tap a command below."
        : "  Welcome. Type 'help' or tap a command below.";
    addLine(welcomeMsg, "sub");
    scrollDown();
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ---------- Mobile: disable keyboard ---------- */
if (isMobile()) {
    inputEl.setAttribute("readonly", "true");
    inputEl.setAttribute("inputmode", "none");
    inputEl.setAttribute("tabindex", "-1");
    inputEl.placeholder = "";
}

/* ---------- INPUT ---------- */
inputEl.addEventListener("keydown", async (e) => {
    if (e.key === "Enter") {
        const cmd = inputEl.value;
        history.push(cmd);
        histIdx = history.length;
        await runCommand(cmd);
        inputEl.value = "";
    }
    if (e.key === "ArrowUp") {
        e.preventDefault();
        if (history.length) {
            histIdx = Math.max(0, histIdx - 1);
            inputEl.value = history[histIdx] || "";
        }
    }
    if (e.key === "ArrowDown") {
        e.preventDefault();
        if (history.length) {
            histIdx = Math.min(history.length, histIdx + 1);
            inputEl.value = history[histIdx] || "";
        }
    }
});

/* Click anywhere in terminal body focuses input (except chips) */
bodyEl.addEventListener("click", (e) => {
    if (!e.target.closest(".chip")) {
        inputEl.focus();
    }
});

/* Clickable chips */
document.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", async (e) => {
        e.stopPropagation(); // Prevent event bubbling to body
        
        // Ensure audio starts on chip click
        const audio = document.getElementById("bg-audio");
        if (audio) {
            audio.play().catch(() => {});
        }
        
        const cmd = chip.getAttribute("data-cmd");
        if (cmd) {
            await runCommand(cmd);
            inputEl.value = "";
            // Only focus input if it's not the 'all' command
            if (cmd.toLowerCase() !== "all") {
                inputEl.focus();
            }
        }
    });
});

/* ---------- Random glitch burst ---------- */
const glitchEl = document.querySelector(".glitch");
const pageGlitchEl = document.getElementById("page-glitch");

const triggerGlitch = () => {
    if (!glitchEl) return;
    glitchEl.classList.add("glitch-active");
    setTimeout(() => glitchEl.classList.remove("glitch-active"), 150 + Math.random() * 250);
    setTimeout(triggerGlitch, 1500 + Math.random() * 4000);
};

/* Page-wide glitch (outside terminal) — runs independently */
const triggerPageGlitch = () => {
    if (!pageGlitchEl) return;
    pageGlitchEl.classList.add("active");
    setTimeout(() => pageGlitchEl.classList.remove("active"), 120 + Math.random() * 180);
    setTimeout(triggerPageGlitch, 2000 + Math.random() * 6000);
};

setTimeout(triggerGlitch, 800);
setTimeout(triggerPageGlitch, 2000);

/* ---------- Background Audio (Enhanced) ---------- */
const bgAudio = document.getElementById("bg-audio");
if (bgAudio) {
    bgAudio.volume = 0.2;
    
    // Flag to track if audio has been started
    let audioStarted = false;
    
    // Attempt to play when audio is ready
    const attemptPlay = () => {
        if (audioStarted || !bgAudio) return;
        
        const playPromise = bgAudio.play();
        if (playPromise !== undefined) {
            playPromise
                .then(() => {
                    audioStarted = true;
                })
                .catch(() => {
                    // Autoplay blocked or playback failed
                    // Fall back to user interaction
                    if (!audioStarted) {
                        setupUserInteractionFallback();
                    }
                });
        }
    };
    
    // Setup fallback for user interaction
    const setupUserInteractionFallback = () => {
        const startAudio = () => {
            bgAudio.play().catch(() => {});
            audioStarted = true;
            // Remove all interaction listeners once audio starts
            document.removeEventListener("click", startAudio);
            document.removeEventListener("keydown", startAudio);
            document.removeEventListener("pointerdown", startAudio);
            document.removeEventListener("scroll", startAudio);
            document.removeEventListener("wheel", startAudio);
            document.removeEventListener("touchmove", startAudio);
        };
        document.addEventListener("click", startAudio);
        document.addEventListener("keydown", startAudio);
        document.addEventListener("pointerdown", startAudio);
        document.addEventListener("scroll", startAudio);
        document.addEventListener("wheel", startAudio);
        document.addEventListener("touchmove", startAudio);
    };
    
    // Wait for audio to be ready before attempting to play
    if (bgAudio.readyState >= 2) {
        // Audio metadata is loaded
        attemptPlay();
    } else {
        // Wait for canplay event (enough data to play)
        bgAudio.addEventListener("canplay", attemptPlay, { once: true });
        
        // Fallback: if audio doesn't load within 3 seconds, use interaction
        setTimeout(() => {
            if (!audioStarted) {
                setupUserInteractionFallback();
            }
        }, 3000);
    }
}

/* ---------- GO ---------- */
boot();
inputEl.focus();
