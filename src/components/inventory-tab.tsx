'use client';

import { useState, useMemo } from 'react';
import type { Medicine, MedicineCategory } from '@/lib/types';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, FilePenLine, Trash2, Pill, Inbox, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const CATEGORIES: MedicineCategory[] = ['Tablet', 'Syrup', 'Veterinary', 'Injection', 'Other'];

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
  const [category, setCategory] = useState<MedicineCategory>(medicine?.category || 'Tablet');
  
  // State for Tablet category
  const [strips, setStrips] = useState(medicine?.strips?.toString() || '');
  const [looseTablets, setLooseTablets] = useState(medicine?.looseTablets?.toString() || '');
  const [tabletsPerStrip, setTabletsPerStrip] = useState(medicine?.tabletsPerStrip?.toString() || '10');

  // State for other categories
  const [quantity, setQuantity] = useState(medicine?.quantity?.toString() || '');

  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const priceValue = parseFloat(price);
    
    if (!name || !location || !category || isNaN(priceValue) || priceValue <= 0) {
      toast({ title: 'Invalid Input', description: 'Please fill all fields with valid data.', variant: 'destructive' });
      return;
    }

    let submissionData: Omit<Medicine, 'id'>;

    if (category === 'Tablet') {
      const stripsValue = parseInt(strips, 10);
      const looseTabletsValue = parseInt(looseTablets, 10) || 0;
      const tabletsPerStripValue = parseInt(tabletsPerStrip, 10);

      if (isNaN(stripsValue) || stripsValue < 0 || isNaN(tabletsPerStripValue) || tabletsPerStripValue <= 0) {
        toast({ title: 'Invalid Input for Tablets', description: 'Please provide valid numbers for strips and tablets per strip.', variant: 'destructive' });
        return;
      }
      submissionData = { name, location, price: priceValue, category, strips: stripsValue, looseTablets: looseTabletsValue, tabletsPerStrip: tabletsPerStripValue, quantity: 0 };

    } else {
      const quantityValue = parseInt(quantity, 10);
      if (isNaN(quantityValue) || quantityValue < 0) {
        toast({ title: 'Invalid Input', description: 'Please provide a valid quantity.', variant: 'destructive' });
        return;
      }
      submissionData = { name, location, price: priceValue, category, quantity: quantityValue };
    }
    
    onSubmit(submissionData);
  };
  
  const priceLabel = category === 'Tablet' ? `Price (₹) / strip of ${tabletsPerStrip}` : 'Price (₹) / unit';

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="category" className="text-right">Category</Label>
        <Select value={category} onValueChange={(value) => setCategory(value as MedicineCategory)}>
          <SelectTrigger className="col-span-3">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="name" className="text-right">Name</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" placeholder="e.g. Paracetamol 500mg"/>
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="location" className="text-right">Location</Label>
        <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} className="col-span-3" placeholder="e.g. Rack A-12"/>
      </div>

      {category === 'Tablet' ? (
        <>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="tabletsPerStrip" className="text-right">Tablets / Strip</Label>
            <Input id="tabletsPerStrip" type="number" min="1" value={tabletsPerStrip} onChange={(e) => setTabletsPerStrip(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="price" className="text-right">{priceLabel}</Label>
            <Input id="price" type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} className="col-span-3" placeholder={`Price for ${tabletsPerStrip} tablets`} />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="strips" className="text-right">Strips (Qty)</Label>
            <Input id="strips" type="number" min="0" value={strips} onChange={(e) => setStrips(e.target.value)} className="col-span-3" placeholder="Number of full strips"/>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="looseTablets" className="text-right">Loose Tablets</Label>
            <Input id="looseTablets" type="number" min="0" value={looseTablets} onChange={(e) => setLooseTablets(e.target.value)} className="col-span-3" placeholder="Number of loose tablets"/>
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="price" className="text-right">{priceLabel}</Label>
            <Input id="price" type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} className="col-span-3" placeholder="Price per unit"/>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="quantity" className="text-right">Units (Qty)</Label>
            <Input id="quantity" type="number" min="0" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="col-span-3" placeholder="Number of units"/>
          </div>
        </>
      )}

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
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<MedicineCategory | 'All'>('All');
  const { toast } = useToast();

  const handleFormSubmit = (data: Omit<Medicine, 'id'>) => {
    if (editingMedicine) {
      updateMedicine({ ...editingMedicine, ...data });
      toast({ title: 'Success', description: 'Medicine updated successfully.', className: 'bg-green-500 text-white' });
    } else {
      addMedicine(data);
      toast({ title: 'Success', description: 'Medicine added successfully.', className: 'bg-green-500 text-white' });
    }
    setDialogOpen(false);
  };

  const openAddDialog = () => {
    setEditingMedicine(null);
    setDialogOpen(true);
  };

  const openEditDialog = (medicine: Medicine) => {
    setEditingMedicine(medicine);
    setDialogOpen(true);
  };

  const filteredMedicines = useMemo(() => {
    return medicines
      .filter(med => activeCategory === 'All' || med.category === activeCategory)
      .filter(med => med.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [medicines, activeCategory, searchQuery]);
  
  const getStockDisplay = (med: Medicine) => {
    if (med.category === 'Tablet') {
      const strips = med.strips || 0;
      const loose = med.looseTablets || 0;
      return `${strips} strips, ${loose} tabs`;
    }
    const quantity = med.quantity || 0;
    return `${quantity} units`;
  }
  
  const getPriceDisplay = (med: Medicine) => {
     if (med.category === 'Tablet') {
        return `₹${med.price.toFixed(2)} / ${med.tabletsPerStrip || 10} tabs`;
     }
     return `₹${med.price.toFixed(2)} / unit`;
  }

  return (
    <Card>
      <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <CardTitle className="flex items-center gap-2">
            <Pill className="h-6 w-6"/>
            Medicine Inventory
        </CardTitle>
        <div className="flex items-center gap-2">
            <div className="relative w-full max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                    type="search"
                    placeholder="Search medicine..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            <Button onClick={openAddDialog}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Medicine
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-[480px]">
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
        
        <Tabs value={activeCategory} onValueChange={(val) => setActiveCategory(val as any)} className="mb-4">
            <TabsList>
                <TabsTrigger value="All">All</TabsTrigger>
                {CATEGORIES.map(cat => <TabsTrigger key={cat} value={cat}>{cat}</TabsTrigger>)}
            </TabsList>
        </Tabs>

        <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead className="text-right w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMedicines.length > 0 ? filteredMedicines.map(med => {
                const totalStock = med.category === 'Tablet' ? ((med.strips || 0) * (med.tabletsPerStrip || 10) + (med.looseTablets || 0)) : (med.quantity || 0);
                return (
                  <TableRow key={med.id}>
                    <TableCell className="font-medium">{med.name}</TableCell>
                    <TableCell><span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-1 rounded-full">{med.category}</span></TableCell>
                    <TableCell>{med.location}</TableCell>
                    <TableCell>{getPriceDisplay(med)}</TableCell>
                    <TableCell className={`font-semibold ${totalStock < 10 ? 'text-destructive' : ''}`}>{getStockDisplay(med)}</TableCell>
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
                )
            }) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-48 text-muted-foreground">
                   <div className="flex flex-col items-center justify-center gap-2">
                    <Inbox className="h-10 w-10" />
                    <span className="font-medium">No medicines found.</span>
                    <p className="text-sm">Try adjusting your search or filters, or add a new medicine.</p>
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
