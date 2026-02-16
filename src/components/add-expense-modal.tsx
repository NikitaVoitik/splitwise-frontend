"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { User } from "@/lib/types";
import { createExpense } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface AddExpenseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: number;
  currency: string;
  members: User[];
  currentUserId: number;
}

export function AddExpenseModal({
  open,
  onOpenChange,
  groupId,
  currency,
  members,
  currentUserId,
}: AddExpenseModalProps) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [payerId, setPayerId] = useState(String(currentUserId));
  const [splitAmong, setSplitAmong] = useState<number[]>(
    members.map((m) => m.id),
  );

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () =>
      createExpense(
        groupId,
        Number(payerId),
        description,
        Number(amount),
        currency,
        splitAmong,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses", groupId] });
      queryClient.invalidateQueries({ queryKey: ["balances", groupId] });
      queryClient.invalidateQueries({ queryKey: ["settlements", groupId] });
      queryClient.invalidateQueries({ queryKey: ["shares", groupId] });
      onOpenChange(false);
      setDescription("");
      setAmount("");
      setSplitAmong(members.map((m) => m.id));
    },
  });

  const toggleMember = (userId: number) => {
    setSplitAmong((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Expense</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What was this for?"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount ({currency})</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Paid by</Label>
            <Select value={payerId} onValueChange={setPayerId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {members.map((m) => (
                  <SelectItem key={m.id} value={String(m.id)}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Split among</Label>
              <div className="flex gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs"
                  onClick={() => setSplitAmong(members.map((m) => m.id))}
                >
                  All
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs"
                  onClick={() => setSplitAmong([])}
                >
                  None
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {members.map((m) => (
                <Badge
                  key={m.id}
                  variant={splitAmong.includes(m.id) ? "default" : "outline"}
                  className="cursor-pointer select-none"
                  onClick={() => toggleMember(m.id)}
                >
                  {m.name}
                </Badge>
              ))}
            </div>
            {splitAmong.length > 0 && amount && (
              <p className="text-xs text-muted-foreground">
                {formatSplitPreview(Number(amount), splitAmong.length)}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700"
              disabled={mutation.isPending || splitAmong.length === 0}
            >
              {mutation.isPending ? "Saving..." : "Save Expense"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function formatSplitPreview(amount: number, count: number): string {
  const perPerson = (amount / count).toFixed(2);
  return `${new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(perPerson))} per person`;
}
