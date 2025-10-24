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
import { History, Inbox } from 'lucide-react';

interface HistoryTabProps {
  sales: SaleRecord[];
  medicines: Medicine[];
}

export default function HistoryTab({ sales }: HistoryTabProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

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
                  <div className="flex justify-between w-full pr-4">
                    <span className="font-medium">{sale.customerName}</span>
                    <span className="text-muted-foreground">
                      {isClient ? new Date(sale.saleDate).toLocaleDateString() : ''}
                    </span>
                    <span className="font-semibold">${sale.totalAmount.toFixed(2)}</span>
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
                          <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                          <TableCell className="text-right">
                            ${(item.quantity * item.price).toFixed(2)}
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
          <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-64 border-2 border-dashed rounded-lg">
            <Inbox className="h-12 w-12 mb-4" />
            <h3 className="text-lg font-semibold">No Sales Recorded Yet</h3>
            <p className="text-sm">Go to the dashboard to make your first sale.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
