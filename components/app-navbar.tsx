"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";

type AppNavbarProps = {
  isAuthenticated: boolean;
  userName?: string | null;
};

const privateLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/transaction", label: "Tracker" },
];

export function AppNavbar({ isAuthenticated, userName }: AppNavbarProps) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/85 backdrop-blur-2xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 md:px-8">
        <Link href={isAuthenticated ? "/dashboard" : "/"} className="group flex items-center gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-xs font-semibold text-primary-foreground shadow-sm ring-1 ring-primary/30 transition-transform group-hover:scale-[1.04]">
            SF
          </span>
          <div className="leading-tight">
            <p className="text-sm font-semibold tracking-tight">Simple Finance</p>
            <p className="text-xs text-muted-foreground">Make Finance Simple!</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 rounded-xl border border-border/70 bg-card/70 p-1 md:flex">
          {isAuthenticated &&
            privateLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground",
                  pathname === link.href && "bg-accent text-foreground shadow-sm"
                )}
              >
                {link.label}
              </Link>
            ))}
        </nav>

        <div className="flex items-center gap-2">
          <ModeToggle />
          {isAuthenticated ? (
            <>
              <span className="hidden rounded-lg border border-border/70 bg-card/70 px-2.5 py-1 text-xs text-muted-foreground md:inline">
                {userName ?? "Account"}
              </span>
              <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: "/" })}>
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Link href="/sign-in">
                <Button variant="ghost" size="sm">
                  Sign in
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button size="sm">Get started</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
