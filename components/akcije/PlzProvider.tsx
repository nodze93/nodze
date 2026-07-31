'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const KEY = 'akcije.plz';
const DEFAULT_PLZ = '85737';

interface PlzContextValue {
  plz: string;
  ready: boolean;
  setPlz: (plz: string) => void;
}

const PlzContext = createContext<PlzContextValue>({
  plz: DEFAULT_PLZ,
  ready: false,
  setPlz: () => {},
});

export function PlzProvider({ children }: { children: React.ReactNode }) {
  const [plz, setPlzState] = useState(DEFAULT_PLZ);
  const [ready, setReady] = useState(false);

  // Zadnji PLZ se pamti - PWA se otvara odmah na pravoj lokaciji
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(KEY);
      if (saved && /^\d{5}$/.test(saved)) setPlzState(saved);
    } catch {
      /* privatni mod */
    }
    setReady(true);
  }, []);

  const setPlz = useCallback((next: string) => {
    if (!/^\d{5}$/.test(next)) return;
    setPlzState(next);
    try {
      window.localStorage.setItem(KEY, next);
    } catch {
      /* privatni mod */
    }
  }, []);

  const value = useMemo(() => ({ plz, ready, setPlz }), [plz, ready, setPlz]);
  return <PlzContext.Provider value={value}>{children}</PlzContext.Provider>;
}

export const usePlz = () => useContext(PlzContext);
