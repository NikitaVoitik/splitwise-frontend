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

interface AuthResponse {
  id: string;
  name: string;
  email: string;
  created_at: string;
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
}): Promise<AuthUser> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const msg = await parseErrorMessage(res);
    throw new AuthError(msg, res.status);
  }

  const data: AuthResponse = await res.json();
  return data;
}

export async function registerUser(params: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthUser> {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const msg = await parseErrorMessage(res);
    throw new AuthError(msg, res.status);
  }

  const data: AuthResponse = await res.json();
  return data;
}
