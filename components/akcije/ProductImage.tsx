'use client';

import { useState } from 'react';
import ProductArt from './ProductArt';

interface Props {
  imageUrl: string | null;
  category: string | null;
  productName: string;
  /** velicina fallback ilustracije */
  artSize: number;
}

/**
 * Slika artikla sa sigurnosnom mrezom.
 *
 * 1) Ako u bazi ima `image_url` (scraper ga vadi iz izvora) - prikazuje se
 *    PRAVA fotografija proizvoda.
 * 2) Dok se ucitava, ide blagi shimmer da kartica ne poskakuje.
 * 3) Ako URL padne (404, istekao CDN link, blokiran hotlink) - automatski
 *    se prikazuje ilustracija. Korisnik nikad ne vidi praznu ili polomljenu
 *    sliku, sto je vazno jer URL-ovi izvora zive samo dok traje letak.
 */
/**
 * Neki izvori (npr. Kaufland) umjesto prave slike znaju vratiti "fallback"
 * placeholder — njihov sivi logo. Takav URL tretiramo kao da slike nema, pa
 * se prikaže naša ilustracija umjesto tuđeg sivog placeholdera.
 */
function isPlaceholder(url: string): boolean {
  return /fallback|placeholder|\/etc\.clientlibs\/|blank\.|spacer|1x1|transparent\./i.test(url);
}

export default function ProductImage({ imageUrl, category, productName, artSize }: Props) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  if (!imageUrl || failed || isPlaceholder(imageUrl)) {
    return <ProductArt category={category} productName={productName} size={artSize} />;
  }

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt={productName}
        loading="lazy"
        decoding="async"
        // bez referera: dio CDN-ova blokira hotlink po Referer headeru
        referrerPolicy="no-referrer"
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
        style={{ opacity: loaded ? 1 : 0, transition: 'opacity .18s' }}
      />
      {loaded ? null : <span className="img-shimmer" aria-hidden="true" />}
    </>
  );
}
