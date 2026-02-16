"use client";

import type { User, Debt } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getUserColorClass, formatCurrency } from "@/lib/ledger";

interface SettlementPlanProps {
  users: User[];
  debts: Debt[];
  onSettle: (debt: Debt) => void;
  isSettling?: boolean;
}

export function SettlementPlan({
  users,
  debts,
  onSettle,
  isSettling,
}: SettlementPlanProps) {
  const userMap = new Map(users.map((u) => [u.id, u]));

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">Settlement Plan</CardTitle>
        <Badge variant="outline" className="text-xs">
          Min-Flow Optimized
        </Badge>
      </CardHeader>
      <CardContent>
        {debts.length === 0 ? (
          <div className="py-6 text-center">
            <p className="text-lg font-medium text-emerald-600">
              All settled up!
            </p>
            <p className="text-sm text-muted-foreground">
              No outstanding debts.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {debts.map((debt, i) => {
              const fromUser = userMap.get(debt.from);
              const toUser = userMap.get(debt.to);
              if (!fromUser || !toUser) return null;

              return (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium text-white ${getUserColorClass(fromUser.name)}`}
                    >
                      {fromUser.name.charAt(0)}
                    </div>
                    <span className="text-sm font-medium">
                      {fromUser.name}
                    </span>
                    <span className="text-xs text-muted-foreground">PAYS</span>
                    <Badge
                      variant="secondary"
                      className="font-mono font-semibold"
                    >
                      {formatCurrency(debt.amount)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">→</span>
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium text-white ${getUserColorClass(toUser.name)}`}
                    >
                      {toUser.name.charAt(0)}
                    </div>
                    <span className="text-sm font-medium">{toUser.name}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                    onClick={() => onSettle(debt)}
                    disabled={isSettling}
                  >
                    Settle
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
