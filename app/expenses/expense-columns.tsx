
import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"
import { ArrowUpDown } from "lucide-react"


import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type ExpenseColumns = {
  id: number
  date: string,
  person: string
  amount: number
  category: string
}
import {Income} from '@prisma/client'

interface ColumnsProps {
    onDelete: (id: string) => void;
    onEdit: (income: ExpenseColumns) => void;
}

export const columns = ({ onDelete, onEdit }: ColumnsProps): ColumnDef<ExpenseColumns>[] => [
  {
    accessorKey: "incomeType",
    header: ({ column }) => {
        return (
          <Button
            className="font-bold"
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Income Type
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
    },
    cell: ({row}) => {
        return <div className="text-center font-medium">{row.getValue("incomeType")}</div>
    }
  },
  {
    accessorKey: "person",
    header: ({ column }) => {
        return (
          <Button
            className="font-bold"
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Person
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
    },
    cell: ({row}) => {
        return <div className="text-center font-medium">{row.getValue("person")}</div>
    },
    size: 50,
  },
  {
    accessorKey: "source",
    header: ({ column }) => {
        return (
          <Button
            className="font-bold"
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Source
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
    },
    cell: ({row}) => {
        return <div className="text-center font-medium">{row.getValue("source")}</div>
    },
  },
  {
    accessorKey: "amount",
    header: ({ column }) => {
        return (
          <Button
            className="font-bold"
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Amount
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
    },
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"))
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount)
 
      return <div className="text-center font-medium">{formatted}</div>
    },
  },
  {
    accessorKey: "date",
    header: ({ column }) => {
        return (
          <Button
            className="font-bold"
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
    },
    cell: ({ row }) => {
      const amount:string = row.getValue("date")
 
      return <div className="text-center font-medium">{amount}</div>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const income = row.original
 
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(String(income.id))}
            >
              Copy income ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={()=> onEdit(income)}>Edit</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(String(income.id))}>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]