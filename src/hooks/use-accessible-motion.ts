"use client";

import { useSyncExternalStore } from "react";
import { useReducedMotion } from "motion/react";

const subscribeToHydration = () => () => {};
const finePointerQuery = "(hover: hover) and (pointer: fine)";

function subscribeToFinePointer(callback: () => void) {
  const media = window.matchMedia(finePointerQuery);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

function getFinePointerSnapshot() {
  return window.matchMedia(finePointerQuery).matches;
}

/**
 * Keeps the server and the first client render identical, then applies the
 * user's reduced-motion preference after hydration.
 */
export function useAccessibleMotion() {
  const hydrated = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false,
  );
  const prefersReducedMotion = useReducedMotion();

  return hydrated && Boolean(prefersReducedMotion);
}

/** Returns true only after hydration on devices with a precise hover pointer. */
export function useFinePointer() {
  return useSyncExternalStore(
    subscribeToFinePointer,
    getFinePointerSnapshot,
    () => false,
  );
}
