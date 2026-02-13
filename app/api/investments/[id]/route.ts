import { z } from "zod";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";
import { absAmount } from "@/lib/finance";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const updateSchema = z.object({
  assetType: z.enum(["stock", "crypto", "real_estate", "etf", "bond", "mutual_fund", "cash", "other"]).optional(),
  name: z.string().trim().min(2).max(80).optional(),
  symbol: z.string().trim().max(12).nullable().optional(),
  amountInvested: z.coerce.number().positive().optional(),
  quantity: z.coerce.number().positive().optional(),
  currentValue: z.coerce.number().positive().optional(),
  purchasedOn: z.string().optional(),
  notes: z.string().trim().max(240).nullable().optional(),
});

export async function DELETE(_: Request, { params }: RouteContext) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const { id } = await params;
  const investmentId = Number(id);
  if (!Number.isFinite(investmentId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const deleted = await prisma.investment.deleteMany({
    where: { id: investmentId, userId },
  });

  if (deleted.count === 0) {
    return NextResponse.json({ error: "Investment not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}

export async function PUT(request: Request, { params }: RouteContext) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const { id } = await params;
  const investmentId = Number(id);
  if (!Number.isFinite(investmentId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const parsed = updateSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const body = parsed.data;
  const data: {
    assetType?: "stock" | "crypto" | "real_estate" | "etf" | "bond" | "mutual_fund" | "cash" | "other";
    name?: string;
    symbol?: string | null;
    amountInvested?: number;
    quantity?: number;
    currentValue?: number;
    purchasedOn?: Date;
    notes?: string | null;
  } = {};

  if (body.assetType) data.assetType = body.assetType;
  if (body.name) data.name = body.name;
  if (body.symbol !== undefined) data.symbol = body.symbol || null;
  if (body.amountInvested !== undefined) data.amountInvested = absAmount(body.amountInvested);
  if (body.quantity !== undefined) data.quantity = absAmount(body.quantity);
  if (body.currentValue !== undefined) data.currentValue = absAmount(body.currentValue);
  if (body.notes !== undefined) data.notes = body.notes;
  if (body.purchasedOn) {
    const date = new Date(body.purchasedOn);
    if (Number.isNaN(date.getTime())) {
      return NextResponse.json({ error: "Invalid date" }, { status: 400 });
    }
    data.purchasedOn = date;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const updated = await prisma.investment.updateMany({
    where: { id: investmentId, userId },
    data,
  });

  if (updated.count === 0) {
    return NextResponse.json({ error: "Investment not found" }, { status: 404 });
  }

  const investment = await prisma.investment.findFirst({
    where: { id: investmentId, userId },
  });

  return NextResponse.json({
    item: investment
      ? {
          id: investment.id,
          assetType: investment.assetType,
          name: investment.name,
          symbol: investment.symbol,
          amountInvested: absAmount(investment.amountInvested),
          quantity: absAmount(investment.quantity) || 1,
          currentValue: absAmount(investment.currentValue),
          purchasedOn: investment.purchasedOn,
          notes: investment.notes,
        }
      : null,
  });
}
