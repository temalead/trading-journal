import { FormEvent, useEffect, useMemo, useState } from "react";
import { AuthSession, login, register } from "./api/auth";
import { createDeal, Deal, DealResult, getDeals } from "./api/deals";
import { createPair, getPairs, TickerPair } from "./api/pairs";

type Page = "deals" | "pairs";

type DealFormState = {
  pairName: string;
  currency: string;
  deposit: string;
  openPrice: string;
  closePrice: string;
  riskReward: string;
  result: DealResult;
  description: string;
};

type PairFormState = {
  pairName: string;
  icon: string;
};

type AuthFormState = {
  mode: "login" | "register";
  username: string;
  email: string;
  password: string;
};

const AUTH_STORAGE_KEY = "tradingJournal.auth";

const initialDealForm: DealFormState = {
  pairName: "EURUSD",
  currency: "USD",
  deposit: "",
  openPrice: "",
  closePrice: "",
  riskReward: "2.00R",
  result: "PROFIT",
  description: "",
};

const initialPairForm: PairFormState = {
  pairName: "",
  icon: "",
};

export function App() {
  const [page, setPage] = useState<Page>("deals");
  const [deals, setDeals] = useState<Deal[]>([]);
  const [pairs, setPairs] = useState<TickerPair[]>([]);
  const [session, setSession] = useState<AuthSession | null>(() => readStoredSession());
  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dealForm, setDealForm] = useState<DealFormState>(initialDealForm);
  const [pairForm, setPairForm] = useState<PairFormState>(initialPairForm);
  const [authForm, setAuthForm] = useState<AuthFormState>({
    mode: "login",
    username: "",
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session) {
      void refreshData(session);
    }
  }, [session]);

  const filteredDeals = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return deals.filter((deal) => {
      const value = [deal.ticker?.pairName, deal.currency, deal.description, deal.result]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return value.includes(needle);
    });
  }, [deals, search]);

  const filteredPairs = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return pairs.filter((pair) => [pair.pairName, pair.icon].filter(Boolean).join(" ").toLowerCase().includes(needle));
  }, [pairs, search]);

  async function refreshData(currentSession = session) {
    if (!currentSession) {
      return;
    }

    setLoading(true);
    try {
      const [nextDeals, nextPairs] = await Promise.all([
        getDeals(currentSession.userId, currentSession.accountId),
        getPairs(currentSession.userId),
      ]);
      setDeals(nextDeals);
      setPairs(nextPairs);
    } catch (error) {
      showMessage(error instanceof Error ? error.message : "Unable to load data");
    } finally {
      setLoading(false);
    }
  }

  async function submitDeal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session) {
      showMessage("Sign in first");
      return;
    }

    try {
      await createDeal({
        ticker: { pairName: dealForm.pairName.trim(), icon: null },
        userId: session.userId,
        accountId: session.accountId,
        deposit: numberToNull(dealForm.deposit),
        currency: blankToNull(dealForm.currency),
        openPrice: numberToNull(dealForm.openPrice),
        closePrice: numberToNull(dealForm.closePrice),
        riskReward: blankToNull(dealForm.riskReward),
        result: dealForm.result,
        description: blankToNull(dealForm.description),
      });

      setDrawerOpen(false);
      setDealForm(initialDealForm);
      showMessage("Deal saved");
      await refreshData();
    } catch (error) {
      showMessage(error instanceof Error ? error.message : "Unable to save deal");
    }
  }

  async function submitPair(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session) {
      showMessage("Sign in first");
      return;
    }

    try {
      await createPair({
        userId: session.userId,
        pairName: pairForm.pairName.trim(),
        icon: blankToNull(pairForm.icon),
      });
      setPairForm(initialPairForm);
      showMessage("Pair saved");
      setPairs(await getPairs(session.userId));
    } catch (error) {
      showMessage(error instanceof Error ? error.message : "Unable to save pair");
    }
  }

  async function submitAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    try {
      const nextSession =
        authForm.mode === "register"
          ? await register({
              username: authForm.username.trim(),
              email: authForm.email.trim(),
              password: authForm.password,
            })
          : await login({
              email: authForm.email.trim(),
              password: authForm.password,
            });
      saveSession(nextSession);
      setAuthForm((current) => ({ ...current, password: "" }));
      showMessage(authForm.mode === "register" ? "Account created" : "Signed in");
    } catch (error) {
      showMessage(error instanceof Error ? error.message : "Unable to sign in");
    } finally {
      setLoading(false);
    }
  }

  function signOut() {
    clearStoredSession();
    setDeals([]);
    setPairs([]);
    setSession(null);
  }

  function openCreateDrawer() {
    if (!session) {
      showMessage("Sign in first");
      return;
    }
    setDrawerOpen(true);
  }

  function showMessage(value: string) {
    setMessage(value);
    window.setTimeout(() => setMessage(""), 3600);
  }

  function saveSession(nextSession: AuthSession) {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextSession));
    setSession(nextSession);
  }

  function clearStoredSession() {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }

  if (!session) {
    return (
      <main className="auth-page">
        <section className="auth-panel">
          <div className="brand auth-brand">
            <div className="brand-mark">TJ</div>
            <div>
              <div className="brand-name">Anikulin</div>
              <div className="brand-caption">Trading Journal</div>
            </div>
          </div>

          <form className="auth-form" onSubmit={submitAuth}>
            <div>
              <h1>{authForm.mode === "register" ? "Create Account" : "Sign In"}</h1>
              <p>Your profile data is stored in this browser after login.</p>
            </div>

            {authForm.mode === "register" && (
              <Field
                label="Username"
                value={authForm.username}
                onChange={(value) => setAuthForm((current) => ({ ...current, username: value }))}
                required
              />
            )}
            <Field
              label="Email"
              value={authForm.email}
              onChange={(value) => setAuthForm((current) => ({ ...current, email: value }))}
              type="email"
              required
            />
            <Field
              label="Password"
              value={authForm.password}
              onChange={(value) => setAuthForm((current) => ({ ...current, password: value }))}
              type="password"
              required
            />
            <button className="primary-button" disabled={loading} type="submit">
              {loading ? "Please wait..." : authForm.mode === "register" ? "Create Account" : "Sign In"}
            </button>
            <button
              className="secondary-button"
              type="button"
              onClick={() =>
                setAuthForm((current) => ({
                  ...current,
                  mode: current.mode === "register" ? "login" : "register",
                }))
              }
            >
              {authForm.mode === "register" ? "I Have An Account" : "Create Account"}
            </button>
          </form>
        </section>
        {message && <div className="toast show">{message}</div>}
      </main>
    );
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">TJ</div>
          <div>
            <div className="brand-name">Anikulin</div>
            <div className="brand-caption">Trading Journal</div>
          </div>
        </div>

        <button className="primary-wide" onClick={openCreateDrawer}>
          + Add Deal
        </button>

        <nav className="nav-section">
          <span>Core</span>
          <NavButton label="Dashboard" />
          <NavButton label="Analytics" />
          <NavButton active={page === "deals"} label="Deals" onClick={() => setPage("deals")} />
        </nav>

        <nav className="nav-section">
          <span>Manage</span>
          <NavButton label="Accounts" />
          <NavButton label="Programs" />
          <NavButton label="Backtests" />
        </nav>

        <nav className="nav-section">
          <span>Library</span>
          <NavButton label="Documents" />
          <NavButton label="Ideas" />
          <NavButton label="Education" />
          <NavButton active={page === "pairs"} label="Pairs" onClick={() => setPage("pairs")} />
          <NavButton label="Sessions" />
        </nav>

        <div className="sidebar-bottom">
          <NavButton label="Updates" />
          <NavButton label="Settings" />
          <button className="nav-button" onClick={signOut}>
            Sign Out
          </button>
        </div>
      </aside>

      <main className="workspace">
        <header className="topbar">
          <button className="icon-button" aria-label="Notifications">
            ⌁
          </button>
          <div className="profile">
            <div className="avatar">{profileInitials(session.username)}</div>
            <strong>{session.username}</strong>
            <span className="status-dot" />
          </div>
        </header>

        {page === "deals" ? (
          <DealsView
            deals={filteredDeals}
            loading={loading}
            onCreate={openCreateDrawer}
            onRefresh={() => refreshData()}
            search={search}
            setSearch={setSearch}
          />
        ) : (
          <PairsView
            loading={loading}
            pairForm={pairForm}
            pairs={filteredPairs}
            search={search}
            setPairFormValue={setPairFormValue}
            setSearch={setSearch}
            submitPair={submitPair}
          />
        )}

        {drawerOpen && (
          <section className="drawer" aria-hidden={!drawerOpen}>
            <div className="drawer-panel">
              <div className="drawer-head">
                <div>
                  <h2>New Deal</h2>
                  <p>The current browser profile is attached automatically.</p>
                </div>
                <button className="icon-button" onClick={() => setDrawerOpen(false)} aria-label="Close">
                  ×
                </button>
              </div>

              <form className="deal-form" onSubmit={submitDeal}>
                <label>
                  Pair
                  <input
                    list="ticker-pairs"
                    value={dealForm.pairName}
                    onChange={(event) => setDealFormValue("pairName", event.target.value)}
                    required
                  />
                  <datalist id="ticker-pairs">
                    {pairs.map((pair) => (
                      <option key={pair.id ?? pair.pairName} value={pair.pairName} />
                    ))}
                  </datalist>
                </label>
                <Field label="Currency" value={dealForm.currency} onChange={(value) => setDealFormValue("currency", value)} />
                <Field label="Deposit" value={dealForm.deposit} onChange={(value) => setDealFormValue("deposit", value)} type="number" />
                <Field label="Open Price" value={dealForm.openPrice} onChange={(value) => setDealFormValue("openPrice", value)} type="number" />
                <Field label="Close Price" value={dealForm.closePrice} onChange={(value) => setDealFormValue("closePrice", value)} type="number" />
                <Field label="Risk Reward" value={dealForm.riskReward} onChange={(value) => setDealFormValue("riskReward", value)} />
                <label>
                  Result
                  <select
                    value={dealForm.result}
                    onChange={(event) => setDealFormValue("result", event.target.value as DealResult)}
                  >
                    <option value="PROFIT">Profit</option>
                    <option value="BE">Break Even</option>
                    <option value="LOSS">Loss</option>
                  </select>
                </label>
                <label className="wide">
                  Description
                  <textarea
                    value={dealForm.description}
                    onChange={(event) => setDealFormValue("description", event.target.value)}
                    rows={3}
                  />
                </label>
                <button className="primary-button wide" type="submit">
                  Save Deal
                </button>
              </form>
            </div>
          </section>
        )}

        {message && <div className="toast show">{message}</div>}
      </main>
    </div>
  );

  function setDealFormValue<Key extends keyof DealFormState>(key: Key, value: DealFormState[Key]) {
    setDealForm((current) => ({ ...current, [key]: value }));
  }

  function setPairFormValue<Key extends keyof PairFormState>(key: Key, value: PairFormState[Key]) {
    setPairForm((current) => ({ ...current, [key]: value }));
  }
}

