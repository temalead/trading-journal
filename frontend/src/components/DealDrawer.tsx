import { FormEvent } from "react";
import { DealResult } from "../api/deals";
import { TickerPair } from "../api/pairs";
import { DealFormState } from "../types/forms";
import { pairInitials } from "../utils/format";
import { Field } from "./Field";

type DealDrawerProps = {
  dealForm: DealFormState;
  pairs: TickerPair[];
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  setDealFormValue: <Key extends keyof DealFormState>(key: Key, value: DealFormState[Key]) => void;
};

export function DealDrawer({ dealForm, pairs, onClose, onSubmit, setDealFormValue }: DealDrawerProps) {
  const selectedPair = pairs.find((pair) => pair.id === dealForm.tickerPairId);

  return (
    <section className="drawer" aria-hidden={false}>
      <div className="drawer-panel">
        <div className="drawer-head">
          <div>
            <h2>New Deal</h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <form className="deal-form" onSubmit={onSubmit}>
          <section className="deal-summary wide">
            <div className="summary-pair">
              <span className="pair-icon large">{selectedPair?.icon || pairInitials(selectedPair?.pairName)}</span>
              <div>
                <strong>{selectedPair?.pairName ?? "Select pair"}</strong>
                <span>{dealForm.currency || "Currency"} account</span>
              </div>
            </div>
            <div className="summary-metrics">
              <div>
                <span>RR</span>
                <strong>{dealForm.riskReward || "-"}</strong>
              </div>
              <div>
                <span>Result</span>
                <strong>{resultLabel(dealForm.result)}</strong>
              </div>
            </div>
          </section>

          <section className="form-section wide">
            <div className="section-title">
              <span>◎</span>
              <strong>Deal Info</strong>
            </div>
            <div className="form-grid">
              <label className="wide">
                Pair
                <select
                  value={dealForm.tickerPairId}
                  onChange={(event) => setDealFormValue("tickerPairId", event.target.value)}
                  required
                >
                  <option value="" disabled>
                    Select pair
                  </option>
                  {pairs.map((pair) => (
                    <option key={pair.id ?? pair.pairName} value={pair.id ?? ""}>
                      {pair.icon ? `${pair.icon} ` : ""}
                      {pair.pairName}
                    </option>
                  ))}
                </select>
              </label>
              <div className="pair-picker wide" aria-label="Existing pairs">
                {pairs.length === 0 ? (
                  <span className="pair-picker-empty">Create a pair before saving a deal.</span>
                ) : (
                  pairs.map((pair) => (
                    <button
                      className={`pair-option ${dealForm.tickerPairId === pair.id ? "selected" : ""}`}
                      disabled={!pair.id}
                      key={pair.id ?? pair.pairName}
                      onClick={() => setDealFormValue("tickerPairId", pair.id ?? "")}
                      type="button"
                    >
                      <span className="pair-icon">{pair.icon || pairInitials(pair.pairName)}</span>
                      <span>{pair.pairName}</span>
                    </button>
                  ))
                )}
              </div>
              <Field label="Currency" value={dealForm.currency} onChange={(value) => setDealFormValue("currency", value)} />
              <Field label="Deposit" value={dealForm.deposit} onChange={(value) => setDealFormValue("deposit", value)} type="number" />
              <Field label="Open Price" value={dealForm.openPrice} onChange={(value) => setDealFormValue("openPrice", value)} type="number" />
              <Field label="Close Price" value={dealForm.closePrice} onChange={(value) => setDealFormValue("closePrice", value)} type="number" />
              <Field label="Risk Reward" value={dealForm.riskReward} onChange={(value) => setDealFormValue("riskReward", value)} />
              <div className="result-control">
                <span>Result</span>
                <div className="segmented-control">
                  <button
                    className={dealForm.result === "PROFIT" ? "selected green" : ""}
                    onClick={() => setDealFormValue("result", "PROFIT")}
                    type="button"
                  >
                    ↗ Profit
                  </button>
                  <button
                    className={dealForm.result === "BE" ? "selected orange" : ""}
                    onClick={() => setDealFormValue("result", "BE")}
                    type="button"
                  >
                    − BE
                  </button>
                  <button
                    className={dealForm.result === "LOSS" ? "selected red" : ""}
                    onClick={() => setDealFormValue("result", "LOSS")}
                    type="button"
                  >
                    ↘ Loss
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="form-section wide">
            <div className="section-title">
              <span>✎</span>
              <strong>Notes</strong>
            </div>
            <label>
              Description
              <textarea
                value={dealForm.description}
                onChange={(event) => setDealFormValue("description", event.target.value)}
                placeholder="Setup, execution notes, emotions, mistakes..."
                rows={5}
              />
            </label>
          </section>

          <section className="form-section wide">
            <div className="section-title">
              <span>▧</span>
              <strong>Images</strong>
            </div>
            <label className="upload-zone">
              <input
                accept="image/*"
                multiple
                onChange={(event) => setDealFormValue("imageFiles", Array.from(event.target.files ?? []))}
                type="file"
              />
              <span>+ Add screenshots</span>
              <small>PNG, JPG or WEBP. Multiple files are supported.</small>
            </label>
            {dealForm.imageFiles.length > 0 && (
              <div className="attachment-list">
                {dealForm.imageFiles.map((file) => (
                  <span key={`${file.name}-${file.lastModified}`}>{file.name}</span>
                ))}
              </div>
            )}
          </section>

          <div className="drawer-actions wide">
            <div>
              Total: <strong>{dealForm.deposit || "0.00"}</strong> · <span>{dealForm.currency || "USD"}</span>
            </div>
            <button className="primary-button" disabled={!dealForm.tickerPairId} type="submit">
              ✓ Save
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

function resultLabel(result: DealResult) {
  if (result === "LOSS") {
    return "Loss";
  }
  if (result === "BE") {
    return "BE";
  }
  return "Profit";
}
