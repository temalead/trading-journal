import { AuthSession } from "./auth";
import { authHeaders } from "./request";

export type DealResult = "PROFIT" | "BE" | "LOSS";

export type TickerPair = {
  id?: string;
  userId?: string;
  pairName: string;
  icon?: string | null;
};

export type Deal = {
  id?: string;
  ticker?: TickerPair | null;
  imageUrls?: string[];
  deposit?: number | null;
  currency?: string | null;
  openPrice?: number | null;
  closePrice?: number | null;
  riskReward?: string | null;
  description?: string | null;
  createdAt?: string | null;
  result?: DealResult | null;
};

export type CreateDealPayload = {
  tickerPairId: string;
  userId: string;
  accountId: string;
  deposit: number | null;
  currency: string | null;
  openPrice: number | null;
  closePrice: number | null;
  riskReward: string | null;
  description: string | null;
  result: DealResult;
};

export async function getDeals(userId: string, accountId: string | undefined, session: AuthSession): Promise<Deal[]> {
  const params = new URLSearchParams();
  params.set("userId", userId);
  if (accountId) {
    params.set("accountId", accountId);
  }

  const query = params.toString();
  const response = await fetch(`/api/deal${query ? `?${query}` : ""}`, {
    headers: authHeaders(session),
  });
  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json() as Promise<Deal[]>;
}

export async function createDeal(payload: CreateDealPayload, session: AuthSession): Promise<Deal> {
  const response = await fetch("/api/deal", {
    method: "POST",
    headers: {
      ...authHeaders(session),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json() as Promise<Deal>;
}

export async function uploadDealImages(
  dealId: string,
  userId: string,
  images: File[],
  session: AuthSession,
): Promise<Deal> {
  const params = new URLSearchParams({ userId });
  const formData = new FormData();
  images.forEach((image) => formData.append("images", image));

  const response = await fetch(`/api/deal/${dealId}/images?${params.toString()}`, {
    method: "POST",
    headers: authHeaders(session),
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json() as Promise<Deal>;
}
