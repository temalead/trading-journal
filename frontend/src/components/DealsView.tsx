import { useState } from "react";
import { Deal } from "../api/deals";
import { dealDateKey } from "../utils/format";
import { CalendarView } from "./CalendarView";
import { DealRow } from "./DealRow";

type DealsViewProps = {
  deals: Deal[];
  loading: boolean;
  onCreate: () => void;
  onDelete: (deal: Deal) => void;
  onEdit: (deal: Deal) => void;
  onRefresh: () => void;
  search: string;
  setSearch: (value: string) => void;
};

export function DealsView({ deals, loading, onCreate, onDelete, onEdit, onRefresh, search, setSearch }: DealsViewProps) {
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [periodMode, setPeriodMode] = useState<"month" | "year" | "all">("month");
  const [periodDate, setPeriodDate] = useState(() => new Date());

  const sortedDeals = [...deals].sort((first, second) => dealDateKey(second).localeCompare(dealDateKey(first)));
  const periodDeals = sortedDeals.filter((deal) => isDealInPeriod(deal, periodMode, periodDate));
  const groupedDeals = groupDealsByMonth(periodDeals);
  const periodLabel = formatPeriodLabel(periodMode, periodDate);

  function shiftPeriod(offset: number) {
    setPeriodDate((current) => {
      const next = new Date(current);
      if (periodMode === "year") {
        next.setFullYear(current.getFullYear() + offset);
      } else {
        next.setMonth(current.getMonth() + offset);
      }
      return next;
    });
  }

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
          <button className={viewMode === "list" ? "selected" : ""} onClick={() => setViewMode("list")} type="button">
            List
          </button>
          <button
            className={viewMode === "calendar" ? "selected" : ""}
            onClick={() => setViewMode("calendar")}
            type="button"
          >
            Calendar
          </button>
        </div>
        <div className="sort-box">Date ↓</div>
        <div className="result-box">All Results</div>
        <div className="counter">{periodDeals.length} deals</div>
      </section>

      <section className="period-controls">
        <div className="period-nav">
          {periodMode !== "all" && (
            <button className="icon-button" onClick={() => shiftPeriod(-1)} type="button" aria-label="Previous period">
              ‹
            </button>
          )}
          <strong>{periodLabel}</strong>
          {periodMode !== "all" && (
            <button className="icon-button" onClick={() => shiftPeriod(1)} type="button" aria-label="Next period">
              ›
            </button>
          )}
        </div>
        <div className="tabs">
          <button className={periodMode === "month" ? "selected" : ""} onClick={() => setPeriodMode("month")} type="button">
            Month
          </button>
          <button className={periodMode === "year" ? "selected" : ""} onClick={() => setPeriodMode("year")} type="button">
            Year
          </button>
          <button className={periodMode === "all" ? "selected" : ""} onClick={() => setPeriodMode("all")} type="button">
            All
          </button>
        </div>
      </section>

      {viewMode === "calendar" ? (
        <CalendarView deals={sortedDeals} />
      ) : (
        <section className="table-card">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Side</th>
                <th>Pair</th>
                <th>Session</th>
                <th>Result</th>
                <th>RR</th>
                <th>PnL</th>
                <th>Images</th>
                <th>Link</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {periodDeals.length === 0 ? (
                <tr className="empty-row">
                  <td colSpan={10}>No deals yet.</td>
                </tr>
              ) : (
                groupedDeals.flatMap((group) => [
                  <tr className="month-row" key={group.monthKey}>
                    <td colSpan={10}>{group.label}</td>
                  </tr>,
                  ...group.deals.map((deal) => (
                    <DealRow deal={deal} key={deal.id ?? `${deal.ticker?.pairName}-${dealDateKey(deal)}`} onDelete={onDelete} onEdit={onEdit} />
                  )),
                ])
              )}
            </tbody>
          </table>
        </section>
      )}
    </>
  );
}

function isDealInPeriod(deal: Deal, periodMode: "month" | "year" | "all", periodDate: Date) {
  if (periodMode === "all") {
    return true;
  }

  const dateKey = dealDateKey(deal);
  if (!dateKey) {
    return false;
  }

  const year = periodDate.getFullYear();
  const month = String(periodDate.getMonth() + 1).padStart(2, "0");
  return periodMode === "year" ? dateKey.startsWith(String(year)) : dateKey.startsWith(`${year}-${month}`);
}

function groupDealsByMonth(deals: Deal[]) {
  const groups = new Map<string, Deal[]>();
  deals.forEach((deal) => {
    const monthKey = dealDateKey(deal).slice(0, 7) || "Unknown";
    groups.set(monthKey, [...(groups.get(monthKey) ?? []), deal]);
  });

  return Array.from(groups.entries()).map(([monthKey, groupDeals]) => ({
    monthKey,
    label: formatMonthLabel(monthKey),
    deals: groupDeals,
  }));
}

function formatPeriodLabel(periodMode: "month" | "year" | "all", periodDate: Date) {
  if (periodMode === "all") {
    return "All positions";
  }
  if (periodMode === "year") {
    return String(periodDate.getFullYear());
  }
  return periodDate.toLocaleDateString("en", { month: "long", year: "numeric" });
}

function formatMonthLabel(monthKey: string) {
  if (monthKey === "Unknown") {
    return "No open date";
  }
  const [year, month] = monthKey.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString("en", { month: "long", year: "numeric" });
}
