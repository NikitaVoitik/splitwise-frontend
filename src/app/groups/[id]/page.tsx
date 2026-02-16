"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ProtectedRoute } from "@/components/protected-route";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { DebtGraph } from "@/components/debt-graph";
import { BalanceChart } from "@/components/balance-chart";
import { SettlementPlan } from "@/components/settlement-plan";
import { AddExpenseModal } from "@/components/add-expense-modal";
import {
  getGroup,
  getGroupExpenses,
  getGroupMembers,
  getGroupBalances,
  getGroupSettlements,
  settleDebt,
} from "@/lib/api";
import { formatCurrency } from "@/lib/ledger";
import { useAuth } from "@/lib/auth-context";
import type { User, Debt } from "@/lib/types";

function GroupDetailContent({ id }: { id: number }) {
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();

  const { data: group } = useQuery({
    queryKey: ["group", id],
    queryFn: () => getGroup(id),
  });

  const { data: expenses } = useQuery({
    queryKey: ["expenses", id],
    queryFn: () => getGroupExpenses(id),
  });

  const { data: memberData } = useQuery({
    queryKey: ["members", id],
    queryFn: () => getGroupMembers(id),
  });

  const { data: balances } = useQuery({
    queryKey: ["balances", id],
    queryFn: () => getGroupBalances(id),
  });

  const { data: settlements } = useQuery({
    queryKey: ["settlements", id],
    queryFn: () => getGroupSettlements(id),
  });

  const settleMutation = useMutation({
    mutationFn: (debt: Debt) => settleDebt(id, debt),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses", id] });
      queryClient.invalidateQueries({ queryKey: ["balances", id] });
      queryClient.invalidateQueries({ queryKey: ["settlements", id] });
      queryClient.invalidateQueries({ queryKey: ["shares", id] });
    },
  });

  const members = memberData?.map((m) => m.user) ?? [];
  const memberMap = new Map<number, User>(members.map((u) => [u.id, u]));

  if (!group) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-muted-foreground">
        Loading...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/groups"
          className="mb-2 inline-block text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to Groups
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">{group.name}</h1>
            <div className="mt-1 flex items-center gap-2">
              <Badge variant="secondary">{group.currency}</Badge>
              <span className="text-sm text-muted-foreground">
                {members.length} members
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href={`/groups/${id}/members`}>
              <Button variant="outline" size="sm">
                Members
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(
                  `${window.location.origin}/register?inviteGroupId=${id}`,
                );
              }}
            >
              Invite
            </Button>
            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={() => setExpenseModalOpen(true)}
            >
              + Add Expense
            </Button>
          </div>
        </div>
      </div>

      <Separator className="mb-6" />

      {/* Two-column layout */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left: Expenses */}
        <div className="lg:col-span-5">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              {!expenses || expenses.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No expenses yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {expenses.map((expense) => {
                    const payer = memberMap.get(expense.createdBy);
                    return (
                      <div
                        key={expense.id}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-center">
                            <div className="text-xs uppercase text-muted-foreground">
                              {new Date(expense.expenseDate).toLocaleDateString(
                                "en-US",
                                { month: "short" },
                              )}
                            </div>
                            <div className="text-lg font-semibold">
                              {new Date(expense.expenseDate).getDate()}
                            </div>
                          </div>
                          <div>
                            <p className="font-medium">
                              {expense.description}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              paid by{" "}
                              <span className="font-medium">
                                {payer?.name ?? "Unknown"}
                              </span>
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
                            {formatCurrency(expense.amount, expense.currency)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Visualizations */}
        <div className="space-y-6 lg:col-span-7">
          {members.length > 0 && settlements && balances && (
            <DebtGraph
              users={members}
              debts={settlements}
              balances={balances}
            />
          )}

          {members.length > 0 && balances && (
            <BalanceChart users={members} balances={balances} />
          )}

          {members.length > 0 && settlements && (
            <SettlementPlan
              users={members}
              debts={settlements}
              onSettle={(debt) => settleMutation.mutate(debt)}
              isSettling={settleMutation.isPending}
            />
          )}
        </div>
      </div>

      {/* Add Expense Modal */}
      {members.length > 0 && (
        <AddExpenseModal
          open={expenseModalOpen}
          onOpenChange={setExpenseModalOpen}
          groupId={id}
          currency={group.currency}
          members={members}
          // TODO: Connect groups API to backend (currentUser.id is a UUID string, prop expects number)
          currentUserId={currentUser!.id as unknown as number}
        />
      )}
    </div>
  );
}

export default function GroupDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <ProtectedRoute>
      <GroupDetailContent id={Number(id)} />
    </ProtectedRoute>
  );
}
