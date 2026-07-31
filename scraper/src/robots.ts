/**
 * Minimalna robots.txt provjera. Ako nam sajt eksplicitno zabranjuje
 * putanju, scraper se zaustavlja. Ovo je namjerno prvi korak u pipeline-u.
 */
export interface RobotsRules {
  disallow: string[];
  allow: string[];
  crawlDelayMs: number | null;
}

export async function fetchRobots(
  baseUrl: string,
  userAgent: string,
): Promise<RobotsRules | null> {
  try {
    const response = await fetch(new URL('/robots.txt', baseUrl), {
      headers: { 'user-agent': userAgent },
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) return null;
    return parseRobots(await response.text(), userAgent);
  } catch {
    return null; // nema robots.txt ili je mreza pala - ne blokiramo zbog toga
  }
}

export function parseRobots(text: string, userAgent: string): RobotsRules {
  const ua = userAgent.toLowerCase();
  const groups: Array<{ agents: string[]; rules: RobotsRules }> = [];
  let current: (typeof groups)[number] | null = null;
  let lastWasAgent = false;

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.replace(/#.*$/, '').trim();
    if (!line) continue;
    const [rawKey, ...rest] = line.split(':');
    const key = (rawKey ?? '').trim().toLowerCase();
    const value = rest.join(':').trim();

    if (key === 'user-agent') {
      if (!current || !lastWasAgent) {
        current = { agents: [], rules: { disallow: [], allow: [], crawlDelayMs: null } };
        groups.push(current);
      }
      current.agents.push(value.toLowerCase());
      lastWasAgent = true;
      continue;
    }
    if (!current) continue;
    lastWasAgent = false;

    if (key === 'disallow' && value) current.rules.disallow.push(value);
    else if (key === 'allow' && value) current.rules.allow.push(value);
    else if (key === 'crawl-delay') {
      const seconds = Number(value.replace(',', '.'));
      if (Number.isFinite(seconds)) current.rules.crawlDelayMs = seconds * 1000;
    }
  }

  const exact = groups.find((g) => g.agents.some((a) => a !== '*' && ua.includes(a)));
  const wildcard = groups.find((g) => g.agents.includes('*'));
  return exact?.rules ?? wildcard?.rules ?? { disallow: [], allow: [], crawlDelayMs: null };
}

export function isAllowed(rules: RobotsRules | null, path: string): boolean {
  if (!rules) return true;
  const matchLength = (patterns: string[]) =>
    patterns.reduce((best, pattern) => {
      const prefix = pattern.replace(/\*.*$/, '');
      return path.startsWith(prefix) ? Math.max(best, prefix.length) : best;
    }, -1);

  const blocked = matchLength(rules.disallow);
  if (blocked < 0) return true;
  return matchLength(rules.allow) >= blocked;
}
