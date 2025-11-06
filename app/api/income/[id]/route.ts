import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { redirect } from "next/navigation";

const prisma = new PrismaClient();

export async function DELETE(request: Request,
    { params }: { params: { id: string } }
  ) {
    const { id } = await params;
    try {
        const deletedIncome = await prisma.income.deleteMany(
            
            {where: { id: Number(id) }}, 
    
        );

        console.log(deletedIncome)
        
        return NextResponse.json(deletedIncome, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete income' }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
  ) {
    const { id } = await params;
    const body = await request.json();
  
    try {
      const updatedIncome = await prisma.income.update({
        where: { id: Number(id) }, // Ensure id type matches your schema
        data: {
            source: body.source,
            person: body.person,
            date: body.date,
            amount: body.amount,
            incomeType: body.incomeType
        },
      });
      return NextResponse.json(updatedIncome, { status: 200 });
    } catch (error) {
      return NextResponse.json({ error: 'Error updating income' }, { status: 500 });
    }
  }