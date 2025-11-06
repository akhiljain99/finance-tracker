"use client"
import { useEffect, useState } from "react";
import { columns, IncomeColumns } from "./columns"
import { DataTable } from "./data-table"
import { toast } from "sonner"
import { Spinner } from "@/components/ui/spinner"
import {EditIncome} from './edit-income'

export default function Income() {
  
  const [data, setData] = useState<IncomeColumns[]>([]); 
  const [loading, setLoading] = useState(true)
  const [editingUser, setEditingUser] = useState<IncomeColumns | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/income', {
        method: 'GET',
      });
      if(response.ok){
        const income = await response.json();
        setData(income)
      }
      else{
        toast.error('Error getting incomes. Please try again.')
      }
    } catch (error) {
      console.error('Error getting incomes:', error);
    } finally{
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleEditClick = (income: IncomeColumns) => {
    setEditingUser(income);
    setIsEditDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsEditDialogOpen(false);
    setEditingUser(null);
  };
  const handleDelete = async (id: string) => {

    try{
      const response = await fetch(`/api/income/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete this user');
      }
      else{
        // 3. Update the local state to reflect the deletion
        setData((data) => data.filter((item) => item.id !== Number(id)));
        toast.success("Income deleted successfully!")
        fetchData()
        console.log(data)
      }
    }catch (err) {
    }
  };

  const handleEdit = async (income: IncomeColumns) => {
    try{
      const response = await fetch(`/api/income/${income.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(income),
      });
  
      
      if (response.ok) {
        // Refresh the data in the table after successful update
        fetchData(); 
        handleCloseDialog();
        toast.success("Income updated successfully!")
      } else {
        // Handle errors
        toast.error("Failed to update income")
      }
    }catch (err) {
    }
  }

  if (loading) return <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
                        <Spinner className="size-8" />
                      </div>
  return (
    <div className="container mx-auto my-auto pt-10">
      <div>This is another div</div>
      <DataTable columns={columns({onDelete:handleDelete, onEdit:handleEditClick})} data={data}/>
      <EditIncome
        isOpen={isEditDialogOpen}
        onClose={handleCloseDialog}
        data={editingUser}
        onSave={handleEdit}
      />
    </div>
  )
}