"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from "recharts";
import type { User, Balance } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/ledger";

interface BalanceChartProps {
  users: User[];
  balances: Balance[];
}

export function BalanceChart({ users, balances }: BalanceChartProps) {
  const userMap = new Map(users.map((u) => [u.id, u]));

  const data = balances.map((b) => ({
    name: userMap.get(b.userId)?.name ?? "Unknown",
    amount: b.amount,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Net Balances</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={Math.max(data.length * 50, 120)}>
          <BarChart data={data} layout="vertical" margin={{ left: 10, right: 30 }}>
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="name"
              width={70}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              formatter={(value) => formatCurrency(Number(value))}
              labelStyle={{ fontWeight: 600 }}
            />
            <Bar dataKey="amount" radius={[0, 4, 4, 0]} barSize={24}>
              {data.map((entry, index) => (
                <Cell
                  key={index}
                  fill={entry.amount >= 0 ? "#10b981" : "#ef4444"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
