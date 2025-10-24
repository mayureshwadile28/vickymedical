'use client';

import { useState } from 'react';
import type { Medicine } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, FilePenLine, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface InventoryTabProps {
  medicines: Medicine[];
  addMedicine: (medicine: Omit<Medicine, 'id'>) => void;
  updateMedicine: (medicine: Medicine) => void;
  deleteMedicine: (id: string) => void;
}

const MedicineForm = ({
  medicine,
  onSubmit,
  onClose,
}: {
  medicine?: Medicine | null;
  onSubmit: (data: Omit<Medicine, 'id'>) => void;
  onClose: () => void;
}) => {
  const [name, setName] = useState(medicine?.name || '');
  const [location, setLocation] = useState(medicine?.location || '');
  const [price, setPrice] = useState(medicine?.price || 0);
  const [quantity, setQuantity] = useState(medicine?.quantity || 0);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !location || price <= 0 || quantity < 0) {
      toast({
        title: 'Invalid Input',
        description: 'Please fill all fields with valid data.',
        variant: 'destructive',
      });
      return;
    }
    onSubmit({ name, location, price, quantity });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="name" className="text-right">Name</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="location" className="text-right">Location</Label>
        <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} className="col-span-3" />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="price" className="text-right">Price</Label>
        <Input id="price" type="number" step="0.01" value={price} onChange={(e) => setPrice(parseFloat(e.target.value))} className="col-span-3" />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="quantity" className="text-right">Quantity</Label>
        <Input id="quantity" type="number" min="0" value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value, 10))} className="col-span-3" />
      </div>
      <DialogFooter>
        <DialogClose asChild>
            <Button type="button" variant="outline">Cancel</Button>
        </DialogClose>
        <Button type="submit">Save changes</Button>
      </DialogFooter>
    </form>
  );
};


export default function InventoryTab({
  medicines,
  addMedicine,
  updateMedicine,
  deleteMedicine,
}: InventoryTabProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const { toast } = useToast();

  const handleFormSubmit = (data: Omit<Medicine, 'id'>) => {
    if (editingMedicine) {
      updateMedicine({ ...editingMedicine, ...data });
      toast({ title: 'Success', description: 'Medicine updated successfully.' });
    } else {
      addMedicine(data);
      toast({ title: 'Success', description: 'Medicine added successfully.' });
    }
  };

  const openAddDialog = () => {
    setEditingMedicine(null);
    setDialogOpen(true);
  };

  const openEditDialog = (medicine: Medicine) => {
    setEditingMedicine(medicine);
    setDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Medicine Inventory</CardTitle>
        <Button onClick={openAddDialog}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Medicine
        </Button>
      </CardHeader>
      <CardContent>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingMedicine ? 'Edit Medicine' : 'Add New Medicine'}</DialogTitle>
              <DialogDescription>
                {editingMedicine ? 'Update the details of the medicine.' : 'Add a new medicine to your inventory.'}
              </DialogDescription>
            </DialogHeader>
            <MedicineForm 
              medicine={editingMedicine} 
              onSubmit={handleFormSubmit}
              onClose={() => setDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Location</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {medicines.length > 0 ? medicines.map(med => (
              <TableRow key={med.id}>
                <TableCell className="font-medium">{med.name}</TableCell>
                <TableCell>{med.location}</TableCell>
                <TableCell className="text-right">₹{med.price.toFixed(2)}</TableCell>
                <TableCell className="text-right">{med.quantity}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => openEditDialog(med)}>
                    <FilePenLine className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the medicine
                          from your inventory.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteMedicine(med.id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24">
                  No medicines in inventory.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
