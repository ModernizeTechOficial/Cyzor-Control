import { useState, useRef, RefObject } from "react";

/**
 * Hook to control a tooltip anchored to an element.
 * Returns visibility state, open/close callbacks and a ref to attach to the anchor.
 */
export const useTooltip = () => {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLElement>(null);
  const openTooltip = () => setOpen(true);
  const closeTooltip = () => setOpen(false);
  return { open, openTooltip, closeTooltip, anchorRef } as const;
};
