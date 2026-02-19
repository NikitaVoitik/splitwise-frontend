import type { AuthUser } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export class AuthError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "AuthError";
  }
}

interface BackendAuthResponse {
  access_token: string;
  token_type: string;
  user: {
    id: string;
    name: string;
    email: string;
    created_at: string;
  };
}

export interface AuthResult {
  user: AuthUser;
  accessToken: string;
}

async function parseErrorMessage(res: Response): Promise<string> {
  try {
    const body = await res.json();
    if (typeof body.detail === "string") return body.detail;
    return res.statusText;
  } catch {
    return res.statusText;
  }
}

export async function loginUser(params: {
  email: string;
  password: string;
  invite_group_id?: string;
}): Promise<AuthResult> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const msg = await parseErrorMessage(res);
    throw new AuthError(msg, res.status);
  }

  const data: BackendAuthResponse = await res.json();
  return { user: data.user, accessToken: data.access_token };
}

export async function registerUser(params: {
  name: string;
  email: string;
  password: string;
  invite_group_id?: string;
}): Promise<AuthResult> {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const msg = await parseErrorMessage(res);
    throw new AuthError(msg, res.status);
  }

  const data: BackendAuthResponse = await res.json();
  return { user: data.user, accessToken: data.access_token };
}
