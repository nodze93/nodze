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

    const w = wrap.clientWidth;
    const h = wrap.clientHeight;

    // ŠIRINA IDE OD RUBA DO RUBA (izričita želja korisnika — „lijevo desno
    // do kraja"). Prvo pusti kalkulator na punu širinu (on je responzivan);
    // SAMO ako mu je sadržaj i dalje širi od ekrana (uski telefoni ~360px,
    // forma ima min ~375px), skaliraj po ŠIRINI — nikad po visini, jer je
    // skaliranje po visini sužavalo formu i ostavljalo trake sa strana.
    frame.style.transform = '';
    frame.style.width = '100%';
    frame.style.height = '100%';
    frame.style.marginLeft = '0';

    const docW = Math.max(doc.documentElement.scrollWidth, doc.body.scrollWidth);
    if (docW < 50) return; // još se nije iscrtao

    if (docW > w + 2) {
      const scale = w / docW;
      frame.style.width = `${docW}px`;
      // visina = vidljivi prostor preračunat kroz scale: ako je forma viša,
      // kalkulator se lagano skroluje IZNUTRA (stranica okolo nikad).
      frame.style.height = `${Math.ceil(h / scale)}px`;
      frame.style.transformOrigin = 'top left';
      frame.style.transform = `scale(${scale})`;
    }

    // Pozadina OKO kalkulatora = pozadina SAMOG kalkulatora, pa se ne vidi
    // gdje forma prestaje (bez sivih rubova).
    const bg =
      getComputedStyle(doc.body).backgroundColor ||
      getComputedStyle(doc.documentElement).backgroundColor;
    if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
      wrap.style.background = bg;
    }
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
        /* Na telefonu ostavi mjesta za donju nav traku (68px = njena visina
           sa podignutom dugmadi) */
        @media (max-width: 768px) {
          .bn-wrap { bottom: calc(68px + env(safe-area-inset-bottom)); }
        }
      `}</style>
    </div>
  );
}
