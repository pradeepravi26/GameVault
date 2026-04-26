"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authChangedEventName } from "@/components/auth-status";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { register } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <section className="mx-auto flex w-full max-w-md flex-col gap-6 px-6 py-16">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Register</h1>
        <p className="text-sm text-muted-foreground">
          Create a GameVault account to save collections and reviews.
        </p>
      </div>

      <form
        className="flex flex-col gap-4 rounded-lg border p-6"
        onSubmit={async (event) => {
          event.preventDefault();
          setError(null);
          setIsSubmitting(true);

          try {
            await register({
              username,
              password,
              firstName,
              lastName,
            });
            window.dispatchEvent(new Event(authChangedEventName));
            router.push("/");
            router.refresh();
          } catch (caughtError) {
            setError(
              caughtError instanceof Error
                ? caughtError.message
                : "Unable to create account.",
            );
          } finally {
            setIsSubmitting(false);
          }
        }}
      >
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="register-username">
            Username
          </label>
          <Input
            id="register-username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            autoComplete="username"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="register-password">
            Password
          </label>
          <Input
            id="register-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="first-name">
              First name
            </label>
            <Input
              id="first-name"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              autoComplete="given-name"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="last-name">
              Last name
            </label>
            <Input
              id="last-name"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              autoComplete="family-name"
            />
          </div>
        </div>

        {error ? (
          <div className="rounded-md border border-destructive/30 p-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating account..." : "Register"}
        </Button>

        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link className="underline underline-offset-4" href="/login">
            Login
          </Link>
        </p>
      </form>
    </section>
  );
}
