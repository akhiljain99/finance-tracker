import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { ArrowRight, BarChart3, Coins, Landmark } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    title: "Track spending instantly",
    description: "Capture expenses and income in seconds with clean categories.",
    icon: BarChart3,
  },
  {
    title: "Manage investments",
    description: "Track stocks, crypto, real estate, and portfolio growth in one place.",
    icon: Coins,
  },
  {
    title: "Daily morning digest",
    description: "Receive a daily monthly-spending email so your numbers stay top-of-mind.",
    icon: Landmark,
  },
];

export default async function Home() {
  const session = await getServerSession(authOptions);
  if (session?.user?.id) {
    redirect("/dashboard");
  }

  return (
    <div className="relative isolate overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.18),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(16,185,129,0.18),transparent_35%),linear-gradient(to_bottom,transparent,rgba(2,6,23,0.03))]" />
      <section className="mx-auto flex min-h-[82vh] w-full max-w-6xl flex-col justify-center gap-10 px-4 py-14 md:px-8">
        <div className="max-w-3xl space-y-6">
          <p className="inline-flex rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300">
            Simple Finance
          </p>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight md:text-6xl">
            Make finance simple.
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground md:text-xl">
            One modern dashboard for spending, income, and investments. Built for daily clarity,
            not spreadsheet chaos.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/sign-up">
              <Button size="lg" className="gap-2">
                Start tracking
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button size="lg" variant="outline">
                Sign in
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} className="border-border/70 bg-card/80 backdrop-blur">
              <CardHeader className="pb-2">
                <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <feature.icon className="h-4 w-4" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">{feature.description}</CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
