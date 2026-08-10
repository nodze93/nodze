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

      // → Posao i diploma (tekst živi na slugu priznavanje-diplome-anerkennung)
      { source: "/vodic/ausbildung-njega-medicina", destination: "/vodic/priznavanje-diplome-anerkennung", permanent: true },
      { source: "/vodic/njemacki-jezik-ucenje", destination: "/vodic/priznavanje-diplome-anerkennung", permanent: true },

      // → Stan (svih 8 starih stanovanjskih tema u jedan tekst)
      { source: "/vodic/pronalazak-stana", destination: "/vodic/stan-u-njemackoj", permanent: true },
      { source: "/vodic/mietvertrag-ugovor-o-najmu", destination: "/vodic/stan-u-njemackoj", permanent: true },
      { source: "/vodic/mietkaution-kaucija", destination: "/vodic/stan-u-njemackoj", permanent: true },
      { source: "/vodic/nebenkosten-obracun", destination: "/vodic/stan-u-njemackoj", permanent: true },
      { source: "/vodic/prava-stanara", destination: "/vodic/stan-u-njemackoj", permanent: true },
      { source: "/vodic/otkaz-najma-iseljenje", destination: "/vodic/stan-u-njemackoj", permanent: true },
      { source: "/vodic/wohngeld-socijalni-stan", destination: "/vodic/stan-u-njemackoj", permanent: true },
      { source: "/vodic/struja-internet-rundfunkbeitrag", destination: "/vodic/stan-u-njemackoj", permanent: true },

      // → Porodica
      { source: "/vodic/trudnoca-njemacka", destination: "/vodic/porodica-u-njemackoj", permanent: true },
      { source: "/vodic/elterngeld-elternzeit", destination: "/vodic/porodica-u-njemackoj", permanent: true },
      { source: "/vodic/dijete-rodjeno-u-njemackoj", destination: "/vodic/porodica-u-njemackoj", permanent: true },
      { source: "/vodic/vrtic-kita-kindergarten", destination: "/vodic/porodica-u-njemackoj", permanent: true },
      { source: "/vodic/skola-u-njemackoj", destination: "/vodic/porodica-u-njemackoj", permanent: true },
      { source: "/vodic/vjencanje-njemacka-standesamt", destination: "/vodic/porodica-u-njemackoj", permanent: true },
      { source: "/vodic/razvod-izdrzavanje-djece", destination: "/vodic/porodica-u-njemackoj", permanent: true },
      { source: "/vodic/njega-starijih-pflege", destination: "/vodic/porodica-u-njemackoj", permanent: true },

      // → Zdravstvo (krankenkasse sad ima ljekara, hitnu, bolovanje, djecu i dopunska)
      { source: "/vodic/kod-ljekara-hausarzt-facharzt", destination: "/vodic/krankenkasse", permanent: true },
      { source: "/vodic/bolovanje-krankmeldung", destination: "/vodic/krankenkasse", permanent: true },
      { source: "/vodic/lijekovi-apoteka", destination: "/vodic/krankenkasse", permanent: true },
      { source: "/vodic/hitni-slucajevi-112-116117", destination: "/vodic/krankenkasse", permanent: true },
      { source: "/vodic/djeca-kod-ljekara", destination: "/vodic/krankenkasse", permanent: true },
      { source: "/vodic/dopunsko-osiguranje-mentalno-zdravlje", destination: "/vodic/krankenkasse", permanent: true },

      // → Penzija i povratak
      { source: "/vodic/povratak-bih", destination: "/vodic/penzija-i-povratak", permanent: true },
    ];
  },
};

export default nextConfig;
