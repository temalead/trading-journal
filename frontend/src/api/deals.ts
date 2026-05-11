export type DealResult = "PROFIT" | "BE" | "LOSS";

export type TickerPair = {
  pairName: string;
  icon?: string | null;
};

export type Deal = {
  id?: string;
  ticker?: TickerPair | null;
  deposit?: number | null;
  currency?: string | null;
  openPrice?: number | null;
  closePrice?: number | null;
  riskReward?: string | null;
  description?: string | null;
  createdAt?: string | null;
  result?: DealResult | null;
  userId?: string | null;
  accountId?: string | null;
};

export type CreateDealPayload = {
  ticker: TickerPair;
  userId: string;
  accountId: string | null;
  deposit: number | null;
  currency: string | null;
  openPrice: number | null;
  closePrice: number | null;
  riskReward: string | null;
  description: string | null;
  result: DealResult;
};

export async function getDeals(userId: string, accountId?: string): Promise<Deal[]> {
  const params = new URLSearchParams({ userId });
  if (accountId) {
    params.set("accountId", accountId);
  }

  const response = await fetch(`/api/deal?${params.toString()}`);
  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json() as Promise<Deal[]>;
}

export async function createDeal(payload: CreateDealPayload): Promise<Deal> {
  const response = await fetch("/api/deal", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json() as Promise<Deal>;
}
