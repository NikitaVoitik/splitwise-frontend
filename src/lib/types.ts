export interface User {
  id: number;
  name: string;
  email: string;
  password?: string;
}

export interface AuthUser {
  id: string; // UUID from backend
  name: string;
  email: string;
  created_at: string;
}

export interface Group {
  id: number;
  name: string;
  currency: string;
}

export interface GroupMember {
  id: number;
  userId: number;
  groupId: number;
  role: string; // "admin" | "member"
}

export interface Expense {
  id: number;
  groupId: number;
  createdBy: number;
  amount: number;
  currency: string;
  description: string;
  expenseDate: string;
}

export interface ExpenseShare {
  id: number;
  expenseId: number;
  debtorId: number;
  creditorId: number;
  amountOwed: number;
  percentage: number;
  status: "pending" | "settled";
}

// Derived types used by the frontend for display
export interface Debt {
  from: number;
  to: number;
  amount: number;
  currency: string;
}

export interface Balance {
  userId: number;
  amount: number;
  currency: string;
}
