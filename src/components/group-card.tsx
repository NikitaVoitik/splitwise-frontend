"use client";

import Link from "next/link";
import type { Group, User } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getUserColorClass } from "@/lib/ledger";

interface GroupCardProps {
  group: Group;
  members: User[];
}

export function GroupCard({ group, members }: GroupCardProps) {
  const visibleMembers = members.slice(0, 4);
  const extraCount = members.length - visibleMembers.length;

  return (
    <Link href={`/groups/${group.id}`}>
      <Card className="cursor-pointer transition-shadow hover:shadow-md">
        <div className="h-32 rounded-t-lg bg-gradient-to-br from-emerald-400 to-emerald-600" />
        <CardContent className="p-4">
          <div className="mb-2 flex items-start justify-between">
            <h3 className="font-semibold">{group.name}</h3>
            <Badge variant="secondary" className="text-xs">
              {group.currency}
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            {visibleMembers.map((user) => (
              <div
                key={user.id}
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium text-white ${getUserColorClass(user.name)}`}
                title={user.name}
              >
                {user.name.charAt(0)}
              </div>
            ))}
            {extraCount > 0 && (
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-200 text-xs font-medium text-gray-600">
                +{extraCount}
              </div>
            )}
          </div>
          <p className="mt-3 text-sm text-emerald-600">View Ledger →</p>
        </CardContent>
      </Card>
    </Link>
  );
}
