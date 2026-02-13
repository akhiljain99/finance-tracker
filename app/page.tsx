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
    description: "Get a concise daily summary so your numbers stay top-of-mind.",
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
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_10%,rgba(16,163,127,0.16),transparent_38%),radial-gradient(circle_at_90%_0%,rgba(67,140,255,0.12),transparent_30%)]" />
      <section className="mx-auto grid min-h-[82vh] w-full max-w-6xl content-center gap-y-14 px-4 py-14 md:gap-y-20 md:px-8">
        <div className="max-w-4xl animate-in fade-in-0 slide-in-from-bottom-3 space-y-6 duration-500 [animation-fill-mode:both]">
          <p className="inline-flex rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-primary">
            Simple Finance
          </p>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight md:text-6xl">
            Finance software that feels calm, fast, and clear.
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground md:text-xl">
            A modern command center for your spending, income, and portfolio, designed to keep you focused on decisions instead of clutter.
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

        <div className="grid animate-in gap-4 fade-in-0 slide-in-from-bottom-3 duration-500 [animation-delay:120ms] [animation-fill-mode:both] md:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} className="border-border/80 bg-card/85 shadow-sm backdrop-blur transition-transform duration-200 hover:-translate-y-1">
              <CardHeader className="pb-2">
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
                  <feature.icon className="h-4 w-4" />
                </div>
                <CardTitle className="text-xl tracking-tight">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">{feature.description}</CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
