import {
  MOCK_USERS,
  MOCK_GROUPS,
  MOCK_GROUP_MEMBERS,
  MOCK_EXPENSES,
  MOCK_EXPENSE_SHARES,
} from "./mock-data";
import type { Expense, ExpenseShare, Debt, Balance, User, Group, GroupMember } from "./types";
import { calculateBalances, simplifyDebts } from "./ledger";

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));

// In-memory mutable state for mutations
let users = [...MOCK_USERS];
let groups = [...MOCK_GROUPS];
let members = [...MOCK_GROUP_MEMBERS];
let expenses = [...MOCK_EXPENSES];
let shares = [...MOCK_EXPENSE_SHARES];

let nextExpenseId = 100;
let nextShareId = 100;
let nextMemberId = 100;

export async function getGroups(userId: number): Promise<Group[]> {
  await delay();
  const userGroupIds = members
    .filter((m) => m.userId === userId)
    .map((m) => m.groupId);
  return groups.filter((g) => userGroupIds.includes(g.id));
}

export async function getGroup(id: number): Promise<Group | undefined> {
  await delay();
  return groups.find((g) => g.id === id);
}

export async function getGroupExpenses(groupId: number): Promise<Expense[]> {
  await delay();
  return expenses
    .filter((e) => e.groupId === groupId)
    .sort((a, b) => new Date(b.expenseDate).getTime() - new Date(a.expenseDate).getTime());
}

export async function getGroupMembers(groupId: number): Promise<(GroupMember & { user: User })[]> {
  await delay();
  return members
    .filter((m) => m.groupId === groupId)
    .map((m) => ({
      ...m,
      user: users.find((u) => u.id === m.userId)!,
    }))
    .filter((m) => m.user);
}

export async function getGroupShares(groupId: number): Promise<ExpenseShare[]> {
  await delay();
  const groupExpenseIds = expenses
    .filter((e) => e.groupId === groupId)
    .map((e) => e.id);
  return shares.filter((s) => groupExpenseIds.includes(s.expenseId));
}

export async function getGroupBalances(groupId: number): Promise<Balance[]> {
  await delay();
  const groupMembers = await getGroupMembers(groupId);
  const groupShares = await getGroupShares(groupId);
  const memberUsers = groupMembers.map((m) => m.user);
  return calculateBalances(memberUsers, groupShares);
}

export async function getGroupSettlements(groupId: number): Promise<Debt[]> {
  await delay();
  const balances = await getGroupBalances(groupId);
  return simplifyDebts(balances);
}

export async function createExpense(
  groupId: number,
  createdBy: number,
  description: string,
  amount: number,
  currency: string,
  splitAmong: number[],
): Promise<Expense> {
  await delay();
  const expense: Expense = {
    id: nextExpenseId++,
    groupId,
    createdBy,
    description,
    amount,
    currency,
    expenseDate: new Date().toISOString().split("T")[0],
  };
  expenses = [expense, ...expenses];

  // Create equal-split shares
  const shareAmount = Math.floor((amount * 100) / splitAmong.length) / 100;
  let remainder = Math.round(amount * 100) - Math.round(shareAmount * 100) * splitAmong.length;

  for (const debtorId of splitAmong) {
    if (debtorId === createdBy) continue;
    let owed = shareAmount;
    if (remainder > 0) {
      owed += 0.01;
      remainder--;
    }
    shares.push({
      id: nextShareId++,
      expenseId: expense.id,
      debtorId,
      creditorId: createdBy,
      amountOwed: owed,
      percentage: Math.round((1 / splitAmong.length) * 10000) / 100,
      status: "pending",
    });
  }

  return expense;
}

export async function settleDebt(groupId: number, debt: Debt): Promise<void> {
  await delay();
  // Create a settlement expense
  const expense: Expense = {
    id: nextExpenseId++,
    groupId,
    createdBy: debt.from,
    description: `Settlement: ${users.find((u) => u.id === debt.from)?.name} → ${users.find((u) => u.id === debt.to)?.name}`,
    amount: debt.amount,
    currency: debt.currency,
    expenseDate: new Date().toISOString().split("T")[0],
  };
  expenses = [expense, ...expenses];

  // Mark all pending shares between these two users as settled
  const groupExpenseIds = expenses
    .filter((e) => e.groupId === groupId)
    .map((e) => e.id);

  shares = shares.map((s) => {
    if (
      groupExpenseIds.includes(s.expenseId) &&
      s.debtorId === debt.from &&
      s.creditorId === debt.to &&
      s.status === "pending"
    ) {
      return { ...s, status: "settled" as const };
    }
    return s;
  });
}

export async function removeUserFromGroup(groupId: number, userId: number): Promise<void> {
  await delay();
  members = members.filter((m) => !(m.groupId === groupId && m.userId === userId));
}

export async function getUserById(id: number): Promise<User | undefined> {
  await delay(100);
  return users.find((u) => u.id === id);
}
