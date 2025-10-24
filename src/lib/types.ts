export type MedicineCategory = 'Tablet' | 'Syrup' | 'Veterinary' | 'Injection' | 'Other';

export interface Medicine {
  id: string;
  name: string;
  location: string;
  price: number; // Price per strip for tablets, or per unit for others
  quantity: number; // Number of strips or units
  category: MedicineCategory;
}

export interface SaleItem {
  medicineId: string;
  name: string;
  quantity: number; // Number of tablets or units
  price: number; // Price per tablet or unit
}

export interface SaleRecord {
  id: string;
  customerName: string;
  items: SaleItem[];
  totalAmount: number;
  saleDate: string; // ISO string
}
