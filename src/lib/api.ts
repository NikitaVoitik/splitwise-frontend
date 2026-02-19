import type {
  Expense,
  ExpenseShare,
  Debt,
  Balance,
  User,
  Group,
  GroupMember,
} from "./types";
import { calculateBalances } from "./ledger";
import { TOKEN_STORAGE_KEY } from "./auth-context";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// ── Helper ──────────────────────────────────────────────────────────────────

function authHeaders(): HeadersInit {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem(TOKEN_STORAGE_KEY)
      : null;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { ...authHeaders(), ...init?.headers },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail ?? res.statusText);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

// ── Backend response types ──────────────────────────────────────────────────

interface BackendGroup {
  id: string;
  name: string;
  type: string | null;
  currency_code: string;
  cover_image: string | null;
  invite_code: string;
  created_by: string;
  created_at: string;
  debt_simplification: boolean;
}

interface BackendDebtSummary {
  debtor_id: string;
  creditor_id: string;
  total_owed: number;
}

interface BackendMember {
  id: string;
  group_id: string;
  user_id: string;
  joined_at: string;
  user_name: string | null;
  user_email: string | null;
}

interface BackendExpenseSplit {
  id: string;
  debtor_id: string;
  creditor_id: string;
  amount_owed: number;
  percentage: number;
  status: string;
}

interface BackendExpense {
  id: string;
  group_id: string;
  payer_id: string;
  description: string;
  amount: number;
  category: string | null;
  date: string;
  created_at: string;
  splits: BackendExpenseSplit[];
}

interface BackendExpenseList {
  expenses: BackendExpense[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

// ── Mappers ─────────────────────────────────────────────────────────────────

function mapGroup(bg: BackendGroup): Group {
  return {
    id: bg.id,
    name: bg.name,
    currency: bg.currency_code,
    debtSimplification: bg.debt_simplification,
  };
}

function mapMember(bm: BackendMember): GroupMember & { user: User } {
  return {
    id: bm.id,
    userId: bm.user_id,
    groupId: bm.group_id,
    role: "member",
    user: {
      id: bm.user_id,
      name: bm.user_name ?? "Unknown",
      email: bm.user_email ?? "",
    },
  };
}

function mapExpense(be: BackendExpense, currency: string): Expense {
  return {
    id: be.id,
    groupId: be.group_id,
    createdBy: be.payer_id,
    amount: Number(be.amount),
    currency,
    description: be.description,
    expenseDate: be.date,
  };
}

function mapExpenseShare(bs: BackendExpenseSplit, expenseId: string): ExpenseShare {
  return {
    id: bs.id,
    expenseId,
    debtorId: bs.debtor_id,
    creditorId: bs.creditor_id,
    amountOwed: Number(bs.amount_owed),
    percentage: Number(bs.percentage),
    status: bs.status as "pending" | "settled",
  };
}

// ── Public API ──────────────────────────────────────────────────────────────

export async function getGroups(): Promise<Group[]> {
  const data = await apiFetch<BackendGroup[]>("/groups");
  return data.map(mapGroup);
}

export async function createGroup(name: string, currencyCode = "USD"): Promise<Group> {
  const data = await apiFetch<BackendGroup>("/groups", {
    method: "POST",
    body: JSON.stringify({ name, currency_code: currencyCode }),
  });
  return mapGroup(data);
}

export async function getGroup(id: string): Promise<Group | undefined> {
  try {
    const data = await apiFetch<BackendGroup>(`/groups/${id}`);
    return mapGroup(data);
  } catch {
    return undefined;
  }
}

export async function updateGroup(
  id: string,
  updates: { debt_simplification?: boolean; name?: string },
): Promise<Group> {
  const data = await apiFetch<BackendGroup>(`/groups/${id}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
  return mapGroup(data);
}

export async function getGroupExpenses(groupId: string, currency = "USD"): Promise<Expense[]> {
  const data = await apiFetch<BackendExpenseList>(
    `/groups/${groupId}/expenses?page=1&limit=50`,
  );
  return data.expenses.map((e) => mapExpense(e, currency));
}

export async function getGroupMembers(
  groupId: string,
): Promise<(GroupMember & { user: User })[]> {
  const data = await apiFetch<BackendMember[]>(
    `/groups/${groupId}/members`,
  );
  return data.map(mapMember);
}

export async function getGroupShares(groupId: string): Promise<ExpenseShare[]> {
  const data = await apiFetch<BackendExpenseList>(
    `/groups/${groupId}/expenses?page=1&limit=50`,
  );
  return data.expenses.flatMap((exp) =>
    exp.splits.map((s) => mapExpenseShare(s, exp.id)),
  );
}

export async function getGroupBalances(groupId: string): Promise<Balance[]> {
  const [memberData, sharesData] = await Promise.all([
    getGroupMembers(groupId),
    getGroupShares(groupId),
  ]);
  const memberUsers = memberData.map((m) => m.user);
  return calculateBalances(memberUsers, sharesData);
}

export async function getGroupSettlements(
  groupId: string,
  currency = "USD",
): Promise<Debt[]> {
  const data = await apiFetch<BackendDebtSummary[]>(
    `/groups/${groupId}/debts`,
  );
  return data.map((d) => ({
    from: d.debtor_id,
    to: d.creditor_id,
    amount: Number(d.total_owed),
    currency,
  }));
}

export async function createExpense(
  groupId: string,
  createdBy: string,
  description: string,
  amount: number,
  currency: string,
  splitAmong: string[],
): Promise<Expense> {
  const shareAmount = Math.floor((amount * 100) / splitAmong.length) / 100;
  let remainder =
    Math.round(amount * 100) - Math.round(shareAmount * 100) * splitAmong.length;

  const splits: Array<{
    debtor_id: string;
    creditor_id: string;
    amount_owed: number;
    percentage: number;
  }> = [];

  for (const debtorId of splitAmong) {
    if (debtorId === createdBy) continue;
    let owed = shareAmount;
    if (remainder > 0) {
      owed += 0.01;
      remainder--;
    }
    splits.push({
      debtor_id: debtorId,
      creditor_id: createdBy,
      amount_owed: owed,
      percentage: Math.round((1 / splitAmong.length) * 10000) / 100,
    });
  }

  const data = await apiFetch<BackendExpense>(
    `/groups/${groupId}/expenses`,
    {
      method: "POST",
      body: JSON.stringify({
        description,
        amount,
        payer_id: createdBy,
        splits,
      }),
    },
  );
  return mapExpense(data, currency);
}

export async function settleDebt(
  groupId: string,
  debt: Debt,
): Promise<void> {
  const allShares = await getGroupShares(groupId);
  const pendingShares = allShares.filter(
    (s) => s.debtorId === debt.from && s.status === "pending",
  );

  await Promise.all(
    pendingShares.map((share) =>
      apiFetch<unknown>(
        `/groups/${groupId}/debts/${share.id}/settle`,
        { method: "POST" },
      ),
    ),
  );
}

export async function removeUserFromGroup(
  groupId: string,
  userId: string,
): Promise<void> {
  await apiFetch<void>(
    `/groups/${groupId}/members/${userId}`,
    { method: "DELETE" },
  );
}
