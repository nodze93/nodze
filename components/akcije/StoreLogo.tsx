import { storeBrand } from '@/lib/akcije/stores';
import BrandLogo, { hasBrandMark } from './BrandLogo';

interface Props {
  slug: string;
  name: string;
  logoUrl?: string | null;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Plocica prodavnice. Redoslijed:
 *   1. `logo_url` iz baze  -> prava slika logotipa (kad dobijes prava)
 *   2. crtani SVG brand mark (BrandLogo)  -> za poznate lance
 *   3. tipografski wordmark  -> fallback za nepoznate
 */
/**
 * 'neutral' (default) = samo ime prodavnice, bez brand boja. Sigurnije:
 *   navodjenje imena je opisna upotreba, a oponasanje vizualnog identiteta
 *   je rizicnije (vidi docs/pravno.md).
 * 'brand' = nacrtani wordmark u bojama prodavnice - uklopi samo ako imas dozvolu.
 */
const LOGO_MODE = process.env.NEXT_PUBLIC_STORE_LOGOS ?? 'neutral';

export default function StoreLogo({ slug, name, logoUrl, size = 'lg' }: Props) {
  const className = `logo ${size === 'sm' ? 'logo-sm' : size === 'md' ? 'logo-md' : ''}`;

  if (logoUrl) {
    return (
      <span className={className}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoUrl} alt={name} style={{ maxWidth: '100%', maxHeight: '100%' }} />
      </span>
    );
  }

  if (LOGO_MODE === 'brand' && hasBrandMark(slug)) {
    return (
      <span className={`${className} logo-brand`} aria-label={name} title={name}>
        <BrandLogo slug={slug} />
      </span>
    );
  }

  const brand = storeBrand(slug, name);
  const text = size === 'sm' ? brand.short : brand.label;
  // Duga imena (Kaufland = 8 znakova) moraju stati u pločicu ISPISANA
  // CIJELA — želja korisnika: „nebitno što je smanjeno". Pored fonta se
  // za duga imena skuplja i unutrašnji padding pločice: on je (4+8px sa
  // svake strane) jeo prostor pa je i na 9px ostajalo "Kaufl…".
  const dugo = text.length > 7;
  const fontSize = size === 'sm' ? undefined : dugo ? 8 : text.length > 5 ? 10.5 : 12.5;

  // BOJE, ALI NAŠA TIPOGRAFIJA (odluka korisnika, 2.8.2026): pločica nosi
  // prepoznatljive boje lanca (Lidl žuto-plavo, Kaufland crveno…), ali ime
  // je ispisano NAŠIM običnim fontom — ne crta se njihov logotip niti
  // oponaša njihovo pismo. Navođenje imena je opisna upotreba žiga, a
  // izbjegavanje njihovog vizuala drži rizik nisko (vidi docs/pravno.md).
  // Crtani SVG logotipi (BrandLogo) ostaju IZA env prekidača, isključeni.
  return (
    <span className={className} aria-label={name} title={name}>
      <span
        className="wordmark"
        style={{
          background: brand.bg,
          color: brand.fg,
          fontSize: fontSize ? `${fontSize}px` : undefined,
          padding: size !== 'sm' && dugo ? '4px 4px' : undefined,
          letterSpacing: size !== 'sm' && dugo ? '-0.02em' : undefined,
        }}
      >
        {text}
      </span>
    </span>
  );
}
