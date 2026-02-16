"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ProtectedRoute } from "@/components/protected-route";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { getGroup, getGroupMembers, getGroupBalances, removeUserFromGroup } from "@/lib/api";
import { getUserColorClass, formatCurrency } from "@/lib/ledger";
import { useAuth } from "@/lib/auth-context";

function MembersContent({ id }: { id: number }) {
  const [copied, setCopied] = useState(false);
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();

  const { data: group } = useQuery({
    queryKey: ["group", id],
    queryFn: () => getGroup(id),
  });

  const { data: memberData } = useQuery({
    queryKey: ["members", id],
    queryFn: () => getGroupMembers(id),
  });

  const { data: balances } = useQuery({
    queryKey: ["balances", id],
    queryFn: () => getGroupBalances(id),
  });

  const removeMutation = useMutation({
    mutationFn: (userId: number) => removeUserFromGroup(id, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members", id] });
      queryClient.invalidateQueries({ queryKey: ["balances", id] });
      queryClient.invalidateQueries({ queryKey: ["settlements", id] });
    },
  });

  const members = memberData ?? [];
  const balanceMap = new Map(balances?.map((b) => [b.userId, b.amount]) ?? []);
  const inviteLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/register?inviteGroupId=${id}`
      : "";

  if (!group) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-muted-foreground">
        Loading...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link
        href={`/groups/${id}`}
        className="mb-2 inline-block text-sm text-muted-foreground hover:text-foreground"
      >
        ← Back to {group.name}
      </Link>
      <h1 className="mb-6 text-2xl font-bold">Members — {group.name}</h1>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left: Member list */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Current Members ({members.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {members.map((m) => {
                  const balance = balanceMap.get(m.userId) ?? 0;
                  return (
                    <div
                      key={m.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium text-white ${getUserColorClass(m.user.name)}`}
                        >
                          {m.user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{m.user.name}</span>
                            {/* TODO: Connect groups API to backend — comparison will be false until member IDs are UUIDs */}
                            {m.userId === (currentUser?.id as unknown as number) && (
                              <Badge variant="secondary" className="text-xs">
                                You
                              </Badge>
                            )}
                            {m.role === "admin" && (
                              <Badge variant="outline" className="text-xs">
                                Admin
                              </Badge>
                            )}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {m.user.email}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-sm font-medium ${
                            balance > 0.01
                              ? "text-emerald-600"
                              : balance < -0.01
                                ? "text-red-500"
                                : "text-muted-foreground"
                          }`}
                        >
                          {balance > 0.01
                            ? `gets back ${formatCurrency(balance)}`
                            : balance < -0.01
                              ? `owes ${formatCurrency(Math.abs(balance))}`
                              : "settled up"}
                        </span>
                        {m.userId !== (currentUser?.id as unknown as number) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:bg-red-50 hover:text-red-600"
                            onClick={() => {
                              if (
                                confirm(
                                  `Remove ${m.user.name} from this group?`,
                                )
                              ) {
                                removeMutation.mutate(m.userId);
                              }
                            }}
                            disabled={removeMutation.isPending}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Invite */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Invite Members</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Share this link to invite new members to the group.
              </p>
              <Input value={inviteLink} readOnly className="text-xs" />
              <Button
                className="w-full"
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(inviteLink);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
              >
                {copied ? "Copied!" : "Copy Link"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function MembersPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <ProtectedRoute>
      <MembersContent id={Number(id)} />
    </ProtectedRoute>
  );
}