function DealsView({
  deals,
  loading,
  onCreate,
  onRefresh,
  search,
  setSearch,
}: {
  deals: Deal[];
  loading: boolean;
  onCreate: () => void;
  onRefresh: () => void;
  search: string;
  setSearch: (value: string) => void;
}) {
  return (
    <>
      <section className="page-head">
        <div>
          <h1>Deals</h1>
          <p>Journal entries from the backend API.</p>
        </div>
        <button className="primary-button" onClick={onCreate}>
          + Add Deal
        </button>
      </section>

      <section className="filters filters-compact">
        <label className="search-field">
          <span>⌕</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            type="search"
            placeholder="Search by pair, description, currency"
          />
        </label>
        <button className="secondary-button" disabled={loading} onClick={onRefresh}>
          {loading ? "Loading..." : "Refresh"}
        </button>
      </section>

      <section className="view-controls">
        <div className="tabs">
          <button>Gallery</button>
          <button className="selected">List</button>
          <button>Calendar</button>
        </div>
        <div className="sort-box">Date ↓</div>
        <div className="result-box">All Results</div>
        <div className="counter">{deals.length} deals</div>
      </section>

      <section className="table-card">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Side</th>
              <th>Pair</th>
              <th>Result</th>
              <th>RR</th>
              <th>PnL</th>
              <th>Link</th>
            </tr>
          </thead>
          <tbody>
            {deals.length === 0 ? (
              <tr className="empty-row">
                <td colSpan={7}>No deals yet.</td>
              </tr>
            ) : (
              deals.map((deal) => <DealRow deal={deal} key={deal.id ?? deal.ticker?.pairName} />)
            )}
          </tbody>
        </table>
      </section>
    </>
  );
}

function PairsView({
  loading,
  pairForm,
  pairs,
  search,
  setPairFormValue,
  setSearch,
  submitPair,
}: {
  loading: boolean;
  pairForm: PairFormState;
  pairs: TickerPair[];
  search: string;
  setPairFormValue: <Key extends keyof PairFormState>(key: Key, value: PairFormState[Key]) => void;
  setSearch: (value: string) => void;
  submitPair: (event: FormEvent<HTMLFormElement>) => void;
}) {
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

function NavButton({ active = false, label, onClick }: { active?: boolean; label: string; onClick?: () => void }) {
  return (
    <button className={`nav-button ${active ? "active" : ""}`} onClick={onClick} type="button">
      {label}
    </button>
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

function profileInitials(username: string) {
  return username
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function readStoredSession() {
  const stored = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored) as AuthSession;
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

function blankToNull(value: string) {
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

function numberToNull(value: string) {
  return value.trim().length === 0 ? null : Number(value);
}
