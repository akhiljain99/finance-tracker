import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(request: Request) {
    const { name, email, password } = await request.json();
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        const newPost = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        });
        
    return NextResponse.json(newPost, { status: 201 });
    } catch (error) {
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }
}