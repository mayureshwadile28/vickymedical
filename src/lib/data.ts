import type { Medicine } from './types';

export const initialMedicines: Medicine[] = [
  { id: 'med-1', name: 'Paracetamol 500mg', location: 'Rack A-1', price: 25.50, quantity: 100 },
  { id: 'med-2', name: 'Amoxicillin 250mg', location: 'Rack B-3', price: 75.00, quantity: 50 },
  { id: 'med-3', name: 'Ibuprofen 200mg', location: 'Rack A-2', price: 40.00, quantity: 80 },
  { id: 'med-4', name: 'Cetirizine 10mg', location: 'Rack C-5', price: 15.75, quantity: 120 },
  { id: 'med-5', name: 'Omeprazole 20mg', location: 'Rack D-1', price: 55.20, quantity: 60 },
];
