import { Prisma } from "@prisma/client";
import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";
import { absAmount } from "@/lib/finance";

const investmentSchema = z.object({
  assetType: z.enum(["stock", "crypto", "real_estate", "etf", "bond", "mutual_fund", "cash", "other"]),
  name: z.string().trim().min(2).max(80),
  symbol: z.string().trim().max(12).optional(),
  amountInvested: z.coerce.number().positive(),
  currentValue: z.coerce.number().positive(),
  purchasedOn: z.string(),
  notes: z.string().trim().max(240).optional(),
});

function normalizeInvestment(item: {
  id: number;
  assetType: string;
  name: string;
  symbol: string | null;
  amountInvested: unknown;
  currentValue: unknown;
  purchasedOn: Date;
  notes: string | null;
}) {
  return {
    id: item.id,
    assetType: item.assetType,
    name: item.name,
    symbol: item.symbol,
    amountInvested: absAmount(item.amountInvested),
    currentValue: absAmount(item.currentValue),
    purchasedOn: item.purchasedOn,
    notes: item.notes,
  };
}

export async function GET(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
    }

    const limit = Number(req.nextUrl.searchParams.get("limit") ?? 100);

    const items = await prisma.investment.findMany({
      where: { userId },
      orderBy: { purchasedOn: "desc" },
      take: Math.min(Math.max(limit, 1), 250),
    });

    return NextResponse.json({ items: items.map(normalizeInvestment) });
  } catch (error) {
    console.error("GET /api/investments failed:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2021" || error.code === "P2022") {
        // If investments table/columns are not yet migrated, treat as empty state.
        return NextResponse.json({ items: [] });
      }
    }

    return NextResponse.json({ error: "Failed to load investments" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
    }

    const parsed = investmentSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const body = parsed.data;
    const purchasedOn = new Date(body.purchasedOn);
    if (Number.isNaN(purchasedOn.getTime())) {
      return NextResponse.json({ error: "Invalid date" }, { status: 400 });
    }

    const investment = await prisma.investment.create({
      data: {
        userId,
        assetType: body.assetType,
        name: body.name,
        symbol: body.symbol || null,
        amountInvested: absAmount(body.amountInvested),
        currentValue: absAmount(body.currentValue),
        purchasedOn,
        notes: body.notes || null,
      },
    });

    return NextResponse.json({ item: normalizeInvestment(investment) }, { status: 201 });
  } catch (error) {
    console.error("POST /api/investments failed:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2021" || error.code === "P2022") {
        return NextResponse.json(
          { error: "Database schema is out of date. Run Prisma migrations and try again." },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ error: "Failed to save investment" }, { status: 500 });
  }
}
