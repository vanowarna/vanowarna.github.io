/**
 * Background soundtrack. Off until the visitor turns it on; the choice is
 * remembered. When playing, an analyser exposes the current loudness so the
 * 3D scene can react to the music.
 */

import { getPref, setPref } from "./prefs.js";

const VOLUME = 0.2;
const PREF_KEY = "sound";

export const createSoundtrack = (audioEl, onChange = () => {}) => {
    let analyser = null;
    let bins = null;

    audioEl.volume = VOLUME;

    const setUpAnalyser = () => {
        if (analyser) return;
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return;
        try {
            const context = new AudioContextClass();
            const source = context.createMediaElementSource(audioEl);
            analyser = context.createAnalyser();
            analyser.fftSize = 64;
            analyser.smoothingTimeConstant = 0.85;
            bins = new Uint8Array(analyser.frequencyBinCount);
            source.connect(analyser);
            analyser.connect(context.destination);
            if (context.state === "suspended") context.resume();
        } catch {
            analyser = null; // music still plays, the scene just will not react
        }
    };

    const isOn = () => !audioEl.paused;

    const play = async () => {
        try {
            await audioEl.play();
            setUpAnalyser();
        } catch {
            /* blocked until a user gesture; the toggle remains available */
        }
        onChange(isOn());
        return isOn();
    };

    const set = async (on) => {
        setPref(PREF_KEY, on ? "on" : "off");
        if (on) return play();
        audioEl.pause();
        onChange(false);
        return false;
    };

    // Returning visitors who opted in: browsers only allow playback after a
    // gesture, so resume on their first interaction.
    if (getPref(PREF_KEY, "off") === "on") {
        const resume = (event) => {
            // The toggle handles its own click; resuming here would undo it.
            const onToggle = event.target instanceof Element && event.target.closest("[data-action='sound']");
            if (!onToggle && getPref(PREF_KEY, "off") === "on") play();
        };
        window.addEventListener("pointerdown", resume, { once: true });
        window.addEventListener("keydown", resume, { once: true });
    }

    return {
        isOn,
        toggle: () => set(!isOn()),
        set,
        /** Loudness of the low/mid band, 0..1. */
        level: () => {
            if (!analyser || !isOn()) return 0;
            analyser.getByteFrequencyData(bins);
            let sum = 0;
            const count = Math.min(12, bins.length);
            for (let i = 0; i < count; i++) sum += bins[i];
            return sum / (count * 255);
        },
    };
};
