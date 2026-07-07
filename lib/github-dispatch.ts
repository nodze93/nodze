// ============================================================
// GitHub Actions dispatch — pokreni bota (bot-cron.yml)
// ============================================================
export interface BotInputs {
  de?: string;
  bih?: string;
  svijet?: string;
  sport?: string;
}

export interface DispatchRezultat {
  ok: boolean;
  status?: number;
  error?: string;
}

/**
 * Pozovi GitHub Actions workflow_dispatch za bota.
 * Šalje `inputs` (kvote) — workflow mora imati deklarisane inputs
 * (nova verzija bot-cron.yml). Bez GITHUB_TOKEN vraća grešku.
 */
export async function dispatchBot(inputs?: BotInputs): Promise<DispatchRezultat> {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO || "nodze93/nodze";
  const workflow = process.env.GITHUB_WORKFLOW || "bot-cron.yml";
  const ref = process.env.GITHUB_REF || "main";

  if (!token) {
    return {
      ok: false,
      status: 400,
      error:
        "GITHUB_TOKEN nije postavljen u Vercel env varijablama. Dodaj ga (repo scope) da bi automatsko pokretanje radilo.",
    };
  }

  try {
    const res = await fetch(
      `https://api.github.com/repos/${repo}/actions/workflows/${workflow}/dispatches`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(inputs ? { ref, inputs } : { ref }),
      }
    );

    if (res.status === 204) return { ok: true };
    const detalj = await res.text();
    return { ok: false, status: res.status, error: `GitHub API ${res.status}: ${detalj.slice(0, 200)}` };
  } catch (err) {
    return { ok: false, status: 500, error: (err as Error).message };
  }
}
