import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";
import { absAmount, monthKey, monthLabel } from "@/lib/finance";

type MonthBucket = {
  key: string;
  label: string;
  income: number;
  expense: number;
  invested: number;
};

export async function GET(req: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const months = Math.min(Math.max(Number(req.nextUrl.searchParams.get("months") ?? 6), 1), 24);
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);

  const [transactions, investments] = await Promise.all([
    prisma.transaction.findMany({
      where: {
        userId,
        transactionDate: { gte: from },
      },
      include: {
        category: {
          select: { name: true, type: true },
        },
      },
      orderBy: { transactionDate: "desc" },
    }),
    prisma.investment.findMany({
      where: { userId },
      orderBy: { purchasedOn: "desc" },
    }),
  ]);

  const seriesMap = new Map<string, MonthBucket>();
  for (let i = months - 1; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = monthKey(date);
    seriesMap.set(key, {
      key,
      label: monthLabel(key),
      income: 0,
      expense: 0,
      invested: 0,
    });
  }

  const categoryExpenseMap = new Map<string, number>();

  for (const transaction of transactions) {
    const key = monthKey(transaction.transactionDate);
    const bucket = seriesMap.get(key);
    const amount = absAmount(transaction.amount);
    if (!bucket) continue;

    if (transaction.category.type === "income") {
      bucket.income += amount;
    } else {
      bucket.expense += amount;
      categoryExpenseMap.set(
        transaction.category.name,
        (categoryExpenseMap.get(transaction.category.name) ?? 0) + amount
      );
    }
  }

  for (const investment of investments) {
    const key = monthKey(investment.purchasedOn);
    const bucket = seriesMap.get(key);
    if (!bucket) continue;
    bucket.invested += absAmount(investment.amountInvested);
  }

  const currentKey = monthKey(now);
  const currentMonth = seriesMap.get(currentKey) ?? {
    key: currentKey,
    label: monthLabel(currentKey),
    income: 0,
    expense: 0,
    invested: 0,
  };

  const totalPortfolioValue = investments.reduce((acc, item) => acc + absAmount(item.currentValue), 0);
  const totalInvestedCapital = investments.reduce((acc, item) => acc + absAmount(item.amountInvested), 0);
  const monthlySeries = Array.from(seriesMap.values());
  const categorySpend = Array.from(categoryExpenseMap.entries())
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 6);

  const investmentMixMap = new Map<string, number>();
  for (const investment of investments) {
    investmentMixMap.set(
      investment.assetType,
      (investmentMixMap.get(investment.assetType) ?? 0) + absAmount(investment.currentValue)
    );
  }

  const investmentMix = Array.from(investmentMixMap.entries())
    .map(([assetType, total]) => ({ assetType, total }))
    .sort((a, b) => b.total - a.total);

  return NextResponse.json({
    summary: {
      month: currentMonth.label,
      income: currentMonth.income,
      expense: currentMonth.expense,
      savings: currentMonth.income - currentMonth.expense,
      investedThisMonth: currentMonth.invested,
      portfolioValue: totalPortfolioValue,
      portfolioGain: totalPortfolioValue - totalInvestedCapital,
    },
    monthlySeries,
    categorySpend,
    investmentMix,
    recentTransactions: transactions.slice(0, 8).map((item) => ({
      id: item.id,
      kind: item.category.type,
      amount: absAmount(item.amount),
      categoryName: item.category.name,
      transactionDate: item.transactionDate,
      notes: item.notes,
    })),
  });
}
