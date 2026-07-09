"use client";
import { useEffect, useState } from "react";

/**
 * Vraća true kad je ekran uži od `breakpoint` (default 768px = telefon/tablet).
 * SSR-safe: kreće od false (desktop), pa se nakon mounta uskladi sa stvarnom
 * širinom. Sluša i promjenu veličine / rotaciju ekrana.
 */
export function useIsMobile(breakpoint = 768): boolean {
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const provjeri = () => setMobile(window.innerWidth < breakpoint);
    provjeri();
    window.addEventListener("resize", provjeri);
    window.addEventListener("orientationchange", provjeri);
    return () => {
      window.removeEventListener("resize", provjeri);
      window.removeEventListener("orientationchange", provjeri);
    };
  }, [breakpoint]);

  return mobile;
}
