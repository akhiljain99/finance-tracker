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
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 md:px-8">
        <Link href={isAuthenticated ? "/dashboard" : "/"} className="flex items-center gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-emerald-500 text-sm font-semibold text-white">
            SF
          </span>
          <div className="leading-tight">
            <p className="text-sm font-semibold tracking-wide">Simple Finance</p>
            <p className="text-xs text-muted-foreground">Make finance simple</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {isAuthenticated &&
            privateLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground",
                  pathname === link.href && "bg-accent text-foreground"
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
              <span className="hidden text-sm text-muted-foreground md:inline">{userName ?? "Account"}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Link href="/sign-in">
                <Button variant="ghost" size="sm">Sign in</Button>
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
