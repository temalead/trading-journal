import { Deal, DealResult, DealSession } from "../api/deals";

export function resultView(result?: DealResult | null) {
  if (result === "LOSS") {
    return { label: "Loss", className: "red", side: "Short", sideClass: "red" };
  }
  if (result === "BE") {
    return { label: "BE", className: "orange", side: "Flat", sideClass: "orange" };
  }
  return { label: "Profit", className: "green", side: "Long", sideClass: "green" };
}

export function formatDate(value?: string | null) {
  return value ? value.slice(0, 10) : "-";
}

export function dealDateKey(deal: Deal) {
  return deal.openedAt?.slice(0, 10) ?? deal.createdAt?.slice(0, 10) ?? "";
}

export function formatSession(session?: DealSession | null) {
  if (session === "new york") {
    return "New York";
  }
  return session ? session.charAt(0).toUpperCase() + session.slice(1) : "-";
}

export function externalHref(url: string) {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

export function formatPnl(deal: Deal) {
  if (deal.result === "LOSS" || deal.result === "BE") {
    return "-";
  }
  const deposit = Number(deal.deposit);
  const riskReward = parseRiskReward(deal.riskReward);
  if (!Number.isFinite(deposit) || !Number.isFinite(riskReward)) {
    return "-";
  }

  const pnl = deposit * riskReward;
  return `${pnl > 0 ? "+" : ""}${pnl.toFixed(2)}`;
}

export function formatProfitPercent(deal: Deal) {
  const percent = profitPercent(deal);
  if (percent == null) {
    return "-";
  }
  return `${percent > 0 ? "+" : ""}${percent.toFixed(percent % 1 === 0 ? 0 : 1)}%`;
}

export function profitPercent(deal: Deal) {
  if (deal.result === "BE") {
    return 0;
  }
  if (deal.result === "LOSS") {
    return -1;
  }

  const riskReward = parseRiskReward(deal.riskReward);
  if (!Number.isFinite(riskReward)) {
    return null;
  }
  return riskReward;
}

export function parseRiskReward(value?: string | null) {
  if (value == null) {
    return Number.NaN;
  }
  const normalized = value.replace(",", ".").replace(/[^0-9.-]/g, "");
  return normalized ? Number(normalized) : Number.NaN;
}

export function pairInitials(pairName?: string | null) {
  return pairName ? pairName.slice(0, 2).toUpperCase() : "FX";
}

export function profileInitials(username: string) {
  return username
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function blankToNull(value: string) {
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

export function numberToNull(value: string) {
  return value.trim().length === 0 ? null : Number(value);
}
