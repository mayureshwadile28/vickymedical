
'use client';

import { useState, useEffect } from 'react';
import type { Medicine, SaleRecord } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardTab from '@/components/dashboard-tab';
import InventoryTab from '@/components/inventory-tab';
import HistoryTab from '@/components/history-tab';
import { Logo } from '@/components/icons';
import { Pill, History, ShoppingCart } from 'lucide-react';

// Define keys for local storage
const MEDICINES_STORAGE_KEY = 'vicky-medical-medicines';
const SALES_STORAGE_KEY = 'vicky-medical-sales';

export default function Home() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load data from localStorage on initial render
  useEffect(() => {
    try {
      const storedMedicines = localStorage.getItem(MEDICINES_STORAGE_KEY);
      if (storedMedicines) {
        setMedicines(JSON.parse(storedMedicines));
      }
      const storedSales = localStorage.getItem(SALES_STORAGE_KEY);
      if (storedSales) {
        setSales(JSON.parse(storedSales));
      }
    } catch (error) {
      console.error("Failed to parse data from localStorage", error);
      // Handle potential JSON parsing errors
    }
    setIsLoaded(true);
  }, []);

  // Save medicines to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(MEDICINES_STORAGE_KEY, JSON.stringify(medicines));
    }
  }, [medicines, isLoaded]);

  // Save sales to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(SALES_STORAGE_KEY, JSON.stringify(sales));
    }
  }, [sales, isLoaded]);


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
    const newSale: SaleRecord = {
      ...sale,
      id: `sale-${Date.now()}`,
      saleDate: new Date().toISOString(),
    };
    setSales(prev => [newSale, ...prev]);
  
    setMedicines(prevMedicines => {
      const updatedMedicines = prevMedicines.map(med => {
        const saleItem = newSale.items.find(item => item.medicineId === med.id);
        if (!saleItem) {
          return med;
        }
  
        const updatedMed = { ...med };
  
        if (updatedMed.category === 'Tablet') {
          const tabletsPerStrip = updatedMed.tabletsPerStrip || 10;
          const totalTablets = (updatedMed.strips || 0) * tabletsPerStrip + (updatedMed.looseTablets || 0);
          const remainingTablets = totalTablets - saleItem.quantity;
          
          updatedMed.strips = Math.floor(remainingTablets / tabletsPerStrip);
          updatedMed.looseTablets = remainingTablets % tabletsPerStrip;
        } else {
          updatedMed.quantity = (updatedMed.quantity || 0) - saleItem.quantity;
        }
  
        return updatedMed;
      });
      return updatedMedicines;
    });
  };

  // Render a loading state until the data is loaded from localStorage
  if (!isLoaded) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <div className="flex items-center space-x-4">
                <Logo className="h-10 w-10 text-primary animate-spin" />
                <h1 className="text-2xl font-bold text-foreground">Loading Vicky Medical...</h1>
            </div>
        </div>
    );
  }

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
