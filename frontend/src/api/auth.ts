export type AuthSession = {
  userId: string;
  accountId: string;
  username: string;
  email: string;
  roles: string[];
  accessToken: string;
  tokenType: string;
  expiresInSeconds: number;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = LoginPayload & {
  username: string;
};

export async function login(payload: LoginPayload): Promise<AuthSession> {
  return authRequest("/api/auth/login", payload);
}

export async function register(payload: RegisterPayload): Promise<AuthSession> {
  return authRequest("/api/auth/register", payload);
}

async function authRequest<TPayload>(url: string, payload: TPayload): Promise<AuthSession> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json() as Promise<AuthSession>;
}
