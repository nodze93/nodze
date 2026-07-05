# 🇧🇦 Dijaspora.ba — Kompletno uputstvo (portal + bot u jednom)

Ovo je JEDAN projekat koji sadrži sve: sajt, admin panel i bota.
Deploy-uje se kao jedna Next.js aplikacija na Vercel. Nema više odvojenog bot foldera.

## Kako bot radi (svih 5 kontrola)

```
08:00 i 20:00 svaki dan — po 3 članka (1 dijaspora + 1 svijet + 1 sport)
= 6 dnevno, 2 po kategoriji
   │
   ├─ 📡 RSS: Klix, N1, Slobodna Evropa, DW, Tagesschau, Spiegel,
   │         Make it in Germany + SVIJET: Al Jazeera Balkans, BBC,
   │         Guardian, DW World, Sky News
   │         + SPORT: Klix Sport, Sportske.net, BBC Sport, Kicker
   ├─ 📈 Trendovi (Google Trends / Autocomplete za Njemačku)
   │
   ├─ 1️⃣ FILTER agent (Haiku) — ocijeni 0-10, prolazi samo 6+
   ├─ 2️⃣ WRITER agent (Sonnet) — fetchuje IZVOR pa piše (ne izmišlja!)
   ├─ 3️⃣ FACT-CHECK agent — uporedi tvrdnje s izvorom → 🟢🟡🔴
   ├─ 4️⃣ CONTEXT agent — dijaspora ugao, klikabilan ali pošten naslov
   ├─ 5️⃣ JEZIK agent — lektor (kroatizmi, gramatika)
   │
   ├─ 🖼  Unsplash naslovna slika (samo URL — slika se NE čuva u bazi)
   └─ 💾 Supabase kao DRAFT → ti u adminu vidiš 🟢🟡🔴 i klikneš Objavi
```

Tvoj dnevni posao: otvoriš `/admin/clanci`, pogledaš draftove (2 min po članku), klikneš **Objavi**. 🟢 = spremno odmah, 🟡 = baci oko, 🔴 = ispravi prije objave.

---

## POSTAVLJANJE — korak po korak (30-45 min, jednom)

### 1) Supabase (baza) — besplatno
1. supabase.com → **New project** (region: Frankfurt).
2. **SQL Editor** → New query → zalijepi CIJELI sadržaj `supabase/schema.sql` → **Run**.
3. **Project Settings → API** — zapiši tri stvari:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY` ⚠️ **TAJNO! Bot piše s ovim ključem.**

### 2) Claude API — plaća se po korištenju (sitno)
1. console.anthropic.com → **API Keys** → Create Key → `ANTHROPIC_API_KEY`.
2. Dodaj kredit ($5-10 je dosta za početak). Trošak: ~$0.02-0.06 po članku
   (Haiku za provjere, Sonnet za pisanje) → **$6-15/mjesečno za 6 članaka/dan**.

### 2b) Unsplash — naslovne slike (besplatno)
1. unsplash.com/developers → **Your apps** → New Application (prihvati uslove).
2. Kopiraj **Access Key** → `UNSPLASH_ACCESS_KEY`.
3. Demo tier (50 zahtjeva/sat) je višestruko dovoljan za 6 članaka dnevno.
   Bez ključa sve radi — članci samo idu bez slike.

### 3) Lokalno testiranje (prije deploya!)
```bash
cp .env.local.example .env.local    # pa popuni SVE vrijednosti
npm install
npm run bot                          # ← pokreni bota ručno!
```
Bot će pročitati feedove, napisati članke i spremiti ih u Supabase kao draft.
Provjeri: Supabase → Table Editor → `clanci` → vidjećeš redove sa `status = draft`.

```bash
npm run dev                          # pokreni sajt na localhost:3000
```
Otvori `http://localhost:3000/admin/login` → lozinka je tvoj `ADMIN_SECRET` iz `.env.local`.
U admin → Članci vidiš draftove s 🟢🟡🔴 → klikni **Objavi** → članak se pojavi na sajtu.

### 4) Deploy na Vercel — SIGURAN TOK: preview prvo, pa live
Repo već ima DVIJE grane: `main` (produkcija → kodnas.de) i `preview` (testiranje).
**Pravilo: sve promjene idu na `preview` granu. Na `main` ide samo merge koji ti odobriš.**

```bash
# 1. Napravi privatni repo na github.com (npr. "dijaspora-portal"), pa:
git remote add origin https://github.com/TVOJ-USERNAME/dijaspora-portal.git
git push -u origin main
git push -u origin preview
```

