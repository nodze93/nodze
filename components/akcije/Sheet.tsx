'use client';

import { useEffect, useRef } from 'react';

interface Props {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

/**
 * Bottom sheet: na mobilnom klizi odozdo, na desktopu je centriran modal.
 * Na mobilnom se PODIGNE iznad tastature (VisualViewport API), da unos (npr.
 * PLZ) ne ostane prekriven tastaturom. Na desktopu se ne dira (nema tastature).
 */
export default function Sheet({ title, onClose, children }: Props) {
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  // Podigni sheet iznad mobilne tastature.
  useEffect(() => {
    const vv = window.visualViewport;
    const sheet = sheetRef.current;
    if (!vv || !sheet) return;

    const apply = () => {
      // Samo na mobilnom (donji sheet). Desktop je centriran → ne diramo.
      if (window.innerWidth >= 620) {
        sheet.style.transform = '';
        return;
      }
      // Koliko tastatura prekriva odozdo:
      const overlap = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      sheet.style.transform = overlap > 8 ? `translateY(-${overlap}px)` : '';
    };

    vv.addEventListener('resize', apply);
    vv.addEventListener('scroll', apply);
    apply();
    return () => {
      vv.removeEventListener('resize', apply);
      vv.removeEventListener('scroll', apply);
    };
  }, []);

  return (
    <div className="sheet-bg" role="dialog" aria-modal="true" aria-label={title} onClick={onClose}>
      <div className="sheet" ref={sheetRef} onClick={(event) => event.stopPropagation()}>
        <div className="sheet-grip" />
        <h2>{title}</h2>
        {children}
      </div>
    </div>
  );
}
