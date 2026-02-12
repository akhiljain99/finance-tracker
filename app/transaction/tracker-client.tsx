"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { currency } from "@/lib/finance";
import { DataTable } from "./data-table";

type TransactionItem = {
  id: number;
  kind: "income" | "expense";
  categoryName: string;
  amount: number;
  transactionDate: string;
  notes?: string | null;
};

type InvestmentItem = {
  id: number;
  assetType: string;
  name: string;
  symbol?: string | null;
  amountInvested: number;
  currentValue: number;
  purchasedOn: string;
  notes?: string | null;
};

const assetTypes = [
  "stock",
  "crypto",
  "real_estate",
  "etf",
  "bond",
  "mutual_fund",
  "cash",
  "other",
];

async function readJsonSafe<T>(response: Response): Promise<T | null> {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return null;
  }

  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export function TrackerClient() {
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [investments, setInvestments] = useState<InvestmentItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [kind, setKind] = useState<"income" | "expense">("expense");
  const [categoryName, setCategoryName] = useState("");
  const [amount, setAmount] = useState("");
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");

  const [assetType, setAssetType] = useState("stock");
  const [investmentName, setInvestmentName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [amountInvested, setAmountInvested] = useState("");
  const [currentValue, setCurrentValue] = useState("");
  const [purchasedOn, setPurchasedOn] = useState(new Date().toISOString().slice(0, 10));
  const [investmentNotes, setInvestmentNotes] = useState("");

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [txResult, invResult] = await Promise.allSettled([
        fetch("/api/transaction?month=all&limit=100"),
        fetch("/api/investments?limit=100"),
      ]);

      const failures: string[] = [];

      if (txResult.status === "fulfilled") {
        const txRes = txResult.value;
        const txPayload = await readJsonSafe<{ items?: TransactionItem[]; error?: string }>(txRes);
        if (txRes.ok && txPayload?.items) {
          setTransactions(txPayload.items);
        } else {
          failures.push(txPayload?.error ?? "transactions");
        }
      } else {
        failures.push("transactions");
      }

      if (invResult.status === "fulfilled") {
        const invRes = invResult.value;
        const invPayload = await readJsonSafe<{ items?: InvestmentItem[]; error?: string }>(invRes);
        if (invRes.ok && invPayload?.items) {
          setInvestments(invPayload.items);
        } else {
          failures.push(invPayload?.error ?? "investments");
        }
      } else {
        failures.push("investments");
      }

      if (failures.length > 0) {
        toast.error(failures[0] === "transactions" || failures[0] === "investments"
          ? `Could not load ${failures.join(" and ")}.`
          : failures[0]);
      }
    } catch (error) {
      console.error("Failed to load tracker data:", error);
      toast.error("Could not load tracker data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchAll();
  }, [fetchAll]);

  async function submitTransaction(event: FormEvent) {
    event.preventDefault();
    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      toast.error("Enter a valid transaction amount.");
      return;
    }
    if (categoryName.trim().length < 2) {
      toast.error("Add a category name.");
      return;
    }

    const response = await fetch("/api/transaction", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind,
        categoryName: categoryName.trim(),
        amount: parsedAmount,
        transactionDate,
        notes: notes.trim() || undefined,
      }),
    });

    if (!response.ok) {
      const payload = await readJsonSafe<{ error?: string }>(response);
      toast.error(payload?.error ?? "Could not save transaction.");
      return;
    }

    toast.success("Transaction saved.");
    setCategoryName("");
    setAmount("");
    setNotes("");
    await fetchAll();
  }

  async function submitInvestment(event: FormEvent) {
    event.preventDefault();

    const invested = Number(amountInvested);
    const current = Number(currentValue);
    if (!Number.isFinite(invested) || invested <= 0 || !Number.isFinite(current) || current <= 0) {
      toast.error("Enter valid investment values.");
      return;
    }
    if (investmentName.trim().length < 2) {
      toast.error("Add an investment name.");
      return;
    }

    const response = await fetch("/api/investments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        assetType,
        name: investmentName.trim(),
        symbol: symbol.trim() || undefined,
        amountInvested: invested,
        currentValue: current,
        purchasedOn,
        notes: investmentNotes.trim() || undefined,
      }),
    });

    if (!response.ok) {
      const payload = await readJsonSafe<{ error?: string }>(response);
      toast.error(payload?.error ?? "Could not save investment.");
      return;
    }

    toast.success("Investment saved.");
    setInvestmentName("");
    setSymbol("");
    setAmountInvested("");
    setCurrentValue("");
    setInvestmentNotes("");
    await fetchAll();
  }

  const deleteTransaction = useCallback(async (id: number) => {
    const response = await fetch(`/api/transaction/${id}`, { method: "DELETE" });
    if (!response.ok) {
      toast.error("Could not delete transaction.");
      return;
    }
    setTransactions((current) => current.filter((item) => item.id !== id));
  }, []);

  const deleteInvestment = useCallback(async (id: number) => {
    const response = await fetch(`/api/investments/${id}`, { method: "DELETE" });
    if (!response.ok) {
      toast.error("Could not delete investment.");
      return;
    }
    setInvestments((current) => current.filter((item) => item.id !== id));
  }, []);

  const transactionColumns = useMemo<ColumnDef<TransactionItem>[]>(
    () => [
      {
        accessorKey: "transactionDate",
        header: "Date",
        cell: ({ row }) => (
          <span className="text-sm">{new Date(row.original.transactionDate).toLocaleDateString()}</span>
        ),
      },
      {
        accessorKey: "categoryName",
        header: "Category",
      },
      {
        accessorKey: "kind",
        header: "Type",
        cell: ({ row }) => (
          <span className={row.original.kind === "income" ? "text-emerald-600" : "text-rose-600"}>
            {row.original.kind}
          </span>
        ),
      },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => (
          <span className={row.original.kind === "income" ? "text-emerald-600" : "text-rose-600"}>
            {row.original.kind === "income" ? "+" : "-"}
            {currency.format(row.original.amount)}
          </span>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => deleteTransaction(row.original.id)}
            aria-label="Delete transaction"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        ),
      },
    ],
    [deleteTransaction]
  );

  const investmentColumns = useMemo<ColumnDef<InvestmentItem>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Investment",
        cell: ({ row }) => (
          <span>
            {row.original.name} {row.original.symbol ? `(${row.original.symbol})` : ""}
          </span>
        ),
      },
      {
        accessorKey: "assetType",
        header: "Asset",
        cell: ({ row }) => <span>{row.original.assetType.replace(/_/g, " ")}</span>,
      },
      {
        accessorKey: "amountInvested",
        header: "Invested",
        cell: ({ row }) => <span>{currency.format(row.original.amountInvested)}</span>,
      },
      {
        accessorKey: "currentValue",
        header: "Current value",
        cell: ({ row }) => <span>{currency.format(row.original.currentValue)}</span>,
      },
      {
        accessorKey: "purchasedOn",
        header: "Purchase date",
        cell: ({ row }) => <span>{new Date(row.original.purchasedOn).toLocaleDateString()}</span>,
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => deleteInvestment(row.original.id)}
            aria-label="Delete investment"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        ),
      },
    ],
    [deleteInvestment]
  );

  return (
    <div className="relative mx-auto w-full max-w-6xl px-4 py-8 md:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_5%_5%,rgba(14,165,233,0.1),transparent_25%),radial-gradient(circle_at_90%_10%,rgba(16,185,129,0.1),transparent_24%)]" />

      <section className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight">Finance Tracker</h1>
        <p className="text-muted-foreground">
          Add expenses, income, and investments. Everything updates your dashboard automatically.
        </p>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Add transaction</CardTitle>
            <CardDescription>Capture income and expenses in real time.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-3" onSubmit={submitTransaction}>
              <div className="grid gap-2">
                <Label htmlFor="kind">Type</Label>
                <select
                  id="kind"
                  value={kind}
                  onChange={(event) => setKind(event.target.value as "income" | "expense")}
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Input id="category" value={categoryName} onChange={(event) => setCategoryName(event.target.value)} placeholder="Food, Salary, Rent..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input id="amount" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0.00" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="date">Date</Label>
                  <Input id="date" type="date" value={transactionDate} onChange={(event) => setTransactionDate(event.target.value)} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="notes">Notes</Label>
                <Input id="notes" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Optional context" />
              </div>
              <Button type="submit" className="w-full">Save transaction</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Add investment</CardTitle>
            <CardDescription>Track stocks, crypto, real estate and more.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-3" onSubmit={submitInvestment}>
              <div className="grid gap-2">
                <Label htmlFor="asset">Asset class</Label>
                <select
                  id="asset"
                  value={assetType}
                  onChange={(event) => setAssetType(event.target.value)}
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  {assetTypes.map((type) => (
                    <option key={type} value={type}>
                      {type.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label htmlFor="investment-name">Name</Label>
                  <Input id="investment-name" value={investmentName} onChange={(event) => setInvestmentName(event.target.value)} placeholder="Bitcoin, Apple..." />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="symbol">Ticker</Label>
                  <Input id="symbol" value={symbol} onChange={(event) => setSymbol(event.target.value)} placeholder="BTC, AAPL..." />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label htmlFor="invested">Amount invested</Label>
                  <Input id="invested" value={amountInvested} onChange={(event) => setAmountInvested(event.target.value)} placeholder="0.00" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="current">Current value</Label>
                  <Input id="current" value={currentValue} onChange={(event) => setCurrentValue(event.target.value)} placeholder="0.00" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="purchased-on">Purchase date</Label>
                <Input id="purchased-on" type="date" value={purchasedOn} onChange={(event) => setPurchasedOn(event.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="investment-notes">Notes</Label>
                <Input id="investment-notes" value={investmentNotes} onChange={(event) => setInvestmentNotes(event.target.value)} placeholder="Optional context" />
              </div>
              <Button type="submit" className="w-full">Save investment</Button>
            </form>
          </CardContent>
        </Card>
      </section>

      <section className="mt-6 grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent transactions</CardTitle>
            <CardDescription>{loading ? "Loading..." : `${transactions.length} records`}</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={transactionColumns}
              data={transactions}
              filterColumn="categoryName"
              filterPlaceholder="Filter by category..."
              emptyMessage={loading ? "Loading transactions..." : "No transactions yet."}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Investments</CardTitle>
            <CardDescription>{loading ? "Loading..." : `${investments.length} records`}</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={investmentColumns}
              data={investments}
              filterColumn="name"
              filterPlaceholder="Filter investments..."
              emptyMessage={loading ? "Loading investments..." : "No investments yet."}
            />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
