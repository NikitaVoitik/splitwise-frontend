"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { getUserColorClass } from "@/lib/ledger";

export function Navbar() {
  const { currentUser, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-50 border-b bg-white">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-600 text-sm font-bold text-white">
            F
          </div>
          <span className="text-lg font-semibold">FairShare</span>
        </Link>

        <nav className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Link href="/groups">
                <Button variant="ghost" size="sm">
                  My Groups
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium text-white ${getUserColorClass(currentUser!.name)}`}
                >
                  {currentUser!.name.charAt(0)}
                </div>
                <span className="text-sm text-muted-foreground">
                  {currentUser!.name}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  logout();
                  router.push("/");
                }}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Sign Up</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
