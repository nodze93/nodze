"use client";

// ============================================================
// INSTALL BANER — pojavi se kad korisnik vidi rezultat kalkulatora.
//  • Android / desktop (Chrome, Edge, Brave): dugme "Instaliraj aplikaciju"
//  • iPhone (Safari/Chrome): uputstvo (Apple ne dozvoljava dugme)
//  • Već instalirano: ništa
// Sluša poruku iz iframe-a ("kodnas-calc-result") + beforeinstallprompt.
// Ne dira dizajn kalkulatora.
// ============================================================

import { useEffect, useRef, useState } from "react";

export default function InstallPrompt() {
  const deferredRef = useRef<any>(null);
  const dismissedRef = useRef(false);
  const [mode, setMode] = useState<null | "android" | "ios">(null);

  useEffect(() => {
    // Odluči da li i kako pokazati baner. Zove se na svakoj stranici (timer),
    // čim postane instalabilno (beforeinstallprompt) i kad kalkulator javi.
    function maybeShow() {
      if (dismissedRef.current) return;
      // Ne dosađuj: ako je app već instalirana ILI je baner zatvoren u zadnjih
      // 7 dana → ništa. (Instalirani korisnici tako ne dobijaju stalno „instaliraj".)
      try {
        if (localStorage.getItem("kodnas-install-done") === "1") {
          dismissedRef.current = true;
          return;
        }
        const ts = Number(localStorage.getItem("kodnas-install-dismissed") || 0);
        if (ts && Date.now() - ts < 7 * 864e5) {
          dismissedRef.current = true;
          return;
        }
      } catch {}
      const standalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (navigator as any).standalone === true;
      if (standalone) return; // već instalirano → ništa
      if (deferredRef.current) {
        setMode("android"); // Android/desktop: instalacija jednim klikom
        return;
      }
      const ua = navigator.userAgent || "";
      const isIOS =
        /iphone|ipad|ipod/i.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
      if (isIOS) setMode("ios"); // iPhone → uputstvo (Apple ne da dugme)
    }

    function onBIP(e: any) {
      e.preventDefault();
      deferredRef.current = e; // spremi prompt
      maybeShow(); // čim je instalabilno, pokaži (osim ako je zatvoreno)
    }
    function onInstalled() {
      deferredRef.current = null;
      setMode(null);
      // Trajno zapamti da je instalirano → baner se više NIKAD ne pojavi.
      try {
        localStorage.setItem("kodnas-install-done", "1");
      } catch {}
      // javi backendu (brojač instalacija u adminu)
      try {
        fetch("/api/track-install", { method: "POST", keepalive: true }).catch(() => {});
      } catch {}
    }
    function onMsg(e: MessageEvent) {
      const d: any = e.data;
      if (!d || d.type !== "kodnas-calc-result") return;
      maybeShow();
    }

    // NA SVAKOJ STRANICI: pokaži baner ubrzo nakon učitavanja (ne samo na
    // kalkulatoru). Kratki delay da se stranica slegne.
    const timer = window.setTimeout(maybeShow, 2200);

    window.addEventListener("beforeinstallprompt", onBIP);
    window.addEventListener("appinstalled", onInstalled);
    window.addEventListener("message", onMsg);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("beforeinstallprompt", onBIP);
      window.removeEventListener("appinstalled", onInstalled);
      window.removeEventListener("message", onMsg);
    };
  }, []);

  async function instaliraj() {
    const d = deferredRef.current;
    if (!d) {
      setMode(null);
      return;
    }
    d.prompt();
    try {
      await d.userChoice;
    } catch {}
    deferredRef.current = null;
    setMode(null);
  }
  function kasnije() {
    dismissedRef.current = true;
    // Zapamti „Kasnije" na 7 dana (ne samo sesiju) → ne iskače stalno.
    try {
      localStorage.setItem("kodnas-install-dismissed", String(Date.now()));
    } catch {}
    setMode(null);
  }

  if (!mode) return null;

  return (
    <div className="ipb" role="dialog" aria-label="Instaliraj aplikaciju">
      <button className="ipb-x" onClick={kasnije} aria-label="Zatvori">✕</button>
      <div className="ipb-top">
        <span className="ipb-ico"><i /><i /><i /><i /></span>
        <span className="ipb-tx">
          <b>Instaliraj kodnas.de</b>
          <span>Kalkulator, vijesti i vodiči kao aplikacija — brzo, bez browsera.</span>
        </span>
      </div>

      {mode === "android" ? (
        <div className="ipb-btns">
          <button className="ipb-later" onClick={kasnije}>Kasnije</button>
          <button className="ipb-go" onClick={instaliraj}>⤓ Instaliraj aplikaciju</button>
        </div>
      ) : (
        <div className="ipb-steps">
          <div className="ipb-step">
            <span className="ipb-n">1</span> Dodirni
            <span className="ipb-share">
              <svg viewBox="0 0 24 24" fill="none" stroke="#0A84FF" strokeWidth="2">
                <path d="M12 16V4M8 8l4-4 4 4" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M6 12v7a1 1 0 001 1h10a1 1 0 001-1v-7" strokeLinecap="round" />
              </svg>
            </span>
            <b>Podijeli</b>
          </div>
          <div className="ipb-step">
            <span className="ipb-n">2</span> Izaberi <b>„Dodaj na početni ekran"</b>
          </div>
        </div>
      )}

      <style>{`
        .ipb {
          position: fixed; left: 12px; right: 12px;
          bottom: calc(70px + env(safe-area-inset-bottom));
          z-index: 1100; max-width: 520px; margin: 0 auto;
          background: #fff; border: 1px solid #e8ebee; border-radius: 18px;
          box-shadow: 0 12px 34px rgba(0,0,0,.22);
          padding: 14px 14px 13px; display: flex; flex-direction: column; gap: 11px;
          animation: ipb-up .28s ease;
        }
        @keyframes ipb-up { from { transform: translateY(20px); opacity: 0; } to { transform: none; opacity: 1; } }
        .ipb-x { position: absolute; top: 10px; right: 12px; background: none; border: none; color: #B6BCC4; font-size: 18px; font-weight: 700; cursor: pointer; line-height: 1; }
        .ipb-top { display: flex; align-items: center; gap: 12px; }
        .ipb-ico { width: 46px; height: 46px; border-radius: 12px; flex-shrink: 0; background: #1B4FD8; display: grid; grid-template-columns: 1fr 1fr; gap: 3px; padding: 9px; }
        .ipb-ico i { background: #fff; border-radius: 2px; }
        .ipb-ico i:nth-child(2), .ipb-ico i:nth-child(3) { opacity: .55; }
        .ipb-ico i:nth-child(4) { background: #22C55E; }
        .ipb-tx b { font-size: 14.5px; font-weight: 800; color: #111; display: block; }
        .ipb-tx span { font-size: 12px; color: #6B7280; line-height: 1.35; display: block; margin-top: 1px; }

        .ipb-btns { display: flex; gap: 9px; }
        .ipb-later { flex: 0 0 auto; padding: 11px 14px; border-radius: 11px; background: #F3F4F6; color: #6B7280; font-size: 13px; font-weight: 700; border: none; cursor: pointer; }
        .ipb-go { flex: 1; padding: 11px; border-radius: 11px; background: #1a8a4a; color: #fff; font-size: 14px; font-weight: 800; border: none; cursor: pointer; }

        .ipb-steps { display: flex; flex-direction: column; gap: 4px; }
        .ipb-step { display: flex; align-items: center; gap: 8px; font-size: 13.5px; color: #374151; }
        .ipb-step b { color: #111; }
        .ipb-n { width: 20px; height: 20px; border-radius: 50%; background: #EAF7EE; color: #1a8a4a; font-size: 11px; font-weight: 800; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .ipb-share { display: inline-flex; align-items: center; justify-content: center; width: 20px; height: 20px; }
        .ipb-share svg { width: 20px; height: 20px; }
      `}</style>
    </div>
  );
}
