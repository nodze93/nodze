// ============================================================
// LOKALNO POKRETANJE BOTA (bez deploya): npm run bot
// ============================================================
import { config } from "dotenv";
config({ path: ".env.local" });

import { pokreniPipeline } from "../lib/bot/pipeline";
import { pokreniPipeline2 } from "../lib/bot/pipeline2";

// Lijevak ("Dnevni filter") je PODRAZUMIJEVAN.
// Povratak na stari bot: postavi env NOVI_PIPELINE=off
const koristiStari = process.env.NOVI_PIPELINE === "off";
const pokreni = koristiStari ? pokreniPipeline : pokreniPipeline2;

pokreni()
  .then((r) => {
    console.log("\n=== REZULTAT ===");
    console.log(JSON.stringify(r, null, 2));
    process.exit(0);
  })
  .catch((e) => {
    console.error("Fatalna greška:", e);
    process.exit(1);
  });
