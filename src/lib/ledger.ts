import type { User, ExpenseShare, Balance, Debt } from "./types";

export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

const COLOR_CLASSES = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-purple-500",
  "bg-cyan-500",
  "bg-orange-500",
  "bg-teal-500",
];

const HEX_COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#f43f5e",
  "#a855f7",
  "#06b6d4",
  "#f97316",
  "#14b8a6",
];

function hashName(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

export function getUserColorClass(name: string): string {
  return COLOR_CLASSES[hashName(name) % COLOR_CLASSES.length];
}

export function getUserHexColor(name: string): string {
  return HEX_COLORS[hashName(name) % HEX_COLORS.length];
}

export function calculateBalances(
  users: User[],
  shares: ExpenseShare[],
): Balance[] {
  const balanceMap = new Map<number, number>();

  for (const user of users) {
    balanceMap.set(user.id, 0);
  }

  for (const share of shares) {
    if (share.status === "settled") continue;
    const amountCents = Math.round(share.amountOwed * 100);
    // Creditor is owed money (positive)
    balanceMap.set(
      share.creditorId,
      (balanceMap.get(share.creditorId) ?? 0) + amountCents,
    );
    // Debtor owes money (negative)
    balanceMap.set(
      share.debtorId,
      (balanceMap.get(share.debtorId) ?? 0) - amountCents,
    );
  }

  return users.map((user) => ({
    userId: user.id,
    amount: (balanceMap.get(user.id) ?? 0) / 100,
    currency: "USD",
  }));
}

export function simplifyDebts(balances: Balance[]): Debt[] {
  const nets = balances
    .filter((b) => Math.abs(b.amount) > 0.01)
    .map((b) => ({ userId: b.userId, amount: Math.round(b.amount * 100) }));

  const debts: Debt[] = [];

  while (true) {
    const debtors = nets
      .filter((n) => n.amount < 0)
      .sort((a, b) => a.amount - b.amount);
    const creditors = nets
      .filter((n) => n.amount > 0)
      .sort((a, b) => b.amount - a.amount);

    if (debtors.length === 0 || creditors.length === 0) break;

    const debtor = debtors[0];
    const creditor = creditors[0];
    const amount = Math.min(-debtor.amount, creditor.amount);

    debts.push({
      from: debtor.userId,
      to: creditor.userId,
      amount: amount / 100,
      currency: "USD",
    });

    debtor.amount += amount;
    creditor.amount -= amount;
  }

  return debts;
}
