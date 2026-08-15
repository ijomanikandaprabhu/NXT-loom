import { motion, useReducedMotion } from "motion/react";
import { useLocation } from "react-router-dom";
import type { ReactNode } from "react";

/**
 * Fades each route in on entry.
 *
 * Keyed on pathname rather than wrapped in AnimatePresence: the studio and
 * console pages own the full viewport height, and holding an outgoing page
 * mounted alongside the incoming one made them fight over that space. Enter
 * only means the new page is the only thing laying out.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const reduced = useReducedMotion();

  if (reduced) return <>{children}</>;

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className="flex-1 min-w-0 min-h-0 flex flex-col overflow-hidden"
    >
      {children}
    </motion.div>
  );
}
