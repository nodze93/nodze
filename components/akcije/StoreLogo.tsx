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
  const neutral = LOGO_MODE !== 'brand';
  // Duga imena (Kaufland = 8 znakova) moraju stati u kvadratnu pločicu od
  // ~46px unutrašnje širine — na 9.5px se "Kaufland" sjekao u "Kauflan".
  const fontSize = size === 'sm' ? undefined : text.length > 7 ? 8.5 : text.length > 5 ? 10.5 : 12.5;

  return (
    <span className={className} aria-label={name} title={name}>
      <span
        className={`wordmark${neutral ? ' wordmark-neutral' : ''}`}
        style={{
          background: neutral ? undefined : brand.bg,
          color: neutral ? undefined : brand.fg,
          fontSize: fontSize ? `${fontSize}px` : undefined,
        }}
      >
        {text}
      </span>
    </span>
  );
}
