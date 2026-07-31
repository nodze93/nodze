'use client';

import { EMPTY_FILTERS, type CategoryItem, type Filters, type SortKey, type StoreItem } from '@/lib/akcije/types';
import Sheet from './Sheet';

const PERCENT_STEPS = [0, 10, 20, 30, 50];
const SAVINGS_STEPS = [0, 1, 2, 5, 10];
const SORTS: Array<[SortKey, string]> = [
  ['percent', 'Najveći procent'],
  ['savings', 'Najveća ušteda'],
  ['price', 'Najniža cijena'],
  ['name', 'Naziv A-Z'],
];

interface Props {
  filters: Filters;
  stores: StoreItem[];
  categories: CategoryItem[];
  /** na stranici prodavnice se filter po prodavnici ne prikazuje */
  showStores?: boolean;
  onChange: (patch: Partial<Filters>) => void;
  onClose: () => void;
}

export default function FilterSheet({
  filters,
  stores,
  categories,
  showStores = true,
  onChange,
  onClose,
}: Props) {
  return (
    <Sheet title="Filteri" onClose={onClose}>
      {showStores && stores.length > 0 ? (
        <>
          <p className="sheet-lab">Prodavnica</p>
          <div className="chips">
            <button
              type="button"
              className="chip"
              aria-pressed={filters.store === ''}
              onClick={() => onChange({ store: '' })}
            >
              Sve
            </button>
            {stores.map((store) => (
              <button
                key={store.slug}
                type="button"
                className="chip"
                aria-pressed={filters.store === store.slug}
                onClick={() => onChange({ store: store.slug })}
              >
                {store.name} <span className="chip-count">{store.offers}</span>
              </button>
            ))}
          </div>
        </>
      ) : null}

      {categories.length > 0 ? (
        <>
          <p className="sheet-lab">Kategorija</p>
          <div className="chips">
            <button
              type="button"
              className="chip"
              aria-pressed={filters.category === ''}
              onClick={() => onChange({ category: '' })}
            >
              Sve
            </button>
            {categories.map((category) => (
              <button
                key={category.category}
                type="button"
                className="chip"
                aria-pressed={filters.category === category.category}
                onClick={() => onChange({ category: category.category })}
              >
                {category.category} <span className="chip-count">{category.offers}</span>
              </button>
            ))}
          </div>
        </>
      ) : null}

      <p className="sheet-lab">Popust (procent)</p>
      <div className="chips">
        {PERCENT_STEPS.map((step) => (
          <button
            key={step}
            type="button"
            className="chip"
            aria-pressed={filters.percent === step}
            onClick={() => onChange({ percent: step })}
          >
            {step === 0 ? 'Svi' : `${step}%+`}
          </button>
        ))}
      </div>

      <p className="sheet-lab">Ušteda u novcu</p>
      <div className="chips">
        {SAVINGS_STEPS.map((step) => (
          <button
            key={step}
            type="button"
            className="chip"
            aria-pressed={filters.savings === step}
            onClick={() => onChange({ savings: step })}
          >
            {step === 0 ? 'Sve' : `${step} €+`}
          </button>
        ))}
      </div>

      <p className="sheet-lab">Sortiranje</p>
      <div className="chips">
        {SORTS.map(([value, label]) => (
          <button
            key={value}
            type="button"
            className="chip"
            aria-pressed={filters.sort === value}
            onClick={() => onChange({ sort: value })}
          >
            {label}
          </button>
        ))}
      </div>

      {filters.percent > 0 || filters.savings > 0 ? (
        <p className="note">
          Artikli bez stare cijene („Angebot“) se ne prikazuju dok je aktivan filter po procentu ili
          ušteđi — za njih se popust ne može izračunati.
        </p>
      ) : null}

      <div className="sheet-actions">
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => onChange({ ...EMPTY_FILTERS, sort: filters.sort })}
        >
          Očisti sve
        </button>
        <button type="button" className="btn" onClick={onClose}>
          Prikaži rezultate
        </button>
      </div>
    </Sheet>
  );
}
