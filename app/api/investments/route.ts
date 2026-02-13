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
  quantity: z.coerce.number().positive().optional(),
  currentUnitPrice: z.coerce.number().positive().optional(),
  currentValue: z.coerce.number().positive().optional(),
  purchasedOn: z.string(),
  notes: z.string().trim().max(240).optional(),
});

function normalizeInvestment(item: {
  id: number;
  assetType: string;
  name: string;
  symbol: string | null;
  amountInvested: unknown;
  quantity: unknown;
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
    quantity: absAmount(item.quantity) || 1,
    currentValue: absAmount(item.currentValue),
    purchasedOn: item.purchasedOn,
    notes: item.notes,
  };
}

function normalizeSymbol(value: string | undefined): string | null {
  const normalized = value?.trim().toUpperCase();
  return normalized && normalized.length > 0 ? normalized : null;
}

function resolveCurrentValue(input: {
  quantity: number;
  currentUnitPrice?: number;
  currentValue?: number;
  amountInvested: number;
}): number {
  const unitPrice = input.currentUnitPrice !== undefined
    ? absAmount(input.currentUnitPrice)
    : null;

  if (unitPrice && unitPrice > 0) {
    return unitPrice * input.quantity;
  }

  if (input.currentValue !== undefined) {
    return absAmount(input.currentValue);
  }

  return absAmount(input.amountInvested);
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
    const quantity = absAmount(body.quantity ?? 1);
    if (!Number.isFinite(quantity) || quantity <= 0) {
      return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
    }

    const normalizedSymbol = normalizeSymbol(body.symbol);
    const currentValue = resolveCurrentValue({
      quantity,
      currentUnitPrice: body.currentUnitPrice,
      currentValue: body.currentValue,
      amountInvested: body.amountInvested,
    });

    const investment = await prisma.investment.create({
      data: {
        userId,
        assetType: body.assetType,
        name: body.name,
        symbol: normalizedSymbol,
        amountInvested: absAmount(body.amountInvested),
        quantity,
        currentValue,
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
