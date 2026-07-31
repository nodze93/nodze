'use client';

import { useState } from 'react';
import { usePlz } from './PlzProvider';
import Sheet from './Sheet';

const SUGGESTIONS = ['85737', '80331', '10115'];

export default function PlzSheet({ onClose }: { onClose: () => void }) {
  const { plz, setPlz } = usePlz();
  const [value, setValue] = useState(plz);
  const [error, setError] = useState<string | null>(null);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!/^\d{5}$/.test(value)) {
      setError('PLZ mora imati tačno 5 cifara.');
      return;
    }
    setPlz(value);
    onClose();
  };

  return (
    <Sheet title="Tvoja lokacija" onClose={onClose}>
      <p className="note" style={{ marginTop: 4 }}>
        Upiši poštanski broj (PLZ) i dobijaš ponude prodavnica u toj okolini. Podaci su već u bazi,
        pa je prikaz trenutan.
      </p>

      <form onSubmit={submit}>
        <div className="searchbar-in" style={{ padding: '14px 0 0' }}>
          <input
            className="input"
            type="text"
            inputMode="numeric"
            autoFocus
            maxLength={5}
            placeholder="npr. 85737"
            value={value}
            onChange={(event) => {
              setValue(event.target.value.replace(/\D/g, '').slice(0, 5));
              setError(null);
            }}
            aria-label="Poštanski broj"
          />
        </div>
        {error ? (
          <p className="note" style={{ color: 'var(--sale)' }}>
            {error}
          </p>
        ) : null}

        <p className="sheet-lab">Brzi odabir</p>
        <div className="chips">
          {SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              className="chip"
              aria-pressed={value === suggestion}
              onClick={() => setValue(suggestion)}
            >
              {suggestion}
            </button>
          ))}
        </div>

        <div className="sheet-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Odustani
          </button>
          <button type="submit" className="btn">
            Prikaži ponude
          </button>
        </div>
      </form>
    </Sheet>
  );
}
