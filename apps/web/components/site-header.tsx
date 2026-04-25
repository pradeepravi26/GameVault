import Link from "next/link";
import { Gamepad2 } from "lucide-react";
import { AuthStatus } from "@/components/auth-status";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/catalog", label: "Catalog" },
  { href: "/collections", label: "Browse Collections" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="flex items-center gap-3 text-base font-semibold"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-md border">
            <Gamepad2 className="h-4 w-4" />
          </span>
          GameVault
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <AuthStatus />
      </div>
    </header>
  );
}
