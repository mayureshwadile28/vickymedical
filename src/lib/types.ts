export interface Medicine {
  id: string;
  name: string;
  location: string;
  price: number;
  quantity: number;
}

export interface SaleItem {
  medicineId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface SaleRecord {
  id: string;
  customerName: string;
  items: SaleItem[];
  totalAmount: number;
  saleDate: string; // ISO string
}
