import { AuthSession } from "./auth";
import { authHeaders } from "./request";

export type TickerPair = {
  id?: string;
  userId?: string;
  pairName: string;
  icon?: string | null;
};

export type CreateTickerPairPayload = {
  userId: string;
  pairName: string;
  icon: string | null;
};

export async function getPairs(userId: string, session: AuthSession): Promise<TickerPair[]> {
  const params = new URLSearchParams({ userId });
  const response = await fetch(`/api/pair?${params.toString()}`, {
    headers: authHeaders(session),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json() as Promise<TickerPair[]>;
}

export async function createPair(payload: CreateTickerPairPayload, session: AuthSession): Promise<TickerPair> {
  const response = await fetch("/api/pair", {
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

  return response.json() as Promise<TickerPair>;
}
