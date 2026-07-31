'use client';

import { useEffect } from 'react';

interface Props {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

/** Bottom sheet: na mobilnom klizi odozdo, na desktopu je centriran modal. */
export default function Sheet({ title, onClose, children }: Props) {
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

  return (
    <div className="sheet-bg" role="dialog" aria-modal="true" aria-label={title} onClick={onClose}>
      <div className="sheet" onClick={(event) => event.stopPropagation()}>
        <div className="sheet-grip" />
        <h2>{title}</h2>
        {children}
      </div>
    </div>
  );
}
