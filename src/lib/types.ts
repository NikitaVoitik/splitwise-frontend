export interface User {
  id: string;
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
  id: string;
  name: string;
  currency: string;
}

export interface GroupMember {
  id: string;
  userId: string;
  groupId: string;
  role: string; // "admin" | "member"
}

export interface Expense {
  id: string;
  groupId: string;
  createdBy: string;
  amount: number;
  currency: string;
  description: string;
  expenseDate: string;
}

export interface ExpenseShare {
  id: string;
  expenseId: string;
  debtorId: string;
  creditorId: string;
  amountOwed: number;
  percentage: number;
  status: "pending" | "settled";
}

// Derived types used by the frontend for display
export interface Debt {
  from: string;
  to: string;
  amount: number;
  currency: string;
}

export interface Balance {
  userId: string;
  amount: number;
  currency: string;
}
