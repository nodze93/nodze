export type Kategorija =
  | "sve"
  | "viza"
  | "posao"
  | "stan"
  | "zdravstvo"
  | "porodica"
  | "porez"
  | "penzija"
  | "povratak";

export type TagTip =
  | "viza"
  | "posao"
  | "stan"
  | "zdravstvo"
  | "porodica"
  | "bih"
  | "porez"
  | "penzija"
  | "dokumenti"
  | "finansije"
  | "vijesti"
  | "sport"
  | "svijet"
  | "povratak";

export interface Clanak {
  id: string;
  naslov: string;
  excerpt?: string;
  kategorija: TagTip;
  datum: string;
  minCitanja: number;
  procitano?: number;
  slug: string;
}

export interface Vodic {
  id: string;
  naziv: string;
  opis: string;
  ikona: string;
  koraci: number;
  minCitanja: number;
  slug: string;
}

export interface FaqStavka {
  pitanje: string;
  odgovor: string;
}
