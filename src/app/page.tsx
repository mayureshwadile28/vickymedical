
'use client';

import { useState } from 'react';
import { initialMedicines } from '@/lib/data';
import type { Medicine, SaleRecord } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardTab from '@/components/dashboard-tab';
import InventoryTab from '@/components/inventory-tab';
import HistoryTab from '@/components/history-tab';
import { Logo } from '@/components/icons';
import { Package, Pill, History, ShoppingCart } from 'lucide-react';

export default function Home() {
  const [medicines, setMedicines] = useState<Medicine[]>(initialMedicines);
  const [sales, setSales] = useState<SaleRecord[]>([]);

  const addMedicine = (medicine: Omit<Medicine, 'id'>) => {
    setMedicines(prev => [...prev, { ...medicine, id: `med-${Date.now()}` }]);
  };

  const updateMedicine = (updatedMedicine: Medicine) => {
    setMedicines(prev => prev.map(m => m.id === updatedMedicine.id ? updatedMedicine : m));
  };

  const deleteMedicine = (medicineId: string) => {
    setMedicines(prev => prev.filter(m => m.id !== medicineId));
  };

  const createSale = (sale: Omit<SaleRecord, 'id' | 'saleDate'>) => {
    // 1. Create new sale record
    const newSale: SaleRecord = {
      ...sale,
      id: `sale-${Date.now()}`,
      saleDate: new Date().toISOString(),
    };
    setSales(prev => [newSale, ...prev]);

    // 2. Update stock (quantity is in strips)
    setMedicines(prevMedicines => {
      const updatedMedicines = [...prevMedicines];
      newSale.items.forEach(item => {
        const medIndex = updatedMedicines.findIndex(m => m.id === item.medicineId);
        if (medIndex !== -1) {
          const tabletsSold = item.quantity;
          const stripsSold = tabletsSold / 10;
          updatedMedicines[medIndex].quantity -= stripsSold;
        }
      });
      return updatedMedicines;
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur-sm">
        <div className="container flex h-16 items-center space-x-4">
          <Logo className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Vicky Medical</h1>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-8 container">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-lg mx-auto bg-muted/60 p-1">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              <span>POS</span>
            </TabsTrigger>
            <TabsTrigger value="inventory" className="flex items-center gap-2">
              <Pill className="h-4 w-4" />
              <span>Inventory</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              <span>History</span>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="dashboard" className="mt-6">
            <DashboardTab medicines={medicines} createSale={createSale} />
          </TabsContent>
          <TabsContent value="inventory" className="mt-6">
            <InventoryTab
              medicines={medicines}
              addMedicine={addMedicine}
              updateMedicine={updateMedicine}
              deleteMedicine={deleteMedicine}
            />
          </TabsContent>
          <TabsContent value="history" className="mt-6">
            <HistoryTab sales={sales} medicines={medicines} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
