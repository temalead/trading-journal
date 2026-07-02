import { ClipboardEvent, FormEvent } from "react";
import { DealResult, DealSession } from "../api/deals";
import { TickerPair } from "../api/pairs";
import { DealFormState } from "../types/forms";
import { pairInitials } from "../utils/format";
import { Field } from "./Field";

type DealDrawerProps = {
  dealForm: DealFormState;
  mode: "create" | "edit";
  pairs: TickerPair[];
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  setDealFormValue: <Key extends keyof DealFormState>(key: Key, value: DealFormState[Key]) => void;
};

export function DealDrawer({ dealForm, mode, pairs, onClose, onSubmit, setDealFormValue }: DealDrawerProps) {
  const selectedPair = pairs.find((pair) => pair.id === dealForm.tickerPairId);
  const links = dealForm.links.length > 0 ? dealForm.links : [{ title: "", url: "" }];

  function setLinkValue(index: number, key: "title" | "url", value: string) {
    setDealFormValue(
      "links",
      links.map((link, linkIndex) => (linkIndex === index ? { ...link, [key]: value } : link)),
    );
  }

  function addLink() {
    setDealFormValue("links", [...links, { title: "", url: "" }]);
  }

  function removeLink(index: number) {
    const nextLinks = links.filter((_, linkIndex) => linkIndex !== index);
    setDealFormValue("links", nextLinks.length > 0 ? nextLinks : [{ title: "", url: "" }]);
  }

  function pasteImages(event: ClipboardEvent<HTMLFormElement>) {
    const pastedImages = Array.from(event.clipboardData.items)
      .filter((item) => item.type.startsWith("image/"))
      .map((item) => item.getAsFile())
      .filter((file): file is File => file !== null);
    if (pastedImages.length === 0) {
      return;
    }

    event.preventDefault();
    setDealFormValue("imageFiles", [...dealForm.imageFiles, ...pastedImages]);
  }

  return (
    <section className="drawer" aria-hidden={false}>
      <div className="drawer-panel">
        <div className="drawer-head">
          <div>
            <h2>{mode === "edit" ? "Edit trade" : "Add trade"}</h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <form className="deal-form" onPaste={pasteImages} onSubmit={onSubmit}>
          <section className="deal-summary wide">
            <div className="summary-pair">
              <span className="pair-icon large">{selectedPair?.icon || pairInitials(selectedPair?.pairName)}</span>
              <div>
                <strong>{selectedPair?.pairName ?? "Select pair"}</strong>
                <span className="trade-badges">
                  <span>↗ LONG</span>
                  <span>{resultLabel(dealForm.result)}</span>
                </span>
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
              <strong>Инфо о сделке</strong>
            </div>
            <div className="form-grid">
              <Field
                label="Open Date"
                value={dealForm.openedAt}
                onChange={(value) => setDealFormValue("openedAt", value)}
                type="date"
                required
              />
              <label className="wide">
                Пара
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
              <Field label="Risk Reward" value={dealForm.riskReward} onChange={(value) => setDealFormValue("riskReward", value)} />
              <label>
                Сессия
                <select
                  value={dealForm.session}
                  onChange={(event) => setDealFormValue("session", event.target.value as DealSession)}
                  required
                >
                  {dealSessions.map((session) => (
                    <option key={session.value} value={session.value}>
                      {session.label}
                    </option>
                  ))}
                </select>
              </label>
              <div className="result-control">
                <span>Результат</span>
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
              <strong>Highlight</strong>
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
            <div className="section-title with-action">
              <div>
                <span>↔</span>
                <strong>Links</strong>
              </div>
              <button className="secondary-button compact" onClick={addLink} type="button">
                + Add
              </button>
            </div>
            <div className="link-list">
              {links.map((link, index) => (
                <div className="link-row" key={index}>
                  <input
                    aria-label="Link title"
                    onChange={(event) => setLinkValue(index, "title", event.target.value)}
                    placeholder="Title"
                    value={link.title}
                  />
                  <input
                    aria-label="Link URL"
                    onChange={(event) => setLinkValue(index, "url", event.target.value)}
                    placeholder="https://..."
                    type="url"
                    value={link.url}
                  />
                  <button className="danger-icon-button" onClick={() => removeLink(index)} type="button" aria-label="Remove link">
                    ⌫
                  </button>
                </div>
              ))}
            </div>
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
              <small>PNG, JPG or WEBP. You can also paste images from clipboard.</small>
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
              Итого: <strong>{dealForm.riskReward || "0.00R"}</strong> · <span>{dealForm.currency || "USD"}</span>
            </div>
            <button className="primary-button" disabled={!dealForm.tickerPairId} type="submit">
              ✓ {mode === "edit" ? "Update" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

const dealSessions: { value: DealSession; label: string }[] = [
  { value: "london", label: "London" },
  { value: "frankfurt", label: "Frankfurt" },
  { value: "asia", label: "Asia" },
  { value: "new york", label: "New York" },
];

function resultLabel(result: DealResult) {
  if (result === "LOSS") {
    return "Loss";
  }
  if (result === "BE") {
    return "BE";
  }
  return "Profit";
}
