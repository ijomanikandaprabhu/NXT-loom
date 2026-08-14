import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";

/**
 * Animates direct descendants marked with [data-stagger-item] into view
 * on mount / whenever `deps` changes (e.g. after a filter/search).
 * Respects prefers-reduced-motion.
 */
export function useStaggerReveal<T extends HTMLElement>(deps: unknown[] = []) {
  const containerRef = useRef<T | null>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const items = containerRef.current.querySelectorAll("[data-stagger-item]");
    if (!items.length) return;

    if (prefersReduced) {
      gsap.set(items, { opacity: 1, y: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        items,
        { opacity: 0, y: 6 },
        { opacity: 1, y: 0, duration: 0.38, ease: "power2.out", stagger: 0.032 }
      );
    }, containerRef);

    return () => ctx.revert();
  }, deps);

  return containerRef;
}
