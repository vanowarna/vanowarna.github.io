/**
 * Visitor preferences (sound, visual effects), persisted in localStorage.
 * Storage can be unavailable (private mode, blocked cookies), so every
 * access is guarded and the site works without it.
 */

const PREFIX = "vanowarna:";

export const getPref = (key, fallback) => {
    try {
        const value = localStorage.getItem(PREFIX + key);
        return value === null ? fallback : value;
    } catch {
        return fallback;
    }
};

export const setPref = (key, value) => {
    try {
        localStorage.setItem(PREFIX + key, value);
    } catch {
        /* preference simply will not persist */
    }
};

const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
export const prefersReducedMotion = () => motionQuery.matches;

const touchQuery = window.matchMedia("(hover: none) and (pointer: coarse)");
export const isTouchDevice = () => touchQuery.matches;

export const isSmallScreen = () => window.innerWidth <= 640;
