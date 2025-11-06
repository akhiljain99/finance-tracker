import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { redirect } from "next/navigation";
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

export async function POST(request: Request) {
    const { source, person, incomeType, amount,date } = await request.json();
    
    try {
        const newPost = await prisma.income.create({
            data: {
                source,
                person,
                incomeType,
                amount, 
                date
            },
        });
    return NextResponse.json(newPost, { status: 201 });
    } catch (error) {
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
    }
}

export async function GET() {
    try {
        const allUsers = await prisma.income.findMany();
        
    return NextResponse.json(allUsers, { status: 200 });
    } catch (error) {
    return NextResponse.json({ error: 'Failed to get all incomes' }, { status: 500 });
    }
}