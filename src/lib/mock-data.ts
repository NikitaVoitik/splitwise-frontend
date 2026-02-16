import type { User, Group, GroupMember, Expense, ExpenseShare } from "./types";

export const MOCK_USERS: User[] = [
  { id: 1, name: "Alice", email: "alice@example.com" },
  { id: 2, name: "Bob", email: "bob@example.com" },
  { id: 3, name: "Charlie", email: "charlie@example.com" },
  { id: 4, name: "David", email: "david@example.com" },
];

export const MOCK_GROUPS: Group[] = [
  { id: 1, name: "Paris Trip 2024", currency: "USD" },
  { id: 2, name: "Apartment 4B", currency: "USD" },
];

export const MOCK_GROUP_MEMBERS: GroupMember[] = [
  // Paris Trip — all 4 members
  { id: 1, userId: 1, groupId: 1, role: "admin" },
  { id: 2, userId: 2, groupId: 1, role: "member" },
  { id: 3, userId: 3, groupId: 1, role: "member" },
  { id: 4, userId: 4, groupId: 1, role: "member" },
  // Apartment — Alice & Bob
  { id: 5, userId: 1, groupId: 2, role: "admin" },
  { id: 6, userId: 2, groupId: 2, role: "member" },
];

export const MOCK_EXPENSES: Expense[] = [
  {
    id: 1,
    groupId: 1,
    createdBy: 1,
    description: "Welcome Dinner",
    amount: 120.0,
    currency: "USD",
    expenseDate: "2024-05-10",
  },
  {
    id: 2,
    groupId: 1,
    createdBy: 2,
    description: "Uber to Hotel",
    amount: 45.0,
    currency: "USD",
    expenseDate: "2024-05-10",
  },
  {
    id: 3,
    groupId: 1,
    createdBy: 3,
    description: "Museum Tickets",
    amount: 80.0,
    currency: "USD",
    expenseDate: "2024-05-11",
  },
  {
    id: 4,
    groupId: 1,
    createdBy: 1,
    description: "Groceries",
    amount: 60.0,
    currency: "USD",
    expenseDate: "2024-05-12",
  },
  {
    id: 5,
    groupId: 2,
    createdBy: 1,
    description: "Electric Bill",
    amount: 90.0,
    currency: "USD",
    expenseDate: "2024-06-01",
  },
  {
    id: 6,
    groupId: 2,
    createdBy: 2,
    description: "Internet",
    amount: 60.0,
    currency: "USD",
    expenseDate: "2024-06-01",
  },
];

export const MOCK_EXPENSE_SHARES: ExpenseShare[] = [
  // Expense 1: Welcome Dinner ($120, paid by Alice, split 4 ways)
  { id: 1, expenseId: 1, debtorId: 2, creditorId: 1, amountOwed: 30, percentage: 25, status: "pending" },
  { id: 2, expenseId: 1, debtorId: 3, creditorId: 1, amountOwed: 30, percentage: 25, status: "pending" },
  { id: 3, expenseId: 1, debtorId: 4, creditorId: 1, amountOwed: 30, percentage: 25, status: "pending" },

  // Expense 2: Uber to Hotel ($45, paid by Bob, split 4 ways)
  { id: 4, expenseId: 2, debtorId: 1, creditorId: 2, amountOwed: 11.25, percentage: 25, status: "pending" },
  { id: 5, expenseId: 2, debtorId: 3, creditorId: 2, amountOwed: 11.25, percentage: 25, status: "pending" },
  { id: 6, expenseId: 2, debtorId: 4, creditorId: 2, amountOwed: 11.25, percentage: 25, status: "pending" },

  // Expense 3: Museum Tickets ($80, paid by Charlie, split with Alice)
  { id: 7, expenseId: 3, debtorId: 1, creditorId: 3, amountOwed: 40, percentage: 50, status: "pending" },

  // Expense 4: Groceries ($60, paid by Alice, split 4 ways)
  { id: 8, expenseId: 4, debtorId: 2, creditorId: 1, amountOwed: 15, percentage: 25, status: "pending" },
  { id: 9, expenseId: 4, debtorId: 3, creditorId: 1, amountOwed: 15, percentage: 25, status: "pending" },
  { id: 10, expenseId: 4, debtorId: 4, creditorId: 1, amountOwed: 15, percentage: 25, status: "pending" },

  // Expense 5: Electric Bill ($90, paid by Alice, split with Bob)
  { id: 11, expenseId: 5, debtorId: 2, creditorId: 1, amountOwed: 45, percentage: 50, status: "pending" },

  // Expense 6: Internet ($60, paid by Bob, split with Alice)
  { id: 12, expenseId: 6, debtorId: 1, creditorId: 2, amountOwed: 30, percentage: 50, status: "pending" },
];
