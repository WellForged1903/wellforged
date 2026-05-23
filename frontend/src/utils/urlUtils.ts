/**
 * Global Asset URL Sanitizer
 * Strips localhost origins and ensures only clean relative paths are used for assets.
 */

export const getSafeImageUrl = (url: string | null | undefined): string => {
  if (!url) return "/placeholder.svg";

  // Case 1: Already a relative path or data URL or valid external URL
  if (url.startsWith("/") || url.startsWith("data:") || (url.startsWith("http") && !url.includes("localhost:"))) {
    return url;
  }

  // Case 2: Stale localhost URL from "Lovable" or local dev
  // Regex matches http://localhost:PORT/ and replaces it with /
  try {
    const cleanUrl = url.replace(/^https?:\/\/localhost:\d+\//, "/");
    return cleanUrl.startsWith("/") ? cleanUrl : `/${cleanUrl}`;
  } catch (e) {
    return url;
  }
};
