// types/listings.ts
export interface Listing {
  id: number;
  type: 'land' | 'car';
  title: string;
  price: number;
  image: string;
  location?: string; // Land specific
  acreage?: number;  // Land specific
  make?: string;     // Car specific
  model?: string;    // Car specific
  year?: number;     // Car specific
  description: string;
}