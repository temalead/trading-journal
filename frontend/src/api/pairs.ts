export type TickerPair = {
  id?: string;
  pairName: string;
  icon?: string | null;
};

export type CreateTickerPairPayload = {
  userId: string;
  pairName: string;
  icon: string | null;
};

export async function getPairs(userId: string): Promise<TickerPair[]> {
  const params = new URLSearchParams({ userId });
  const response = await fetch(`/api/pair?${params.toString()}`);

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json() as Promise<TickerPair[]>;
}

export async function createPair(payload: CreateTickerPairPayload): Promise<TickerPair> {
  const response = await fetch("/api/pair", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json() as Promise<TickerPair>;
}
