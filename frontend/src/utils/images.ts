import type { SyntheticEvent } from "react";

export const DEFAULT_PRODUCT_IMAGE = "/Packaging_Updated.png";
export const PLACEHOLDER_IMAGE = "/placeholder.svg";

export const imageErrorFallback = (e: SyntheticEvent<HTMLImageElement>) => {
  const img = e.currentTarget;
  if (img.dataset.fallbackApplied === "1") return;
  img.dataset.fallbackApplied = "1";
  img.src = PLACEHOLDER_IMAGE;
};
