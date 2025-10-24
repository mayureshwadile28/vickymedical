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
import { PlusCircle, FilePenLine, Trash2, Pill, Inbox } from 'lucide-react';
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
  const [price, setPrice] = useState(medicine?.price?.toString() || '');
  const [quantity, setQuantity] = useState(medicine?.quantity?.toString() || '');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const priceValue = parseFloat(price);
    const quantityValue = parseInt(quantity, 10);

    if (!name || !location || isNaN(priceValue) || priceValue <= 0 || isNaN(quantityValue) || quantityValue < 0) {
      toast({
        title: 'Invalid Input',
        description: 'Please fill all fields with valid data.',
        variant: 'destructive',
      });
      return;
    }
    onSubmit({ name, location, price: priceValue, quantity: quantityValue });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="name" className="text-right">Name</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" placeholder="e.g. Paracetamol 500mg"/>
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="location" className="text-right">Location</Label>
        <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} className="col-span-3" placeholder="e.g. Rack A-12"/>
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="price" className="text-right">Price (₹) / strip</Label>
        <Input id="price" type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} className="col-span-3" placeholder="Price for 10 tablets"/>
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="quantity" className="text-right">Quantity</Label>
        <Input id="quantity" type="number" min="0" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="col-span-3" placeholder="Number of strips"/>
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
      toast({ title: 'Success', description: 'Medicine updated successfully.', className: 'bg-green-500 text-white' });
    } else {
      addMedicine(data);
      toast({ title: 'Success', description: 'Medicine added successfully.', className: 'bg-green-500 text-white' });
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
        <CardTitle className="flex items-center gap-2">
            <Pill className="h-6 w-6"/>
            Medicine Inventory
        </CardTitle>
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

        <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Location</TableHead>
              <TableHead className="text-right">Price / strip</TableHead>
              <TableHead className="text-right">Strips (Qty)</TableHead>
              <TableHead className="text-right w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {medicines.length > 0 ? medicines.map(med => (
              <TableRow key={med.id}>
                <TableCell className="font-medium">{med.name}</TableCell>
                <TableCell>{med.location}</TableCell>
                <TableCell className="text-right">₹{med.price.toFixed(2)}</TableCell>
                <TableCell className={`text-right font-semibold ${med.quantity < 10 ? 'text-destructive' : ''}`}>{med.quantity}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(med)} className="h-8 w-8">
                      <FilePenLine className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive h-8 w-8">
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
                  </div>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-48 text-muted-foreground">
                   <div className="flex flex-col items-center justify-center gap-2">
                    <Inbox className="h-10 w-10" />
                    <span className="font-medium">No medicines in inventory.</span>
                    <Button size="sm" onClick={openAddDialog}>Add Your First Medicine</Button>
                   </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        </div>
      </CardContent>
    </Card>
  );
}
