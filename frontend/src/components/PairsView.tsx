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
          <Field label="Pair Name" value={pairForm.pairName} onChange={(value) => setPairFormValue("pairName", value)} required />
          <Field label="Icon" value={pairForm.icon} onChange={(value) => setPairFormValue("icon", value)} />
          <button className="primary-button" disabled={loading} type="submit">
            Save Pair
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
                  <strong>{pair.pairName}</strong>
                </article>
              ))
            )}
          </section>
        </section>
      </section>
    </>
  );
}
