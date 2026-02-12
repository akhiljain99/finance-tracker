"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Pie, PieChart, XAxis, YAxis } from "recharts";
import { ArrowDownRight, ArrowUpRight, PiggyBank, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { currency } from "@/lib/finance";

type DashboardResponse = {
  summary: {
    month: string;
    income: number;
    expense: number;
    savings: number;
    investedThisMonth: number;
    portfolioValue: number;
    portfolioGain: number;
  };
  monthlySeries: Array<{
    key: string;
    label: string;
    income: number;
    expense: number;
    invested: number;
  }>;
  categorySpend: Array<{ category: string; total: number }>;
  investmentMix: Array<{ assetType: string; total: number }>;
};

const compareConfig = {
  income: { label: "Income", color: "var(--chart-2)" },
  expense: { label: "Expense", color: "var(--chart-1)" },
} satisfies ChartConfig;

const mixConfig = {
  total: { label: "Value", color: "var(--chart-3)" },
} satisfies ChartConfig;

type DashboardClientProps = {
  name: string;
};

export function DashboardClient({ name }: DashboardClientProps) {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const run = async () => {
      try {
        setLoading(true);
        setErrorMessage(null);

        const res = await fetch("/api/dashboard/overview?months=6");
        if (!res.ok) {
          let message = "Could not load your dashboard right now.";
          if (res.status === 401) {
            message = "Your session expired. Please sign in again.";
          }
          if (active) {
            setData(null);
            setErrorMessage(message);
          }
          return;
        }

        const payload = (await res.json()) as DashboardResponse;
        if (active) {
          setData(payload);
        }
      } catch (error) {
        if (active) {
          setData(null);
          setErrorMessage("Could not load your dashboard right now.");
        }
        console.error("Failed to load dashboard overview:", error);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void run();

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return <div className="mx-auto w-full max-w-6xl px-4 py-12 md:px-8">Loading dashboard...</div>;
  }

  if (errorMessage) {
    return (
      <div className="relative mx-auto w-full max-w-6xl px-4 py-8 md:px-8">
        <section className="mb-8 space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Welcome back, {name}</h1>
          <p className="text-muted-foreground">{errorMessage}</p>
        </section>
        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle>Dashboard unavailable</CardTitle>
            <CardDescription>Try refreshing, then check your tracker page.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/transaction">
              <Button>Open tracker</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="relative mx-auto w-full max-w-6xl px-4 py-8 md:px-8">
        <section className="mb-8 space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Welcome back, {name}</h1>
          <p className="text-muted-foreground">No dashboard data yet.</p>
        </section>
      </div>
    );
  }

  const hasTransactions = data.monthlySeries.some(
    (month) => month.income > 0 || month.expense > 0 || month.invested > 0
  );
  const hasPortfolio = data.summary.portfolioValue > 0 || data.summary.portfolioGain !== 0;
  const hasBreakdown = data.categorySpend.length > 0 || data.investmentMix.length > 0;
  const hasDashboardData = hasTransactions || hasPortfolio || hasBreakdown;

  if (!hasDashboardData) {
    return (
      <div className="relative mx-auto w-full max-w-6xl px-4 py-8 md:px-8">
        <section className="mb-8 space-y-2">
          <p className="text-sm uppercase tracking-[0.16em] text-muted-foreground">{data.summary.month}</p>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Welcome back, {name}</h1>
          <p className="text-muted-foreground">No transactions or investments yet.</p>
        </section>
        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle>Your dashboard is ready</CardTitle>
            <CardDescription>
              Add your first transaction or investment and your charts will appear here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/transaction">
              <Button>Go to tracker</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const positiveSavings = data.summary.savings >= 0;

  return (
    <div className="relative mx-auto w-full max-w-6xl px-4 py-8 md:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_10%_0%,rgba(56,189,248,0.16),transparent_22%),radial-gradient(circle_at_85%_0%,rgba(34,197,94,0.12),transparent_18%)]" />

      <section className="mb-8 space-y-2">
        <p className="text-sm uppercase tracking-[0.16em] text-muted-foreground">{data.summary.month}</p>
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Welcome back, {name}</h1>
        <p className="text-muted-foreground">Your financial control room for spending, income, and investments.</p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border-border/70 bg-card/90">
          <CardHeader className="pb-2">
            <CardDescription>Income this month</CardDescription>
            <CardTitle className="text-2xl">{currency.format(data.summary.income)}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-xs text-emerald-600">
            <ArrowUpRight className="h-4 w-4" />
            Money in
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/90">
          <CardHeader className="pb-2">
            <CardDescription>Spending this month</CardDescription>
            <CardTitle className="text-2xl">{currency.format(data.summary.expense)}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-xs text-rose-600">
            <ArrowDownRight className="h-4 w-4" />
            Money out
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/90">
          <CardHeader className="pb-2">
            <CardDescription>Monthly savings</CardDescription>
            <CardTitle className={`text-2xl ${positiveSavings ? "text-emerald-600" : "text-rose-600"}`}>
              {currency.format(data.summary.savings)}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-xs text-muted-foreground">
            <Wallet className="h-4 w-4" />
            Income minus spending
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/90">
          <CardHeader className="pb-2">
            <CardDescription>Portfolio value</CardDescription>
            <CardTitle className="text-2xl">{currency.format(data.summary.portfolioValue)}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-xs text-muted-foreground">
            <PiggyBank className="h-4 w-4" />
            Gain: {currency.format(data.summary.portfolioGain)}
          </CardContent>
        </Card>
      </section>

      <section className="mt-6 grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Monthly income vs spending</CardTitle>
            <CardDescription>Compare trends over the last six months.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={compareConfig} className="h-[320px] w-full">
              <BarChart data={data.monthlySeries} barGap={8}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="income" fill="var(--color-income)" radius={6} />
                <Bar dataKey="expense" fill="var(--color-expense)" radius={6} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Investment mix</CardTitle>
            <CardDescription>Current portfolio allocation by asset class.</CardDescription>
          </CardHeader>
          <CardContent>
            {data.investmentMix.length === 0 ? (
              <p className="text-sm text-muted-foreground">No investments yet.</p>
            ) : (
              <ChartContainer config={mixConfig} className="h-[320px] w-full">
                <PieChart>
                  <Pie
                    data={data.investmentMix}
                    dataKey="total"
                    nameKey="assetType"
                    outerRadius={100}
                    fill="var(--color-total)"
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Top spending categories</CardTitle>
            <CardDescription>Where your money goes this cycle.</CardDescription>
          </CardHeader>
          <CardContent>
            {data.categorySpend.length === 0 ? (
              <p className="text-sm text-muted-foreground">No expenses in this period.</p>
            ) : (
              <ChartContainer config={{ total: { label: "Amount", color: "var(--chart-5)" } }} className="h-[280px] w-full">
                <BarChart data={data.categorySpend}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="category" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value) => currency.format(Number(value))}
                      />
                    }
                  />
                  <Bar dataKey="total" fill="var(--color-total)" radius={8} />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
