// components/edit-item-dialog.tsx
"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { IncomeColumns } from './columns';

// Define a generic type for your data, e.g., 'User' or 'Product'
interface EditDialogProps<T> {
  isOpen: boolean;
  onClose: () => void;
  data: IncomeColumns | null;
  onSave: (updatedData: T) => void;
}

export function EditIncome({ isOpen, onClose, data, onSave }: EditDialogProps<IncomeColumns>) {
  const [formData, setFormData] = useState<IncomeColumns| null>(data);

  useEffect(() => {
    setFormData(data);
  }, [data, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => prev ? ({ ...prev, [name]: value }) : null);
  };

  const handleSave = () => {
    if (formData) {
      onSave(formData);
    }
  };

  if (!formData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Income</DialogTitle>
          <DialogDescription>
            Edit your income here. Click save when you are done. 
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* Dynamically render form fields based on your data structure */}
          {Object.keys(formData).map((key) => {
            // Basic example: only show editable fields
            if (key === 'id' || key === 'userId') return null; 

            return (
              <div key={key} className="grid gap-3">
                <Label htmlFor={key} className="text-right">
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </Label>
                <Input
                  id={key}
                  name={key}
                  value={String(formData[key as keyof IncomeColumns] || '')}
                  onChange={handleChange}
                />
              </div>
            );
          })}
        </div>
        <DialogFooter>
          <Button onClick={handleSave}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}