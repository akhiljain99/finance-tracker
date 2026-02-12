import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";
import { absAmount } from "@/lib/finance";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function DELETE(_: Request, { params }: RouteContext) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const { id } = await params;
  const transactionId = Number(id);

  if (!Number.isFinite(transactionId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const deleted = await prisma.transaction.deleteMany({
    where: { id: transactionId, userId },
  });

  if (deleted.count === 0) {
    return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}

export async function PUT(request: Request, { params }: RouteContext) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const { id } = await params;
  const transactionId = Number(id);
  if (!Number.isFinite(transactionId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const existing = await prisma.transaction.findFirst({
    where: { id: transactionId, userId },
    include: {
      category: {
        select: { id: true, name: true, type: true },
      },
    },
  });

  if (!existing) {
    return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
  }

  const updateSchema = z.object({
    kind: z.enum(["income", "expense"]).optional(),
    categoryName: z.string().trim().min(2).max(60).optional(),
    amount: z.coerce.number().positive().optional(),
    transactionDate: z.string().optional(),
    notes: z.string().max(240).nullable().optional(),
  });

  const parsed = updateSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const body = parsed.data;
  const data: {
    categoryId?: number;
    amount?: number;
    transactionDate?: Date;
    notes?: string | null;
  } = {};

  if (body.amount !== undefined) {
    data.amount = absAmount(body.amount);
  }

  if (body.transactionDate) {
    const date = new Date(body.transactionDate);
    if (Number.isNaN(date.getTime())) {
      return NextResponse.json({ error: "Invalid date" }, { status: 400 });
    }
    data.transactionDate = date;
  }

  if (body.notes !== undefined) {
    data.notes = body.notes;
  }

  const nextKind = body.kind ?? existing.category.type;
  const nextCategoryName = body.categoryName ?? existing.category.name;

  if (nextKind !== existing.category.type || nextCategoryName !== existing.category.name) {
    const category = await prisma.category.upsert({
      where: {
        userId_name_type: {
          userId,
          name: nextCategoryName,
          type: nextKind,
        },
      },
      update: {},
      create: {
        userId,
        name: nextCategoryName,
        type: nextKind,
      },
      select: { id: true },
    });
    data.categoryId = category.id;
  }

  const updated = await prisma.transaction.update({
    where: { id: existing.id },
    data,
    include: {
      category: {
        select: { id: true, name: true, type: true },
      },
    },
  });

  return NextResponse.json({
    item: {
      id: updated.id,
      kind: updated.category.type,
      categoryId: updated.category.id,
      categoryName: updated.category.name,
      amount: absAmount(updated.amount),
      transactionDate: updated.transactionDate,
      notes: updated.notes,
    },
  });
}
