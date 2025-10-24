'use client';

import { useState, useMemo } from 'react';
import type { Medicine, SaleItem, SaleRecord } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Search, ShoppingCart, Trash2, ChevronsUpDown, PlusCircle } from 'lucide-react';

interface DashboardTabProps {
  medicines: Medicine[];
  createSale: (sale: Omit<SaleRecord, 'id' | 'saleDate'>) => void;
}

export default function DashboardTab({ medicines, createSale }: DashboardTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [billItems, setBillItems] = useState<SaleItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { toast } = useToast();

  const filteredMedicines = useMemo(() => {
    if (!searchQuery) return medicines.filter(m => m.quantity > 0);
    return medicines.filter(m =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) && m.quantity > 0
    );
  }, [searchQuery, medicines]);

  const totalAmount = useMemo(() => {
    return billItems.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [billItems]);

  const handleSelectMedicine = (medicine: Medicine) => {
    setSelectedMedicine(medicine);
    setSearchQuery('');
    setQuantity(1);
    setIsSearchOpen(false);
  };

  const handleAddToBill = () => {
    if (!selectedMedicine) {
      toast({ title: 'No medicine selected', variant: 'destructive' });
      return;
    }
    if (quantity <= 0 || isNaN(quantity)) {
      toast({ title: 'Invalid quantity', description: 'Please enter a valid quantity.', variant: 'destructive' });
      return;
    }
    if (quantity > selectedMedicine.quantity) {
      toast({ title: 'Not enough stock', description: `Only ${selectedMedicine.quantity} available.`, variant: 'destructive' });
      return;
    }

    const existingItemIndex = billItems.findIndex(item => item.medicineId === selectedMedicine.id);
    if (existingItemIndex !== -1) {
      const newBillItems = [...billItems];
      const newQuantity = newBillItems[existingItemIndex].quantity + quantity;
      if (newQuantity > selectedMedicine.quantity) {
        toast({ title: 'Not enough stock', description: `Cannot add ${quantity}. Only ${selectedMedicine.quantity - newBillItems[existingItemIndex].quantity} more available.`, variant: 'destructive' });
        return;
      }
      newBillItems[existingItemIndex].quantity = newQuantity;
      setBillItems(newBillItems);
    } else {
      setBillItems([
        ...billItems,
        { medicineId: selectedMedicine.id, name: selectedMedicine.name, quantity, price: selectedMedicine.price },
      ]);
    }
    
    setSelectedMedicine(null);
    setSearchQuery('');
    setQuantity(1);
  };

  const handleRemoveFromBill = (medicineId: string) => {
    setBillItems(billItems.filter(item => item.medicineId !== medicineId));
  };

  const handleCompleteSale = () => {
    if (billItems.length === 0) {
      toast({ title: 'Bill is empty', variant: 'destructive' });
      return;
    }
    if (!customerName.trim()) {
        toast({ title: 'Customer name is required', variant: 'destructive' });
        return;
    }

    createSale({ customerName, items: billItems, totalAmount });
    toast({ title: 'Sale Completed!', description: `Bill for ${customerName} created successfully.`, className: 'bg-green-500 text-white' });
    
    // Reset state
    setBillItems([]);
    setCustomerName('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>Point of Sale</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
            <div className="md:col-span-3">
              <Label htmlFor="medicine-search">Search Medicine</Label>
              <Popover open={isSearchOpen} onOpenChange={setIsSearchOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {selectedMedicine?.name || "Select a medicine"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                  <div className="p-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        placeholder="Type to search..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                  </div>
                  <ScrollArea className="h-[250px]">
                    {filteredMedicines.length > 0 ? filteredMedicines.map(med => (
                      <div key={med.id} onClick={() => handleSelectMedicine(med)} className="p-2 hover:bg-accent rounded-md cursor-pointer text-sm flex justify-between">
                        <span>{med.name}</span>
                        <span className="text-xs text-muted-foreground">({med.quantity} left)</span>
                      </div>
                    )) : <p className="p-2 text-sm text-center text-muted-foreground">No medicines found.</p>}
                  </ScrollArea>
                </PopoverContent>
              </Popover>
            </div>
            <div className="md:col-span-1">
              <Label htmlFor="quantity">Quantity</Label>
              <Input id="quantity" type="number" min="1" max={selectedMedicine?.quantity} value={quantity} onChange={e => setQuantity(parseInt(e.target.value, 10) || 1)} disabled={!selectedMedicine}/>
            </div>
            <div className="md:col-span-2">
                <Button onClick={handleAddToBill} disabled={!selectedMedicine} className="w-full">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add to Bill
                </Button>
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead className="w-[80px] text-right">Qty</TableHead>
                  <TableHead className="w-[100px] text-right">Price</TableHead>
                  <TableHead className="w-[100px] text-right">Total</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {billItems.length > 0 ? billItems.map(item => (
                  <TableRow key={item.medicineId}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">₹{item.price.toFixed(2)}</TableCell>
                    <TableCell className="text-right">₹{(item.quantity * item.price).toFixed(2)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => handleRemoveFromBill(item.medicineId)} className="h-8 w-8">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                      No items in bill
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Checkout</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
              <Label htmlFor="customer-name">Customer Name</Label>
              <Input id="customer-name" value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="e.g. John Doe" />
          </div>
          <div className="flex justify-between items-baseline text-2xl font-bold">
            <span>Total:</span>
            <span>₹{totalAmount.toFixed(2)}</span>
          </div>
        </CardContent>
        <CardFooter>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full" size="lg" disabled={billItems.length === 0}>
                  <ShoppingCart className="mr-2 h-5 w-5" /> Complete Sale
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm Sale</DialogTitle>
                  <DialogDescription>
                    Finalize the transaction for <span className="font-semibold">{customerName || 'customer'}</span>.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  {billItems.map(item => (
                      <div key={item.medicineId} className="flex justify-between items-center text-sm">
                          <span>{item.name} x {item.quantity}</span>
                          <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                  ))}
                  <div className="text-xl font-bold flex justify-between items-center border-t pt-4 mt-4">
                    <span>Total Amount:</span>
                    <span>₹{totalAmount.toFixed(2)}</span>
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <DialogClose asChild>
                    <Button onClick={handleCompleteSale}>Confirm Sale</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
        </CardFooter>
      </Card>
    </div>
  );
}

    