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
  // CIJELA — želja korisnika: „nebitno što je smanjeno". Uz padding 6px
  // pločica ima ~52px unutrašnje širine, pa "Kaufland" staje na 9px.
  const fontSize = size === 'sm' ? undefined : text.length > 7 ? 9 : text.length > 5 ? 10.5 : 12.5;

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
        }}
      >
        {text}
      </span>
    </span>
  );
}
