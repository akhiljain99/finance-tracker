import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import prisma from "@/lib/prisma";

const signUpSchema = z.object({
  name: z.string().trim().min(2).max(40),
  email: z.string().trim().email(),
  password: z.string().min(8).max(64),
});

export async function POST(request: Request) {
  const parsed = signUpSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { name, email, password } = parsed.data;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    await prisma.category.createMany({
      data: [
        { userId: user.id, name: "Salary", type: "income" },
        { userId: user.id, name: "Food", type: "expense" },
        { userId: user.id, name: "Housing", type: "expense" },
      ],
      skipDuplicates: true,
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "Email is already in use" }, { status: 409 });
    }

    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}
