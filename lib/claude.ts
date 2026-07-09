import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Odgovara na pitanje dijaspore koristeći Claude AI.
 * Koristi se u AI-asistent dijelu portala.
 */
export async function pitajAsistenta(pitanje: string): Promise<string> {
  const message = await anthropic.messages.create({
    model: "claude-opus-4-5",
    max_tokens: 1024,
    system: `Ti si asistent portala kodnas.de — portala za Bosance koji žive u Njemačkoj i Austriji.
Odgovaraj na bosanskom/srpskom/hrvatskom jeziku.
Fokusiraj se na praktične informacije o: vizi, radu, stanovanju, zdravstvenom osiguranju (Krankenkasse), porezima (Steuer), porodičnim naknadama (Elterngeld, Kindergeld), penziji i povratku u BiH.
Budi koncizan, tačan i koristan. Ako nisi siguran, preporuči korisniku da se obrati nadležnoj instituciji.`,
    messages: [
      {
        role: "user",
        content: pitanje,
      },
    ],
  });

  const content = message.content[0];
  if (content.type === "text") {
    return content.text;
  }

  return "Nije moguće dobiti odgovor. Pokušaj ponovo.";
}

/**
 * Generira kratak sažetak članka za meta opis.
 */
export async function generirajSazetak(tekst: string): Promise<string> {
  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 200,
    messages: [
      {
        role: "user",
        content: `Napiši kratak sažetak (max 160 karaktera) za sljedeći tekst na bosanskom jeziku:\n\n${tekst}`,
      },
    ],
  });

  const content = message.content[0];
  return content.type === "text" ? content.text : "";
}
