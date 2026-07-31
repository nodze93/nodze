export interface Discount {
  id: string;
  product_name: string;
  old_price: number | null;
  new_price: number;
  discount_percent: number | null;
  savings: number | null;
  store: string;
  store_slug: string;
  category: string | null;
  plz: string;
  date: string;
  image_url: string | null;
  /** false = fotografija je od drugog pakovanja istog artikla */
  image_exact?: boolean;
  image_attribution?: string | null;
  valid_from?: string | null;
  valid_to: string | null;
  source_url?: string | null;
  is_angebot: boolean;
  /** 'prospekt' = staru cijenu dao letak; 'berechnet' = nas 30-dnevni izracun */
  rabatt_quelle?: 'prospekt' | 'berechnet' | null;
}

export interface DiscountsResponse {
  plz: string;
  date: string | null;
  total: number;
  count: number;
  limit: number;
  offset: number;
  items: Discount[];
}

export interface StoreItem {
  id: number;
  name: string;
  slug: string;
  logo_url: string | null;
  offers: number;
  offers_with_percent: number;
}

export interface CategoryItem {
  category: string;
  offers: number;
}

export interface Meta {
  plz: string;
  date: string | null;
  total: number;
  with_percent: number;
  angebot_only: number;
  stores: number;
  max_percent: number | null;
  max_savings: number | null;
}

export type SortKey = 'percent' | 'savings' | 'price' | 'name';

export interface Filters {
  plz: string;
  store: string;
  category: string;
  percent: number;
  savings: number;
  q: string;
  sort: SortKey;
}

export const EMPTY_FILTERS: Omit<Filters, 'plz'> = {
  store: '',
  category: '',
  percent: 0,
  savings: 0,
  q: '',
  sort: 'percent',
};
