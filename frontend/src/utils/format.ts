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
  if (deal.result == 'LOSS' || deal.result == 'BE') {
    return "-";
  }
  const pnl = Number(deal.deposit * deal.riskReward);
  return `${pnl > 0 ? "+" : ""}${pnl.toFixed(2)}`;
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
