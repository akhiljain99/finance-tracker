import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("test1234", 10);

  const user = await prisma.user.upsert({
    where: { email: "test@demo.com" },
    update: {
      name: "Test User",
      passwordHash: password,
    },
    create: {
      name: "Test User",
      email: "test@demo.com",
      passwordHash: password,
    },
  });

  const categories = [
    { name: "Salary", type: "income" as const },
    { name: "Freelance", type: "income" as const },
    { name: "Food", type: "expense" as const },
    { name: "Rent", type: "expense" as const },
    { name: "Subscriptions", type: "expense" as const },
    { name: "Transport", type: "expense" as const },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: {
        userId_name_type: {
          userId: user.id,
          name: category.name,
          type: category.type,
        },
      },
      update: {},
      create: {
        userId: user.id,
        name: category.name,
        type: category.type,
      },
    });
  }

  const salary = await prisma.category.findFirstOrThrow({
    where: { userId: user.id, name: "Salary", type: "income" },
  });
  const freelance = await prisma.category.findFirstOrThrow({
    where: { userId: user.id, name: "Freelance", type: "income" },
  });
  const food = await prisma.category.findFirstOrThrow({
    where: { userId: user.id, name: "Food", type: "expense" },
  });
  const rent = await prisma.category.findFirstOrThrow({
    where: { userId: user.id, name: "Rent", type: "expense" },
  });
  const transport = await prisma.category.findFirstOrThrow({
    where: { userId: user.id, name: "Transport", type: "expense" },
  });

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  await prisma.transaction.deleteMany({ where: { userId: user.id } });
  await prisma.investment.deleteMany({ where: { userId: user.id } });

  await prisma.transaction.createMany({
    data: [
      {
        userId: user.id,
        categoryId: salary.id,
        amount: 5400,
        transactionDate: new Date(year, month, 1),
        notes: "Monthly salary",
      },
      {
        userId: user.id,
        categoryId: freelance.id,
        amount: 1200,
        transactionDate: new Date(year, month, 8),
        notes: "Freelance project payout",
      },
      {
        userId: user.id,
        categoryId: food.id,
        amount: 42.8,
        transactionDate: new Date(year, month, 3),
        notes: "Groceries",
      },
      {
        userId: user.id,
        categoryId: rent.id,
        amount: 1650,
        transactionDate: new Date(year, month, 2),
        notes: "Rent",
      },
      {
        userId: user.id,
        categoryId: transport.id,
        amount: 64.1,
        transactionDate: new Date(year, month, 9),
        notes: "Fuel and parking",
      },
    ],
  });

  await prisma.investment.createMany({
    data: [
      {
        userId: user.id,
        assetType: "stock",
        name: "Apple Inc.",
        symbol: "AAPL",
        amountInvested: 3000,
        currentValue: 3460,
        purchasedOn: new Date(year, month - 2, 10),
        notes: "Long-term hold",
      },
      {
        userId: user.id,
        assetType: "crypto",
        name: "Bitcoin",
        symbol: "BTC",
        amountInvested: 1800,
        currentValue: 2100,
        purchasedOn: new Date(year, month - 1, 20),
      },
      {
        userId: user.id,
        assetType: "real_estate",
        name: "REIT Fund",
        amountInvested: 2500,
        currentValue: 2625,
        purchasedOn: new Date(year, month - 3, 15),
      },
    ],
  });

  console.log("Seed complete");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
