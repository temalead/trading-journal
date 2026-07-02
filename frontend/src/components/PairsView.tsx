import { FormEvent } from "react";
import { TickerPair } from "../api/pairs";
import { PairFormState } from "../types/forms";
import { pairInitials } from "../utils/format";
import { Field } from "./Field";

type PairsViewProps = {
  loading: boolean;
  pairForm: PairFormState;
  pairs: TickerPair[];
  search: string;
  setPairFormValue: <Key extends keyof PairFormState>(key: Key, value: PairFormState[Key]) => void;
  setSearch: (value: string) => void;
  submitPair: (event: FormEvent<HTMLFormElement>) => void;
};

export function PairsView({
  loading,
  pairForm,
  pairs,
  search,
  setPairFormValue,
  setSearch,
  submitPair,
}: PairsViewProps) {
  const pairNamePreview = pairForm.pairName.trim().toUpperCase() || "EURUSD";
  const iconPreview = pairForm.icon.trim() || pairInitials(pairNamePreview);

  function applyPreset(pairName: string, icon: string) {
    setPairFormValue("pairName", pairName);
    setPairFormValue("icon", icon);
  }

  return (
    <>
      <section className="page-head">
        <div>
          <h1>Pairs</h1>
          <p>Manage the ticker pairs available for new deals.</p>
        </div>
      </section>

      <section className="pairs-layout">
        <form className="pair-form" onSubmit={submitPair}>
          <div className="pair-form-head">
            <div>
              <h2>Add Pair</h2>
              <span>{pairs.length} available</span>
            </div>
            <div className="pair-preview">
              <span className="pair-icon">{iconPreview}</span>
              <strong>{pairNamePreview}</strong>
            </div>
          </div>

          <div className="quick-pair-row" aria-label="Default pairs">
            {defaultPairPresets.map((pair) => (
              <button
                className="quick-pair"
                key={pair.pairName}
                onClick={() => applyPreset(pair.pairName, pair.icon)}
                type="button"
              >
                <span>{pair.icon}</span>
                {pair.pairName}
              </button>
            ))}
          </div>

          <div className="pair-form-fields">
            <Field label="Symbol" value={pairForm.pairName} onChange={(value) => setPairFormValue("pairName", value)} required />
            <Field label="Badge" value={pairForm.icon} onChange={(value) => setPairFormValue("icon", value)} />
          </div>

          <button className="primary-button" disabled={loading} type="submit">
            {loading ? "Saving..." : "Add Pair"}
          </button>
        </form>

        <section>
          <section className="filters filters-compact">
            <label className="search-field">
              <span>⌕</span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                type="search"
                placeholder="Search pairs"
              />
            </label>
          </section>

          <section className="pair-grid">
            {pairs.length === 0 ? (
              <div className="empty-card">No pairs yet.</div>
            ) : (
              pairs.map((pair) => (
                <article className="pair-card" key={pair.id ?? pair.pairName}>
                  <span className="pair-icon">{pair.icon || pairInitials(pair.pairName)}</span>
                  <div>
                    <strong>{pair.pairName}</strong>
                    <span>Ready</span>
                  </div>
                </article>
              ))
            )}
          </section>
        </section>
      </section>
    </>
  );
}

const defaultPairPresets = [
  { pairName: "EURUSD", icon: "EU" },
  { pairName: "GBPUSD", icon: "GB" },
  { pairName: "US30", icon: "US" },
  { pairName: "GER40", icon: "DE" },
];
