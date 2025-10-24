'use client';

import { useState, useEffect } from 'react';
import type { Medicine, SaleRecord } from '@/lib/types';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { History, Inbox, Calendar, User } from 'lucide-react';

interface HistoryTabProps {
  sales: SaleRecord[];
  medicines: Medicine[];
}

const SaleDate = ({ date }: { date: string }) => {
  const [formattedDate, setFormattedDate] = useState('');
  const [formattedTime, setFormattedTime] = useState('');

  useEffect(() => {
    const d = new Date(date);
    setFormattedDate(d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }));
    setFormattedTime(d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }));
  }, [date]);

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Calendar className="h-4 w-4" />
      <span>{formattedDate} at {formattedTime}</span>
    </div>
  );
}


export default function HistoryTab({ sales }: HistoryTabProps) {

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <History className="mr-2 h-6 w-6" />
          Sales History
        </CardTitle>
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
