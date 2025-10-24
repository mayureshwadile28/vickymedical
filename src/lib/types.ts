export interface Medicine {
  id: string;
  name: string;
  location: string;
  price: number; // Price per strip
  quantity: number; // Number of strips
}

export interface SaleItem {
  medicineId: string;
  name: string;
  quantity: number; // Number of tablets
  price: number; // Price per tablet
}

export interface SaleRecord {
  id: string;
  customerName: string;
  items: SaleItem[];
  totalAmount: number;
  saleDate: string; // ISO string
}
