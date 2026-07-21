import React, { PropsWithChildren, useEffect, useState, RefObject } from "react";
import { motion, AnimatePresence } from "motion/react";

type Placement = "top" | "right" | "bottom" | "left";

interface TooltipProps {
  title: string;
  description?: string;
  placement?: Placement;
  open: boolean;
  anchorRef: RefObject<any>;
}

/**
 * Tooltip component that follows an anchor element.
 * Uses glassmorphism (bg-white/70, backdrop-blur) and subtle motion fade‑in.
 */
export const Tooltip: React.FC<PropsWithChildren<TooltipProps>> = ({
  title,
  description,
  placement = "top",
  open,
  anchorRef,
  children,
}) => {
  const [coords, setCoords] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });

  useEffect(() => {
    const el = anchorRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const gap = 8;
    const pos = {
      top:
        placement === "top"
          ? rect.top - gap
          : placement === "bottom"
          ? rect.bottom + gap
          : rect.top + rect.height / 2,
      left:
        placement === "left"
          ? rect.left - gap
          : placement === "right"
          ? rect.right + gap
          : rect.left + rect.width / 2,
    };
    setCoords(pos);
  }, [anchorRef, placement, open]);

  // hide tooltip when not open
  if (!open) return <>{children}</>;

  return (
    <>
      {children}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.2 }}
          className="absolute z-20 max-w-xs p-3 bg-white/70 backdrop-blur-lg border border-white/30 rounded-lg shadow-lg"
          style={{
            top: coords.top,
            left: coords.left,
            transform: "translate(-50%,-100%)",
          }}
          role="tooltip"
          aria-hidden={!open}
        >
          <h4 className="font-display font-bold text-sm text-slate-800">
            {title}
          </h4>
          {description && (
            <p className="mt-1 text-xs text-slate-600">{description}</p>
          )}
        </motion.div>
      </AnimatePresence>
    </>
  );
};
