import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { absAmount } from "@/lib/finance";
import { sendDailyDigestEmail } from "@/lib/email";

function isAuthorized(request: Request): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return false;

  const authHeader = request.headers.get("authorization");
  return authHeader === `Bearer ${cronSecret}`;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const digestDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const users = await prisma.user.findMany({
    where: { email: { not: null } },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  const results: Array<{ userId: number; status: "sent" | "skipped" | "failed" }> = [];

  for (const user of users) {
    if (!user.email) continue;

    const alreadySent = await prisma.emailDigestLog.findUnique({
      where: {
        userId_digestDate: {
          userId: user.id,
          digestDate,
        },
      },
    });

    if (alreadySent) {
      results.push({ userId: user.id, status: "skipped" });
      continue;
    }

    const [transactions, investments] = await Promise.all([
      prisma.transaction.findMany({
        where: {
          userId: user.id,
          transactionDate: {
            gte: startOfMonth,
            lt: nextMonth,
          },
        },
        include: {
          category: {
            select: { type: true },
          },
        },
      }),
      prisma.investment.findMany({
        where: {
          userId: user.id,
          purchasedOn: {
            gte: startOfMonth,
            lt: nextMonth,
          },
        },
      }),
    ]);

    const totalExpense = transactions
      .filter((item) => item.category.type === "expense")
      .reduce((acc, item) => acc + absAmount(item.amount), 0);
    const totalIncome = transactions
      .filter((item) => item.category.type === "income")
      .reduce((acc, item) => acc + absAmount(item.amount), 0);
    const totalInvested = investments.reduce((acc, item) => acc + absAmount(item.amountInvested), 0);

    const sent = await sendDailyDigestEmail({
      to: user.email,
      name: user.name ?? "there",
      monthLabel: now.toLocaleString("en-US", { month: "long", year: "numeric" }),
      totalExpense,
      totalIncome,
      totalInvested,
    });

    if (!sent) {
      results.push({ userId: user.id, status: "failed" });
      continue;
    }

    await prisma.emailDigestLog.create({
      data: {
        userId: user.id,
        digestDate,
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        totalExpense,
      },
    });

    results.push({ userId: user.id, status: "sent" });
  }

  return NextResponse.json({
    success: true,
    processed: results.length,
    results,
  });
}
