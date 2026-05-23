/**
 * Frontend Configuration
 * Centralizes environment variables and global constants.
 */

const rawBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
export const API_BASE_URL = rawBaseUrl.endsWith("/") ? rawBaseUrl.slice(0, -1) : rawBaseUrl;

export const APP_CONFIG = {
    SITE_NAME: "WellForged",
    SUPPORT_EMAIL: "support@wellforged.in",
    DEFAULT_CURRENCY: "INR",
    DEFAULT_LOCALE: "en-IN",
};
