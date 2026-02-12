import { Prisma } from "@prisma/client";
import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";
import { absAmount } from "@/lib/finance";

const transactionSchema = z.object({
  kind: z.enum(["income", "expense"]),
  categoryName: z.string().trim().min(2).max(60),
  amount: z.coerce.number().positive(),
  transactionDate: z.string().optional(),
  notes: z.string().trim().max(240).optional(),
});

function normalizeTransaction(item: {
  id: number;
  amount: unknown;
  transactionDate: Date;
  notes: string | null;
  category: { id: number; name: string; type: "income" | "expense" };
}) {
  return {
    id: item.id,
    kind: item.category.type,
    categoryId: item.category.id,
    categoryName: item.category.name,
    amount: absAmount(item.amount),
    transactionDate: item.transactionDate,
    notes: item.notes,
  };
}

export async function GET(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
    }

    const monthParam = req.nextUrl.searchParams.get("month");
    const yearParam = req.nextUrl.searchParams.get("year");
    const kindParam = req.nextUrl.searchParams.get("kind");
    const limitParam = Number(req.nextUrl.searchParams.get("limit") ?? 100);

    const where: Prisma.TransactionWhereInput = { userId };

    if (monthParam && monthParam !== "all") {
      const month = Number(monthParam);
      const year = Number(yearParam ?? new Date().getFullYear());
      if (month >= 1 && month <= 12 && Number.isFinite(year)) {
        where.transactionDate = {
          gte: new Date(year, month - 1, 1),
          lt: new Date(year, month, 1),
        };
      }
    }

    if (kindParam === "income" || kindParam === "expense") {
      where.category = { is: { type: kindParam } };
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        category: {
          select: { id: true, name: true, type: true },
        },
      },
      orderBy: { transactionDate: "desc" },
      take: Math.min(Math.max(limitParam, 1), 250),
    });

    return NextResponse.json({
      items: transactions.map(normalizeTransaction),
    });
  } catch (error) {
    console.error("GET /api/transaction failed:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2021" || error.code === "P2022") {
        return NextResponse.json(
          { error: "Database schema is out of date. Run Prisma migrations and try again." },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ error: "Failed to load transactions" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
    }

    const parsed = transactionSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const body = parsed.data;
    const transactionDate = body.transactionDate ? new Date(body.transactionDate) : new Date();
    if (Number.isNaN(transactionDate.getTime())) {
      return NextResponse.json({ error: "Invalid date" }, { status: 400 });
    }

    let category = await prisma.category.findFirst({
      where: {
        userId,
        name: body.categoryName,
        type: body.kind,
      },
      select: { id: true, name: true, type: true },
    });

    if (!category) {
      category = await prisma.category.create({
        data: {
          userId,
          name: body.categoryName,
          type: body.kind,
        },
        select: { id: true, name: true, type: true },
      });
    }

    const transaction = await prisma.transaction.create({
      data: {
        userId,
        categoryId: category.id,
        amount: absAmount(body.amount),
        transactionDate,
        notes: body.notes || null,
      },
      include: {
        category: {
          select: { id: true, name: true, type: true },
        },
      },
    });

    return NextResponse.json({ item: normalizeTransaction(transaction) }, { status: 201 });
  } catch (error) {
    console.error("POST /api/transaction failed:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2021" || error.code === "P2022") {
        return NextResponse.json(
          { error: "Database schema is out of date. Run Prisma migrations and try again." },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ error: "Failed to save transaction" }, { status: 500 });
  }
}
