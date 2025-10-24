
'use client';

import { useState, useEffect } from 'react';
import type { Medicine, SaleRecord } from '@/lib/types';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
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
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { History, Inbox, Calendar, User, FileDown, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';


interface HistoryTabProps {
  sales: SaleRecord[];
  medicines: Medicine[];
  clearSales: () => void;
}

const SaleDate = ({ date }: { date: string }) => {
  const [formattedDate, setFormattedDate] = useState('');

  useEffect(() => {
    // This code now runs only on the client, after hydration.
    const d = new Date(date);
    const datePart = d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    const timePart = d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    setFormattedDate(`${datePart} at ${timePart}`);
  }, [date]);
  
  if (!formattedDate) {
    // Render a placeholder on the server and during the initial client render
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Calendar className="h-4 w-4" />
        <span>Loading date...</span>
      </div>
    );
  }

  // Render the formatted date only on the client
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Calendar className="h-4 w-4" />
      <span>{formattedDate}</span>
    </div>
  );
}


export default function HistoryTab({ sales, clearSales }: HistoryTabProps) {
  const { toast } = useToast();

  const handleExport = () => {
    if (sales.length === 0) {
      toast({ title: "No history to export", variant: "destructive"});
      return;
    }

    const headers = ['Sale ID', 'Date', 'Customer Name', 'Item Name', 'Quantity', 'Price Per Unit', 'Item Total'];
    const csvRows = [headers.join(',')];

    sales.forEach(sale => {
      sale.items.forEach(item => {
        const row = [
          sale.id,
          new Date(sale.saleDate).toLocaleString(),
          `"${sale.customerName.replace(/"/g, '""')}"`,
          `"${item.name.replace(/"/g, '""')}"`,
          item.quantity,
          item.price.toFixed(2),
          (item.quantity * item.price).toFixed(2),
        ];
        csvRows.push(row.join(','));
      });
    });

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `sales_history_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    toast({ title: "Export Successful", description: "Sales history has been downloaded as a CSV file."})
  };

  const handleClearHistory = () => {
    clearSales();
    toast({ title: "History Cleared", description: "All sales records have been deleted.", className: "bg-green-500 text-white" });
  }

  return (
    <Card>
      <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <CardTitle className="flex items-center">
          <History className="mr-2 h-6 w-6" />
          Sales History
        </CardTitle>
        <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleExport} disabled={sales.length === 0}>
                <FileDown className="mr-2 h-4 w-4" />
                Export to CSV
            </Button>
             <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" disabled={sales.length === 0}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Clear History
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete all your sales history.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleClearHistory}>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
      </CardHeader>
      <CardContent>
        {sales.length > 0 ? (
          <Accordion type="single" collapsible className="w-full">
            {sales.map(sale => (
              <AccordionItem value={sale.id} key={sale.id}>
                <AccordionTrigger>
                  <div className="flex flex-col md:flex-row justify-between w-full md:items-center gap-2 md:pr-4 text-left">
                    <div className="flex items-center gap-2 font-medium">
                      <User className="h-4 w-4 text-muted-foreground"/> 
                      <span>{sale.customerName}</span>
                    </div>
                    <SaleDate date={sale.saleDate} />
                    <span className="font-semibold text-lg text-right md:text-left">₹{sale.totalAmount.toFixed(2)}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sale.items.map(item => (
                        <TableRow key={item.medicineId}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-right">₹{item.price.toFixed(2)}</TableCell>
                          <TableCell className="text-right">
                            ₹{(item.quantity * item.price).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-64 border-2 border-dashed rounded-lg bg-muted/20">
            <Inbox className="h-12 w-12 mb-4" />
            <h3 className="text-lg font-semibold">No Sales Recorded Yet</h3>
            <p className="text-sm">Go to the POS tab to make your first sale.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
