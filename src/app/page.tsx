"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) router.replace("/groups");
  }, [isAuthenticated, router]);

  if (isAuthenticated) return null;

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center px-4">
      <div className="mx-auto max-w-2xl text-center">
        <div className="mb-8 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600 text-2xl font-bold text-white">
            F
          </div>
        </div>
        <h1 className="mb-4 text-5xl font-bold tracking-tight">
          Split expenses, not friendships.
        </h1>
        <p className="mb-8 text-lg text-muted-foreground">
          Track shared expenses, see who owes what, and settle up with
          optimized payments. No more awkward conversations about money.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/register">
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">
              Get Started for Free
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline">
              Login
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
