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
  TableFooter,
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
import { Search, ShoppingCart, Trash2, ChevronsUpDown } from 'lucide-react';

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
    if (quantity <= 0) {
      toast({ title: 'Invalid quantity', description: `Please enter a valid quantity.`, variant: 'destructive' });
      return;
    }
    if (quantity > selectedMedicine.quantity) {
      toast({ title: 'Not enough stock', description: `Only ${selectedMedicine.quantity} available.`, variant: 'destructive' });
      return;
    }

    const existingItemIndex = billItems.findIndex(item => item.medicineId === selectedMedicine.id);
    if (existingItemIndex !== -1) {
      const newBillItems = [...billItems];
      newBillItems[existingItemIndex].quantity += quantity;
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
    toast({ title: 'Sale Completed!', description: `Bill for ${customerName} created successfully.` });
    
    // Reset state
    setBillItems([]);
    setCustomerName('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Create New Bill</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="flex items-end gap-4">
            <div className="flex-1">
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
                      <div key={med.id} onClick={() => handleSelectMedicine(med)} className="p-2 hover:bg-accent rounded-md cursor-pointer text-sm">
                        {med.name} <span className="text-xs text-muted-foreground">({med.quantity} left)</span>
                      </div>
                    )) : <p className="p-2 text-sm text-center text-muted-foreground">No medicines found.</p>}
                  </ScrollArea>
                </PopoverContent>
              </Popover>
            </div>
            <div className="w-24">
              <Label htmlFor="quantity">Quantity</Label>
              <Input id="quantity" type="number" min="1" max={selectedMedicine?.quantity || 1} value={quantity} onChange={e => setQuantity(parseInt(e.target.value, 10))} />
            </div>
            <Button onClick={handleAddToBill} disabled={!selectedMedicine}>Add to Bill</Button>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Current Bill</h3>
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead className="w-[100px] text-right">Qty</TableHead>
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
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveFromBill(item.medicineId)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center h-24">
                        No items in bill
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
                {billItems.length > 0 && (
                  <TableFooter>
                    <TableRow>
                      <TableCell colSpan={3} className="font-bold text-lg">Total</TableCell>
                      <TableCell className="text-right font-bold text-lg">₹{totalAmount.toFixed(2)}</TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableFooter>
                )}
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Checkout</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
             <div className="flex justify-between items-center text-xl font-bold">
              <span>Total Amount:</span>
              <span>₹{totalAmount.toFixed(2)}</span>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full" size="lg" disabled={billItems.length === 0}>
                  <ShoppingCart className="mr-2 h-5 w-5" /> Complete Sale
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Complete Sale</DialogTitle>
                  <DialogDescription>Enter customer details to finalize the transaction.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="customer-name" className="text-right">Customer Name</Label>
                    <Input id="customer-name" value={customerName} onChange={e => setCustomerName(e.target.value)} className="col-span-3" placeholder="e.g. John Doe" />
                  </div>
                  <div className="text-lg font-bold flex justify-between col-span-4 mt-4">
                    <span>Total:</span>
                    <span>₹{totalAmount.toFixed(2)}</span>
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button onClick={handleCompleteSale}>Confirm Sale</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
