import { useMemo, useState } from "react";
import { Deal } from "../api/deals";
import { dealDateKey, profitPercent } from "../utils/format";

type CalendarViewProps = {
  deals: Deal[];
};

type CalendarDay = {
  date: Date;
  dateKey: string;
  inMonth: boolean;
};

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const monthFormatter = new Intl.DateTimeFormat("en", { month: "long" });

export function CalendarView({ deals }: CalendarViewProps) {
  const [visibleDate, setVisibleDate] = useState(() => new Date());

  const monthStart = new Date(visibleDate.getFullYear(), visibleDate.getMonth(), 1);
  const calendarDays = useMemo(() => buildCalendarDays(monthStart), [monthStart.getFullYear(), monthStart.getMonth()]);
  const dealsByDate = useMemo(() => groupDealsByDate(deals), [deals]);
  const monthDeals = calendarDays
    .filter((day) => day.inMonth)
    .flatMap((day) => dealsByDate.get(day.dateKey) ?? []);
  const monthPercent = sumProfitPercent(monthDeals);
  const tradingDays = calendarDays.filter((day) => day.inMonth && (dealsByDate.get(day.dateKey)?.length ?? 0) > 0).length;

  function changeMonth(offset: number) {
    setVisibleDate((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));
  }

  function showCurrentMonth() {
    setVisibleDate(new Date());
  }

  return (
    <section className="calendar-shell">
      <div className="calendar-toolbar">
        <div className="calendar-nav">
          <button className="icon-button" onClick={() => changeMonth(-1)} type="button" aria-label="Previous month">
            ‹
          </button>
          <div>
            <strong>{monthFormatter.format(monthStart)}</strong>
            <span>{monthStart.getFullYear()}</span>
          </div>
          <button className="icon-button" onClick={() => changeMonth(1)} type="button" aria-label="Next month">
            ›
          </button>
          <button className="secondary-button compact" onClick={showCurrentMonth} type="button">
            Today
          </button>
        </div>
        <div className="calendar-summary">
          <span className={monthPercent >= 0 ? "positive" : "negative"}>{formatSignedPercent(monthPercent)}</span>
          <span>{tradingDays} trading days</span>
        </div>
      </div>

      <div className="calendar-grid">
        {weekdays.map((weekday) => (
          <div className="calendar-weekday" key={weekday}>
            {weekday}
          </div>
        ))}

        {calendarDays.map((day) => {
          const dayDeals = dealsByDate.get(day.dateKey) ?? [];
          const totalPercent = sumProfitPercent(dayDeals);
          const tickers = uniqueTickers(dayDeals);

          return (
            <article
              className={`calendar-day ${day.inMonth ? "" : "muted"} ${dayDeals.length > 0 ? "has-deals" : ""}`}
              key={day.dateKey}
            >
              <div className="calendar-day-head">
                <strong>{day.date.getDate()}</strong>
                {dayDeals.length > 0 && <span>{dayDeals.length} deal{dayDeals.length > 1 ? "s" : ""}</span>}
              </div>

              {dayDeals.length > 0 ? (
                <div className="calendar-day-content">
                  <div className="calendar-tickers">
                    {tickers.slice(0, 3).map((ticker) => (
                      <span key={ticker}>{ticker}</span>
                    ))}
                    {tickers.length > 3 && <span>+{tickers.length - 3}</span>}
                  </div>
                  <strong className={totalPercent >= 0 ? "positive" : "negative"}>{formatSignedPercent(totalPercent)}</strong>
                </div>
              ) : (
                <span className="calendar-empty">-</span>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}

function buildCalendarDays(monthStart: Date) {
  const days: CalendarDay[] = [];
  const gridStart = new Date(monthStart);
  gridStart.setDate(monthStart.getDate() - monthStart.getDay());

  for (let index = 0; index < 42; index += 1) {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    days.push({
      date,
      dateKey: toDateKey(date),
      inMonth: date.getMonth() === monthStart.getMonth(),
    });
  }

  return days;
}

function groupDealsByDate(deals: Deal[]) {
  return deals.reduce((groups, deal) => {
    const dateKey = dealDateKey(deal);
    if (!dateKey) {
      return groups;
    }
    groups.set(dateKey, [...(groups.get(dateKey) ?? []), deal]);
    return groups;
  }, new Map<string, Deal[]>());
}

function sumProfitPercent(deals: Deal[]) {
  return deals.reduce((total, deal) => total + (profitPercent(deal) ?? 0), 0);
}

function uniqueTickers(deals: Deal[]) {
  return Array.from(new Set(deals.map((deal) => deal.ticker?.pairName ?? "Unknown")));
}

function formatSignedPercent(value: number) {
  return `${value > 0 ? "+" : ""}${value.toFixed(value % 1 === 0 ? 0 : 1)}%`;
}

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
