import { FormEvent, useMemo, useState } from "react";
import { createDeal, Deal, DealResult, getDeals } from "./api/deals";

type DealFormState = {
  userId: string;
  accountId: string;
  pairName: string;
  currency: string;
  deposit: string;
  openPrice: string;
  closePrice: string;
  riskReward: string;
  result: DealResult;
  description: string;
};

const initialForm: DealFormState = {
  userId: "",
  accountId: "",
  pairName: "EURUSD",
  currency: "USD",
  deposit: "",
  openPrice: "",
  closePrice: "",
  riskReward: "2.00R",
  result: "PROFIT",
  description: "",
};

export function App() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [userId, setUserId] = useState("");
  const [accountId, setAccountId] = useState("");
  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState<DealFormState>(initialForm);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const filteredDeals = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return deals.filter((deal) => {
      const value = [
        deal.ticker?.pairName,
        deal.currency,
        deal.description,
        deal.result,
        deal.accountId,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return value.includes(needle);
    });
  }, [deals, search]);

  async function loadDeals() {
    if (!userId.trim()) {
      showMessage("userId обязателен для загрузки сделок");
      return;
    }

    setLoading(true);
    try {
      setDeals(await getDeals(userId.trim(), accountId.trim() || undefined));
    } catch (error) {
      showMessage(error instanceof Error ? error.message : "Не удалось загрузить сделки");
    } finally {
      setLoading(false);
    }
  }

  async function submitDeal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.userId.trim()) {
      showMessage("userId обязателен");
      return;
    }

    try {
      await createDeal({
        ticker: { pairName: form.pairName.trim(), icon: null },
        userId: form.userId.trim(),
        accountId: blankToNull(form.accountId),
        deposit: numberToNull(form.deposit),
        currency: blankToNull(form.currency),
        openPrice: numberToNull(form.openPrice),
        closePrice: numberToNull(form.closePrice),
        riskReward: blankToNull(form.riskReward),
        result: form.result,
        description: blankToNull(form.description),
      });

      setUserId(form.userId.trim());
      setAccountId(form.accountId.trim());
      setDrawerOpen(false);
      setForm(initialForm);
      showMessage("Сделка сохранена");
      setDeals(await getDeals(form.userId.trim(), form.accountId.trim() || undefined));
    } catch (error) {
      showMessage(error instanceof Error ? error.message : "Не удалось сохранить сделку");
    }
  }

  function openCreateDrawer() {
    setForm((current) => ({
      ...current,
      userId,
      accountId,
    }));
    setDrawerOpen(true);
  }

  function showMessage(value: string) {
    setMessage(value);
    window.setTimeout(() => setMessage(""), 3600);
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">TJ</div>
          <div>
            <div className="brand-name">HAUNTED</div>
            <div className="brand-caption">Торговый журнал</div>
          </div>
        </div>

        <button className="primary-wide" onClick={openCreateDrawer}>
          + Добавить сделку
        </button>

        <nav className="nav-section">
          <span>Core</span>
          <a href="/">Дашборд</a>
          <a href="/">Аналитика</a>
          <a className="active" href="/">
            Сделки
          </a>
        </nav>

        <nav className="nav-section">
          <span>Manage</span>
          <a href="/">Счета</a>
          <a href="/">Программы</a>
          <a href="/">Бэктесты</a>
        </nav>

        <nav className="nav-section">
          <span>Library</span>
          <a href="/">Документы</a>
          <a href="/">Идеи</a>
          <a href="/">Обучение</a>
          <a href="/">Пары</a>
          <a href="/">Сессии</a>
        </nav>

        <div className="sidebar-bottom">
          <a href="/">Обновления</a>
          <a href="/">Настройки</a>
          <a href="/">Выход</a>
        </div>
      </aside>

      <main className="workspace">
        <header className="topbar">
          <button className="icon-button" aria-label="Уведомления">
            ⌁
          </button>
          <div className="profile">
            <div className="avatar">AN</div>
            <strong>Artem Nikulin</strong>
            <span className="status-dot" />
          </div>
        </header>

        <section className="page-head">
          <div>
            <h1>Сделки</h1>
            <p>Журнал сделок из backend API.</p>
          </div>
          <button className="primary-button" onClick={openCreateDrawer}>
            + Добавить сделку
          </button>
        </section>

        <section className="filters">
          <label className="search-field">
            <span>⌕</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              type="search"
              placeholder="Поиск по паре, описанию, валюте"
            />
          </label>
          <label>
            User ID
            <input
              value={userId}
              onChange={(event) => setUserId(event.target.value)}
              placeholder="Обязательный userId"
            />
          </label>
          <label>
            Account ID
            <input
              value={accountId}
              onChange={(event) => setAccountId(event.target.value)}
              placeholder="Можно оставить пустым"
            />
          </label>
          <button className="secondary-button" disabled={loading} onClick={loadDeals}>
            {loading ? "Загрузка..." : "Загрузить"}
          </button>
        </section>

        <section className="view-controls">
          <div className="tabs">
            <button>Галерея</button>
            <button className="selected">Список</button>
            <button>Календарь</button>
          </div>
          <div className="sort-box">Дата ↓</div>
          <div className="result-box">Все результаты</div>
          <div className="counter">{filteredDeals.length} сделок</div>
        </section>

        <section className="table-card">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Side</th>
                <th>Pair</th>
                <th>Account</th>
                <th>Result</th>
                <th>RR</th>
                <th>PnL</th>
                <th>Link</th>
              </tr>
            </thead>
            <tbody>
              {filteredDeals.length === 0 ? (
                <tr className="empty-row">
                  <td colSpan={8}>Введите userId и загрузите сделки.</td>
                </tr>
              ) : (
                filteredDeals.map((deal) => <DealRow deal={deal} key={deal.id ?? deal.ticker?.pairName} />)
              )}
            </tbody>
          </table>
        </section>

        {drawerOpen && (
          <section className="drawer" aria-hidden={!drawerOpen}>
            <div className="drawer-panel">
              <div className="drawer-head">
                <div>
                  <h2>Новая сделка</h2>
                  <p>POST /deal. userId обязателен, accountId можно оставить пустым.</p>
                </div>
                <button className="icon-button" onClick={() => setDrawerOpen(false)} aria-label="Закрыть">
                  ×
                </button>
              </div>

              <form className="deal-form" onSubmit={submitDeal}>
                <Field label="User ID" value={form.userId} onChange={(value) => setFormValue("userId", value)} required />
                <Field label="Account ID" value={form.accountId} onChange={(value) => setFormValue("accountId", value)} />
                <Field label="Pair" value={form.pairName} onChange={(value) => setFormValue("pairName", value)} required />
                <Field label="Currency" value={form.currency} onChange={(value) => setFormValue("currency", value)} />
                <Field label="Deposit" value={form.deposit} onChange={(value) => setFormValue("deposit", value)} type="number" />
                <Field label="Open price" value={form.openPrice} onChange={(value) => setFormValue("openPrice", value)} type="number" />
                <Field label="Close price" value={form.closePrice} onChange={(value) => setFormValue("closePrice", value)} type="number" />
                <Field label="Risk Reward" value={form.riskReward} onChange={(value) => setFormValue("riskReward", value)} />
                <label>
                  Result
                  <select
                    value={form.result}
                    onChange={(event) => setFormValue("result", event.target.value as DealResult)}
                  >
                    <option value="PROFIT">Profit</option>
                    <option value="BE">BE</option>
                    <option value="LOSS">Loss</option>
                  </select>
                </label>
                <label className="wide">
                  Description
                  <textarea value={form.description} onChange={(event) => setFormValue("description", event.target.value)} rows={3} />
                </label>
                <button className="primary-button wide" type="submit">
                  Сохранить сделку
                </button>
              </form>
            </div>
          </section>
        )}

        {message && <div className="toast show">{message}</div>}
      </main>
    </div>
  );

  function setFormValue<Key extends keyof DealFormState>(key: Key, value: DealFormState[Key]) {
    setForm((current) => ({ ...current, [key]: value }));
  }
}

