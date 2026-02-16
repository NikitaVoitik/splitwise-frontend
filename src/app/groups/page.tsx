"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { getGroups, getGroupMembers } from "@/lib/api";
import { ProtectedRoute } from "@/components/protected-route";
import { GroupCard } from "@/components/group-card";
import { Card, CardContent } from "@/components/ui/card";

function GroupCardWithMembers({ groupId, group }: { groupId: number; group: Parameters<typeof GroupCard>[0]["group"] }) {
  const { data: memberData } = useQuery({
    queryKey: ["members", groupId],
    queryFn: () => getGroupMembers(groupId),
  });

  const members = memberData?.map((m) => m.user) ?? [];

  return <GroupCard group={group} members={members} />;
}

function DashboardContent() {
  const { currentUser } = useAuth();

  const { data: groups, isLoading } = useQuery({
    queryKey: ["groups", currentUser?.id],
    // TODO: Connect groups API to backend (currentUser.id is a UUID string, getGroups expects number)
    queryFn: () => getGroups(currentUser!.id as unknown as number),
    enabled: !!currentUser,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-muted-foreground">
        Loading groups...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Groups</h1>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {groups?.map((group) => (
          <GroupCardWithMembers key={group.id} groupId={group.id} group={group} />
        ))}
        <Card className="flex min-h-[200px] cursor-pointer items-center justify-center border-dashed transition-colors hover:bg-muted/50">
          <CardContent className="text-center text-muted-foreground">
            <div className="mb-2 text-3xl">+</div>
            <p className="text-sm">Create new group</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function GroupsPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
