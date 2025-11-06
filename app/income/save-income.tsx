"use client"

import * as React from "react"
import { useState } from 'react';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { ChevronDownIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { useRouter } from 'next/navigation';
import { IncomeColumns } from "./columns"

  
export default function SaveIncome(){
    const router = useRouter();
    const [open, setOpen] = React.useState(false)
    const [date, setDate] = React.useState<Date | undefined>(undefined)
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [source, setSource] = useState('');
    const [person, setPerson] = useState('');
    const [incomeType, setIncomeType] = useState('');
    const [amount, setAmount] = useState(0);    

    async function handleSubmit () {
        try {
            console.log(typeof date)
            const isoString = "2025-10-31T05:00:00.000Z";
            const dateObject = new Date(isoString);
          const response = await fetch('/api/income', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ source, person, incomeType, amount, date}), 
          });
          if (response.ok) {
            setIsDialogOpen(false)
            toast.success('Income saved successfully!')
            setSource('');
            setPerson('');
            setDate(undefined)  
            setIncomeType('')
            setAmount(0)
            window.location.reload()
            
          } else {
            alert('Failed to save income');
          }
        } catch (error) {
          console.error('Error submitting form:', error);
        }
    };
    return (
        <div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <form>
                    <DialogTrigger asChild>
                        <Button
                            className="px-4 py-4 cursor-pointer"
                            variant="outline"
                            size="sm"
                        >
                            Add Income
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Add Income</DialogTitle>
                            <DialogDescription>
                                Add your income here. Click save when you are done. 
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4">
                            <div className="grid gap-3">
                                <Label htmlFor="name-1">Source</Label>
                                <Input id="source-1" name="source" onChange={(e) => setSource(e.target.value)} placeholder="Company LLC" />
                            </div>
                            <div className="grid gap-3">
                                <Label htmlFor="username-1">Income Type</Label>
                                <Input id="income-1" name="incomeType" onChange={(e)=> setIncomeType(e.target.value)} placeholder="Monthly - Bi Weekly" />
                            </div>
                            <div className="grid gap-3">
                                <Label htmlFor="name-1">Amount</Label>
                                <Input id="amount-1" name="amount" onChange={(e) => setAmount(Number(e.target.value))} placeholder="2400" />
                            </div>
                            <div className="grid gap-3">
                                <Label htmlFor="username-1">Person</Label>
                                <Input id="person-1" name="person" onChange={(e) => setPerson(e.target.value)} placeholder="@peduarte" />
                            </div>
                            <div className="grid gap-3">
                                <Label htmlFor="date" className="px-1">
                                    Date
                                </Label>
                                <Popover open={open} onOpenChange={setOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            id="date"
                                            className="w-48 justify-between font-normal"
                                        >
                                            {date ? date.toLocaleDateString() : "Select date"}
                                            <ChevronDownIcon />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={date}
                                            captionLayout="dropdown"
                                            onSelect={(date) => {
                                            setDate(date)
                                            setOpen(false)
                                            }}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button onClick={handleSubmit} type="submit">Save Income</Button>
                        </DialogFooter>
                    </DialogContent>
                </form>
            </Dialog>
            
        </div>
    )
}