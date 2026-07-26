"use client";

// ============================================================
// INSTALL BANER (Android/Chrome) — pojavi se kad korisnik vidi
// rezultat kalkulatora. Ne dira dizajn kalkulatora; sluša samo
// poruku iz iframe-a ("rezultat spreman") + beforeinstallprompt.
// ============================================================

import { useEffect, useRef, useState } from "react";

export default function InstallPrompt() {
  const deferredRef = useRef<any>(null);
  const dismissedRef = useRef(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    function onBIP(e: any) {
      e.preventDefault();
      deferredRef.current = e; // spremi prompt za kasnije
    }
    function onInstalled() {
      deferredRef.current = null;
      setShow(false);
      // javi backendu da je neko instalirao (za brojač u adminu)
      try {
        fetch("/api/track-install", { method: "POST", keepalive: true }).catch(() => {});
      } catch {}
    }
    function onMsg(e: MessageEvent) {
      const d: any = e.data;
      if (!d || d.type !== "kodnas-calc-result") return;
      if (dismissedRef.current) return;
      const standalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (navigator as any).standalone === true;
      if (standalone) return; // već instalirano → ne prikazuj
      if (deferredRef.current) setShow(true); // samo ako je instalacija moguća (Android/Chrome)
    }
    window.addEventListener("beforeinstallprompt", onBIP);
    window.addEventListener("appinstalled", onInstalled);
    window.addEventListener("message", onMsg);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBIP);
      window.removeEventListener("appinstalled", onInstalled);
      window.removeEventListener("message", onMsg);
    };
  }, []);

  async function instaliraj() {
    const d = deferredRef.current;
    if (!d) {
      setShow(false);
      return;
    }
    d.prompt();
    try {
      await d.userChoice;
    } catch {}
    deferredRef.current = null;
    setShow(false);
  }
  function kasnije() {
    dismissedRef.current = true;
    setShow(false);
  }

  if (!show) return null;

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
      <div className="ipb-btns">
        <button className="ipb-later" onClick={kasnije}>Kasnije</button>
        <button className="ipb-go" onClick={instaliraj}>⤓ Instaliraj aplikaciju</button>
      </div>

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
      `}</style>
    </div>
  );
}
