"use client";

import { useState } from "react";
import type { User, Debt, Balance } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getUserHexColor, formatCurrency } from "@/lib/ledger";

interface DebtGraphProps {
  users: User[];
  debts: Debt[];
  balances: Balance[];
}

export function DebtGraph({ users, debts, balances }: DebtGraphProps) {
  const [hoveredUser, setHoveredUser] = useState<number | null>(null);

  const width = 400;
  const height = 400;
  const cx = width / 2;
  const cy = height / 2;
  const radius = 140;
  const nodeRadius = 28;

  const balanceMap = new Map(balances.map((b) => [b.userId, b.amount]));

  // Position users in a circle
  const positions = users.map((user, i) => {
    const angle = (2 * Math.PI * i) / users.length - Math.PI / 2;
    return {
      user,
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    };
  });

  const posMap = new Map(positions.map((p) => [p.user.id, p]));

  // Arrow marker id
  const markerId = "arrowhead";

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">Debt Network</CardTitle>
        <Badge variant="outline" className="text-xs">
          Interactive
        </Badge>
      </CardHeader>
      <CardContent className="flex justify-center">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-auto w-full max-w-[400px]"
        >
          <defs>
            <marker
              id={markerId}
              markerWidth="8"
              markerHeight="6"
              refX="7"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 8 3, 0 6" fill="#6b7280" />
            </marker>
          </defs>

          {/* Debt arrows */}
          {debts.map((debt, i) => {
            const from = posMap.get(debt.from);
            const to = posMap.get(debt.to);
            if (!from || !to) return null;

            const dx = to.x - from.x;
            const dy = to.y - from.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const ux = dx / dist;
            const uy = dy / dist;

            const startX = from.x + ux * (nodeRadius + 4);
            const startY = from.y + uy * (nodeRadius + 4);
            const endX = to.x - ux * (nodeRadius + 8);
            const endY = to.y - uy * (nodeRadius + 8);
            const midX = (startX + endX) / 2;
            const midY = (startY + endY) / 2;

            const dimmed =
              hoveredUser !== null &&
              hoveredUser !== debt.from &&
              hoveredUser !== debt.to;

            return (
              <g key={i} opacity={dimmed ? 0.15 : 1}>
                <line
                  x1={startX}
                  y1={startY}
                  x2={endX}
                  y2={endY}
                  stroke="#6b7280"
                  strokeWidth={2}
                  markerEnd={`url(#${markerId})`}
                />
                <rect
                  x={midX - 24}
                  y={midY - 10}
                  width={48}
                  height={20}
                  rx={4}
                  fill="white"
                  stroke="#e5e7eb"
                />
                <text
                  x={midX}
                  y={midY + 4}
                  textAnchor="middle"
                  className="text-[10px] font-medium"
                  fill="#374151"
                >
                  {formatCurrency(debt.amount)}
                </text>
              </g>
            );
          })}

          {/* User nodes */}
          {positions.map(({ user, x, y }) => {
            const balance = balanceMap.get(user.id) ?? 0;
            const ringColor =
              balance > 0.01
                ? "#10b981"
                : balance < -0.01
                  ? "#ef4444"
                  : "#d1d5db";
            const dimmed =
              hoveredUser !== null && hoveredUser !== user.id;

            return (
              <g
                key={user.id}
                opacity={dimmed ? 0.3 : 1}
                onMouseEnter={() => setHoveredUser(user.id)}
                onMouseLeave={() => setHoveredUser(null)}
                className="cursor-pointer"
              >
                {/* Balance ring */}
                <circle
                  cx={x}
                  cy={y}
                  r={nodeRadius + 3}
                  fill="none"
                  stroke={ringColor}
                  strokeWidth={3}
                />
                {/* Node circle */}
                <circle
                  cx={x}
                  cy={y}
                  r={nodeRadius}
                  fill={getUserHexColor(user.name)}
                />
                {/* Initial */}
                <text
                  x={x}
                  y={y - 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  className="text-sm font-bold"
                >
                  {user.name.charAt(0)}
                </text>
                {/* Name label */}
                <text
                  x={x}
                  y={y + nodeRadius + 16}
                  textAnchor="middle"
                  className="text-[11px] font-medium"
                  fill="#374151"
                >
                  {user.name}
                </text>
                {/* Balance badge */}
                <rect
                  x={x - 22}
                  y={y + 12}
                  width={44}
                  height={16}
                  rx={8}
                  fill={ringColor}
                />
                <text
                  x={x}
                  y={y + 22}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  className="text-[9px] font-semibold"
                >
                  {balance >= 0 ? "+" : ""}
                  {balance.toFixed(0)}
                </text>
              </g>
            );
          })}
        </svg>
      </CardContent>
    </Card>
  );
}
