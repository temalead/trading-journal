import { FormEvent, useEffect, useMemo, useState } from "react";
import { AuthSession, login, register } from "./api/auth";
import { createDeal, Deal, deleteDeal, getDeals, uploadDealImages, updateDeal } from "./api/deals";
import { createPair, getPairs, TickerPair } from "./api/pairs";
import { AuthPage } from "./components/AuthPage";
import { DealDrawer } from "./components/DealDrawer";
import { DealsView } from "./components/DealsView";
import { PairsView } from "./components/PairsView";
import { Sidebar } from "./components/Sidebar";
import { Topbar } from "./components/Topbar";
import {
  AuthFormState,
  DealFormState,
  initialDealForm,
  initialPairForm,
  Page,
  PairFormState,
} from "./types/forms";
import { blankToNull, numberToNull } from "./utils/format";
import { clearStoredSession, readStoredSession, writeStoredSession } from "./utils/sessionStorage";

export function App() {
  const [page, setPage] = useState<Page>("deals");
  const [deals, setDeals] = useState<Deal[]>([]);
  const [pairs, setPairs] = useState<TickerPair[]>([]);
  const [session, setSession] = useState<AuthSession | null>(() => readStoredSession());
  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
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

  useEffect(() => {
    if (!dealForm.tickerPairId && pairs.length > 0 && pairs[0].id) {
      setDealForm((current) => ({ ...current, tickerPairId: pairs[0].id ?? "" }));
    }
  }, [dealForm.tickerPairId, pairs]);

  const filteredDeals = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return deals.filter((deal) => {
      const value = [deal.ticker?.pairName, deal.currency, deal.description, deal.result, deal.session]
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
        getDeals(currentSession.userId, currentSession.accountId, currentSession),
        getPairs(currentSession.userId, currentSession),
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

    if (!dealForm.tickerPairId) {
      showMessage("Select a pair first");
      return;
    }

    try {
      const payload = {
        tickerPairId: dealForm.tickerPairId,
        userId: session.userId,
        accountId: session.accountId,
        deposit: numberToNull(dealForm.deposit),
        currency: blankToNull(dealForm.currency),
        riskReward: blankToNull(dealForm.riskReward),
        result: dealForm.result,
        session: dealForm.session,
        links: dealForm.links
          .map((link) => ({ title: blankToNull(link.title), url: link.url.trim() }))
          .filter((link) => link.url.length > 0),
        description: blankToNull(dealForm.description),
      };
      const savedDeal =
        editingDeal?.id
          ? await updateDeal(editingDeal.id, session.userId, payload, session)
          : await createDeal(payload, session);

      if (dealForm.imageFiles.length > 0) {
        if (!savedDeal.id) {
          throw new Error("Deal was saved without id");
        }
        await uploadDealImages(savedDeal.id, session.userId, dealForm.imageFiles, session);
      }

      setDrawerOpen(false);
      setEditingDeal(null);
      setDealForm(initialDealForm);
      showMessage(editingDeal ? "Deal updated" : "Deal saved");
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
      await createPair(
        {
          userId: session.userId,
          pairName: pairForm.pairName.trim(),
          icon: blankToNull(pairForm.icon),
        },
        session,
      );
      setPairForm(initialPairForm);
      showMessage("Pair saved");
      setPairs(await getPairs(session.userId, session));
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
    setEditingDeal(null);
    setDealForm({
      ...initialDealForm,
      tickerPairId: pairs.find((pair) => pair.id)?.id || "",
    });
    setDrawerOpen(true);
  }

  function openEditDrawer(deal: Deal) {
    if (!session) {
      showMessage("Sign in first");
      return;
    }

    setEditingDeal(deal);
    setDealForm(dealToForm(deal));
    setDrawerOpen(true);
  }

  async function removeDeal(deal: Deal) {
    if (!session) {
      showMessage("Sign in first");
      return;
    }
    if (!deal.id) {
      showMessage("Deal has no id");
      return;
    }
    if (!window.confirm("Delete this deal?")) {
      return;
    }

    try {
      await deleteDeal(deal.id, session.userId, session);
      showMessage("Deal deleted");
      await refreshData();
    } catch (error) {
      showMessage(error instanceof Error ? error.message : "Unable to delete deal");
    }
  }

  function showMessage(value: string) {
    setMessage(value);
    window.setTimeout(() => setMessage(""), 3600);
  }

  function saveSession(nextSession: AuthSession) {
    writeStoredSession(nextSession);
    setSession(nextSession);
  }

  function setDealFormValue<Key extends keyof DealFormState>(key: Key, value: DealFormState[Key]) {
    setDealForm((current) => ({ ...current, [key]: value }));
  }

  function setPairFormValue<Key extends keyof PairFormState>(key: Key, value: PairFormState[Key]) {
    setPairForm((current) => ({ ...current, [key]: value }));
  }

  function dealToForm(deal: Deal): DealFormState {
    return {
      tickerPairId: deal.ticker?.id ?? pairs.find((pair) => pair.pairName === deal.ticker?.pairName)?.id ?? "",
      imageFiles: [],
      currency: deal.currency ?? "",
      deposit: deal.deposit == null ? "" : String(deal.deposit),
      riskReward: deal.riskReward ?? "",
      result: deal.result ?? "PROFIT",
      session: deal.session ?? "london",
      links: deal.links && deal.links.length > 0
        ? deal.links.map((link) => ({ title: link.title ?? "", url: link.url }))
        : [{ title: "", url: "" }],
      description: deal.description ?? "",
    };
  }

  if (!session) {
    return (
      <AuthPage
        authForm={authForm}
        loading={loading}
        message={message}
        setAuthForm={setAuthForm}
        submitAuth={submitAuth}
      />
    );
  }

  return (
    <div className="app-shell">
      <Sidebar page={page} onCreateDeal={openCreateDrawer} onSignOut={signOut} setPage={setPage} />

      <main className="workspace">
        <Topbar session={session} />

        {page === "deals" ? (
          <DealsView
            deals={filteredDeals}
            loading={loading}
            onCreate={openCreateDrawer}
            onDelete={removeDeal}
            onEdit={openEditDrawer}
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
          <DealDrawer
            dealForm={dealForm}
            mode={editingDeal ? "edit" : "create"}
            onClose={() => {
              setDrawerOpen(false);
              setEditingDeal(null);
              setDealForm(initialDealForm);
            }}
            onSubmit={submitDeal}
            pairs={pairs}
            setDealFormValue={setDealFormValue}
          />
        )}

        {message && <div className="toast show">{message}</div>}
      </main>
    </div>
  );
}
