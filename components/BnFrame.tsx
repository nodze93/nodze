'use client';

import { useCallback, useEffect, useRef } from 'react';

/**
 * Iframe kalkulatora koji se SAM SMANJI da sve stane na jedan ekran.
 *
 * Problem na telefonu (posebno u PWA): sadržaj kalkulatora je širi/viši od
 * ekrana, pa je desna strana bila ODSJEČENA i moralo se skrolati okolo.
 * Umjesto da diramo korisnikov dizajn kalkulatora (public/kalkulator-app je
 * njegov i ne dira se), mjerimo stvarnu veličinu sadržaja i cijeli iframe
 * skaliramo (transform: scale) da stane i po širini i po visini — kao
 * "uklopi cijelu stranicu". Dizajn ostaje isti, samo primjereno umanjen.
 *
 * Isti origin smo (public/), pa smijemo čitati contentDocument.
 */
export default function BnFrame() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);

  const uklopi = useCallback(() => {
    const wrap = wrapRef.current;
    const frame = frameRef.current;
    const doc = frame?.contentDocument;
    if (!wrap || !frame || !doc || !doc.body) return;

    // stvarna veličina sadržaja kalkulatora
    const sirina = Math.max(doc.documentElement.scrollWidth, doc.body.scrollWidth);
    const visina = Math.max(doc.documentElement.scrollHeight, doc.body.scrollHeight);
    if (sirina < 50 || visina < 50) return; // još se nije iscrtao

    const w = wrap.clientWidth;
    const h = wrap.clientHeight;
    const scale = Math.min(1, w / sirina, h / visina);

    frame.style.width = `${sirina}px`;
    frame.style.height = `${visina}px`;
    frame.style.transformOrigin = 'top left';
    frame.style.transform = `scale(${scale})`;
    // centriraj vodoravno kad ostane prostora
    frame.style.marginLeft = `${Math.max(0, (w - sirina * scale) / 2)}px`;
  }, []);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    let ro: ResizeObserver | null = null;
    const tajmeri: ReturnType<typeof setTimeout>[] = [];

    const poveži = () => {
      uklopi();
      // kalkulator se dograđuje (učitava params.json) — provjeri još par puta
      [200, 600, 1500].forEach((ms) => tajmeri.push(setTimeout(uklopi, ms)));
      const body = frame.contentDocument?.body;
      if (body && 'ResizeObserver' in window) {
        ro = new ResizeObserver(uklopi);
        ro.observe(body);
      }
    };

    frame.addEventListener('load', poveži);
    window.addEventListener('resize', uklopi);
    if (frame.contentDocument?.readyState === 'complete') poveži();

    return () => {
      frame.removeEventListener('load', poveži);
      window.removeEventListener('resize', uklopi);
      ro?.disconnect();
      tajmeri.forEach(clearTimeout);
    };
  }, [uklopi]);

  return (
    <div className="bn-wrap" ref={wrapRef}>
      <iframe
        ref={frameRef}
        src="/kalkulator-app/index.html"
        title="Brutto-Netto Rechner"
        allow="web-share; clipboard-write"
        className="bn-frame"
        scrolling="no"
      />

      <style>{`
        .bn-wrap {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: #F0F4FF;
          overflow: hidden; /* nikakvog skrolanja OKO kalkulatora */
        }
        .bn-frame {
          width: 100%;
          height: 100%;
          border: none;
          display: block;
        }
        /* Na telefonu ostavi mjesta za donju nav traku (62px = njena visina) */
        @media (max-width: 768px) {
          .bn-wrap { bottom: calc(62px + env(safe-area-inset-bottom)); }
        }
      `}</style>
    </div>
  );
}
