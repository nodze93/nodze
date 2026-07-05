// ============================================================
// LOKALNO POKRETANJE BOTA (bez deploya): npm run bot
// ============================================================
import { config } from "dotenv";
config({ path: ".env.local" });

import { pokreniPipeline } from "../lib/bot/pipeline";

pokreniPipeline()
  .then((r) => {
    console.log("\n=== REZULTAT ===");
    console.log(JSON.stringify(r, null, 2));
    process.exit(0);
  })
  .catch((e) => {
    console.error("Fatalna greška:", e);
    process.exit(1);
  });
