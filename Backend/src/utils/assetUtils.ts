/**
 * Permanent Asset URL Utilities
 * Handles sanitization for storage (Write) and normalization for display (Read).
 */

/**
 * Sanitizes a URL for storage by removing local origins.
 * Converts "http://localhost:7070/image.png" -> "/image.png"
 * Leaves external public URLs (Cloudinary, etc.) intact.
 */
export const sanitizeUrlForStorage = (value: unknown): string | null => {
  if (typeof value !== "string") return null;
  const raw = value.trim();
  if (!raw) return null;

  // Handle double slash or protocol-less URLs
  if (raw.startsWith("//")) return raw;
  if (raw.startsWith("/")) return raw;

  try {
    const url = new URL(raw);
    const isLocal =
      url.hostname === "localhost" ||
      url.hostname === "127.0.0.1" ||
      url.hostname === "::1" ||
      url.hostname.startsWith("192.168.") ||
      url.hostname.startsWith("172.") ||
      url.hostname.startsWith("10.");

    if (isLocal) {
      // Stripping origin entirely for storage
      return url.pathname + url.search + url.hash;
    }

    return url.toString();
  } catch {
    // Pass through non-URL strings
    return raw;
  }
};

/**
 * Normalizes a URL for display to the frontend.
 * Currently ensures protocol consistency, but can be expanded to 
 * prepend CDN base URLs in the future.
 */
export const normalizeUrlForDisplay = (value: unknown): string | null => {
  if (typeof value !== "string") return null;
  const raw = value.trim();
  if (!raw) return null;

  if (raw.startsWith("/")) return raw;

  try {
    const url = new URL(raw);
    // Enforce https for any public asset URLs
    if (url.protocol === "http:") url.protocol = "https:";
    return url.toString();
  } catch {
    return raw;
  }
};

/**
 * Recursively scans an object or array and applies normalization
 * to any string value that looks like an image or file reference.
 * Useful for JSONB fields like product 'metadata'.
 */
export const deepNormalizePaths = (obj: any): any => {
  if (!obj || typeof obj !== "object" || obj instanceof Date) return obj;

  if (Array.isArray(obj)) {
    return obj.map(item => deepNormalizePaths(item));
  }

  const result: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      // Strategy: Normalize paths that look like assets or are in known image keys
      if (
        key.toLowerCase().includes("image") || 
        key.toLowerCase().includes("url") || 
        key.toLowerCase().includes("icon") ||
        /\.(png|jpe?g|webp|gif|svg|pdf)$/i.test(value)
      ) {
        result[key] = normalizeUrlForDisplay(value);
      } else {
        result[key] = value;
      }
    } else if (typeof value === "object") {
      result[key] = deepNormalizePaths(value);
    } else {
      result[key] = value;
    }
  }
  return result;
};