2. vercel.com → **Add New → Project** → Import tvoj repo → Deploy.
3. **Settings → Environment Variables** → dodaj SVE iz `.env.local`
   (za Production I Preview okruženja):
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`, `CRON_SECRET`,
   `ADMIN_SECRET`, `UNSPLASH_ACCESS_KEY`, `CLANCI_DIJASPORA`, `CLANCI_SVIJET`, `CLANCI_SPORT`
4. **PREVIEW LINK**: Vercel automatski pravi preview deploy za `preview` granu —
   naći ćeš link u Deployments (izgleda kao `dijaspora-portal-git-preview-....vercel.app`).
   Tu SVE testiraš prije nego išta ide live.
5. **Domena kodnas.de**: Settings → Domains → Add → `kodnas.de` → prati DNS upute.
   Domena se veže SAMO za `main` granu (Production).
6. Kad si zadovoljan/na previewom:
   ```bash
   git checkout main && git merge preview && git push origin main
   ```
   → to je tvoje "odobrenje" i tek tada ide na kodnas.de.

### 5) Raspored 08:00 i 20:00 — GitHub Actions (besplatno)
Vercel Hobby plan dozvoljava cron samo 1x dnevno, pa 2x-dnevni raspored vozi
GitHub Actions (fajl `.github/workflows/bot-cron.yml` — već je u repou):
1. GitHub repo → **Settings → Secrets and variables → Actions** → New repository secret:
   - `SITE_URL` = `https://kodnas.de` (ili Vercel URL dok domena ne proradi)
   - `CRON_SECRET` = isti string kao u Vercel env
2. Test: repo → **Actions** → "Dijaspora bot" → **Run workflow**.
(Ako pređeš na Vercel Pro: `vercel.json` već ima oba crona — onda možeš obrisati workflow.)

Test na produkciji:
```bash
curl -H "Authorization: Bearer TVOJ_CRON_SECRET" https://tvoj-sajt.vercel.app/api/cron/daily-content
```
Ili u adminu: **Pipeline → ⚡ Pokreni odmah**.

---

## Admin panel

- Adresa: **`/admin/login`** (lokalno `http://localhost:3000/admin/login`, na produkciji `https://kodnas.de/admin/login`)
- Lozinka: tvoj **`ADMIN_SECRET`** iz env varijabli (nema default lozinke!)
- Stranice:
  - **Dashboard** — statistika, koliko članaka čeka odobrenje
  - **Članci** — bot draftovi sa 🟢🟡🔴 semaforom → klik **Objavi**; uređivanje; ručno pisanje
  - **Pipeline** — logovi svakog pokretanja bota + dugme **⚡ Pokreni odmah**
  - **Newsletter** — lista pretplatnika

## Struktura bota

| Fajl | Uloga |
|------|-------|
| `lib/bot/izvori.ts`          | RSS feedovi (dijaspora + svijet) i zvanični izvori |
| `lib/bot/rss.ts`             | Čita feedove, drži samo svježe (<48h) |
| `lib/bot/trends.ts`          | Google trendovi za Njemačku (s fallbackom) |
| `lib/bot/agenti/filter.ts`   | 1️⃣ Ocjena relevantnosti/klikabilnosti |
| `lib/bot/agenti/writer.ts`   | 2️⃣ Pisanje (fetchuje izvor prvo!) |
| `lib/bot/agenti/factcheck.ts`| 3️⃣ Fact-check + 4️⃣ Context |
| `lib/bot/agenti/jezik.ts`    | 5️⃣ Lektor |
| `lib/bot/publisher.ts`       | Upis drafta + dedupe + logovi |
| `lib/bot/pipeline.ts`        | Sve spaja |
| `app/api/cron/daily-content/route.ts` | Cron endpoint (CRON_SECRET) |
| `scripts/run-bot.ts`         | Lokalno: `npm run bot` |

## Podešavanja koja ćeš možda htjeti mijenjati

- **Broj članaka**: `CLANCI_DIJASPORA` / `CLANCI_SVIJET` / `CLANCI_SPORT` u env —
  broj PO POKRETANJU po kategoriji (default 1+1+1 = 3 po terminu, 6 dnevno).
- **Feedovi**: `lib/bot/izvori.ts` — dodaj/izbaci portale po želji.
- **Raspored**: `vercel.json` → `"schedule": "0 6 * * *"` (UTC). Napomena:
  Vercel Hobby plan dozvoljava dnevne cron-ove; za 2-3x dnevno treba Pro plan
  (ili pokreći ručno dugmetom u adminu — besplatno).

## Sigurnost (već ugrađeno)

- Admin lozinka NEMA default — bez `ADMIN_SECRET` env varijable niko ne može ući.
- `/api/admin/*` rute su zaštićene middleware-om (cookie), `/api/cron` sa `CRON_SECRET`.
- Bot piše u bazu preko `service_role` ključa (samo na serveru), javnost kroz RLS
  vidi isključivo objavljene članke.
- `.env.local` je u `.gitignore` — ključevi nikad ne idu na GitHub.

## Ako nešto ne radi

- **Bot ne piše ništa**: provjeri `ANTHROPIC_API_KEY` (i kredit) te `SUPABASE_SERVICE_ROLE_KEY`.
- **`npm run bot` javi grešku kolone**: nisi pokrenuo NOVI `supabase/schema.sql` — pokreni ga.
- **Članci se ne vide na sajtu**: jesu li **objavljeni** (ne draft)? Sajt keš drži do 5 min.
- **Neki RSS feed ne radi**: normalno, bot ga preskače. Ako ih je više mrtvih, osvježi listu u `izvori.ts`.