function DealRow({ deal }: { deal: Deal }) {
  const view = resultView(deal.result);

  return (
    <tr>
      <td>{formatDate(deal.createdAt)}</td>
      <td>
        <span className={`badge ${view.sideClass}`}>{view.side}</span>
      </td>
      <td>
        <div className="pair-cell">
          <span className="pair-icon">{pairInitials(deal.ticker?.pairName)}</span>
          <span>{deal.ticker?.pairName ?? "-"}</span>
        </div>
      </td>
      <td>
        <span className="badge orange">{deal.accountId || "Без аккаунта"}</span>
      </td>
      <td>
        <span className={`badge ${view.className}`}>{view.label}</span>
      </td>
      <td>
        <span className="badge blue">{deal.riskReward || "-"}</span>
      </td>
      <td>
        <span className={`badge ${view.className}`}>{formatPnl(deal)}</span>
      </td>
      <td>
        <button className="icon-button" title={deal.id}>
          ↗
        </button>
      </td>
    </tr>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label>
      {label}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        type={type}
        step={type === "number" ? "0.00001" : undefined}
        required={required}
      />
    </label>
  );
}

function resultView(result?: DealResult | null) {
  if (result === "LOSS") {
    return { label: "Loss", className: "red", side: "Short", sideClass: "red" };
  }
  if (result === "BE") {
    return { label: "BE", className: "orange", side: "Flat", sideClass: "orange" };
  }
  return { label: "Profit", className: "green", side: "Long", sideClass: "green" };
}

function formatDate(value?: string | null) {
  return value ? value.slice(0, 10) : "-";
}

function formatPnl(deal: Deal) {
  if (deal.closePrice == null || deal.openPrice == null) {
    return "-";
  }
  const pnl = Number(deal.closePrice) - Number(deal.openPrice);
  return `${pnl > 0 ? "+" : ""}${pnl.toFixed(2)}`;
}

function pairInitials(pairName?: string | null) {
  return pairName ? pairName.slice(0, 2).toUpperCase() : "FX";
}

function blankToNull(value: string) {
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

function numberToNull(value: string) {
  return value.trim().length === 0 ? null : Number(value);
}
