import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  // ================================================================
  // 301 preusmjerenja starih vodiča na spojene tekstove.
  // PRAVILO: redirect se dodaje TEK kad je odredišni tekst živ u bazi
  // — inače stari (dobar) sadržaj vodi na prazno. Ova prva grupa vodi
  // na tekstove koji su već objavljeni (radna viza, krankenkasse,
  // porezi). Ostali se dodaju kad njihova grupa dobije tekst —
  // spisak čeka zakomentarisan ispod.
  // ================================================================
  async redirects() {
    return [
      // → Viza i dolazak (radna-viza-njemacka pokriva sva tri puta)
      { source: "/vodic/westbalkan-regulacija", destination: "/vodic/radna-viza-njemacka", permanent: true },
      { source: "/vodic/chancenkarte", destination: "/vodic/radna-viza-njemacka", permanent: true },
      { source: "/vodic/eu-plava-karta", destination: "/vodic/radna-viza-njemacka", permanent: true },
      // → Zdravstvo (krankenkasse ima sekciju o zubima i dodatnim osiguranjima)
      { source: "/vodic/zubar-zahnarzt", destination: "/vodic/krankenkasse", permanent: true },
      // → Novac i porezi
      { source: "/vodic/povrat-poreza", destination: "/vodic/porezi-njemacka", permanent: true },
      { source: "/vodic/kindergeld-poreske-klase", destination: "/vodic/porezi-njemacka", permanent: true },

      // ---- ČEKAJU SVOJ TEKST (ne otkomentarisati prije objave!) ----
      // Stan:      pronalazak-stana, mietvertrag-ugovor-o-najmu, mietkaution-kaucija,
      //            nebenkosten-obracun, prava-stanara, otkaz-najma-iseljenje,
      //            wohngeld-socijalni-stan, struja-internet-rundfunkbeitrag → /vodic/stan-u-njemackoj
      // Porodica:  trudnoca-njemacka, elterngeld-elternzeit, dijete-rodjeno-u-njemackoj,
      //            vrtic-kita-kindergarten, skola-u-njemackoj, vjencanje-njemacka-standesamt,
      //            razvod-izdrzavanje-djece, njega-starijih-pflege → /vodic/porodica-u-njemackoj
      // Posao:     priznavanje-diplome-anerkennung, ausbildung-njega-medicina,
      //            njemacki-jezik-ucenje → /vodic/posao-i-diploma
      // Zdravstvo: kod-ljekara-hausarzt-facharzt, bolovanje-krankmeldung, lijekovi-apoteka,
      //            hitni-slucajevi-112-116117, djeca-kod-ljekara,
      //            dopunsko-osiguranje-mentalno-zdravlje → /vodic/krankenkasse (nakon dopune)
      // Penzija:   povratak-bih → /vodic/penzija-i-povratak
    ];
  },
};

export default nextConfig;
