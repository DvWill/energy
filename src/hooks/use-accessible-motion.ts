"use client";

import { useSyncExternalStore } from "react";
import { useReducedMotion } from "motion/react";

const subscribeToHydration = () => () => {};

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
