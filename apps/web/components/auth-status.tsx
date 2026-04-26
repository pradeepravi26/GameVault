"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { AuthUser } from "@gamevault/contracts";
import { Button } from "@/components/ui/button";
import { getCurrentUser, logout } from "@/lib/api";

export const authChangedEventName = "gamevault-auth-changed";

export function AuthStatus() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadUser() {
      if (!cancelled) {
        setIsLoading(true);
      }

      try {
        const response = await getCurrentUser();

        if (!cancelled) {
          setUser(response.user);
        }
      } catch {
        if (!cancelled) {
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadUser();

    function handleAuthChanged() {
      void loadUser();
    }

    window.addEventListener(authChangedEventName, handleAuthChanged);

    return () => {
      cancelled = true;
      window.removeEventListener(authChangedEventName, handleAuthChanged);
    };
  }, []);

  if (isLoading) {
    return <div className="h-9 w-24 rounded-md border bg-muted" />;
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link href="/login">Login</Link>
        </Button>
        <Button asChild size="sm">
          <Link href="/register">Register</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">{user.username}</span>
      <Button
        variant="outline"
        size="sm"
        onClick={async () => {
          await logout();
          window.dispatchEvent(new Event(authChangedEventName));
        }}
      >
        Logout
      </Button>
    </div>
  );
}
