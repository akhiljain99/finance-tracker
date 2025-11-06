import { useState } from "react";
import { columns, IncomeColumns } from "./columns"
import { toast } from "sonner"

const handleDelete = async (id: number) => {
    // 1. (Optional) Show a confirmation dialog
    if (!window.confirm("Are you sure you want to delete this item?")) {
      return;
    }

    console.log(id)
    const response = await fetch('/api/income', {
      method: 'DELETE',
      body: JSON.stringify({ id})
    });

    
    if (!response.ok) {
      // Handle error
      return;
    }

    // 3. Update the local state to reflect the deletion
    setData((data) => data.filter((item) => item.id !== id));
    console.log(data)
  };

  const handleEdit = (id:string) => {

  }

  async function getIncomes(): Promise<IncomeColumns[]>{
    try {
      const response = await fetch('/api/income', {
        method: 'GET',
      });
      if(response.ok){
        const income = await response.json();
        return income
      }
      else{
        toast.error('Error getting incomes. Please try again.')
        return []
      }
    } catch (error) {
      console.error('Error getting incomes:', error);
      return []
    }
  }