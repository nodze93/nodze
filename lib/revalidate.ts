import { revalidatePath } from "next/cache";

/**
 * Osvježi cijeli sajt odmah nakon admin izmjene (objava, uredi, reorder,
 * pin, brisanje, dodavanje). Bez ovoga stranice čekaju ISR keš (do 5 min),
 * pa objavljeni članci ne pređu odmah na naslovnu/kategorije.
 *
 * revalidatePath("/", "layout") poništi keš svih stranica ispod glavnog
 * layouta — naslovna, kategorije, /de, /bih, članak... sve se regeneriše
 * na sljedeći otvor.
 */
export function osvjeziSajt(): void {
  try {
    revalidatePath("/", "layout");
  } catch {
    /* revalidatePath nije dostupan u ovom kontekstu — ignoriši */
  }
}
