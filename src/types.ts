// types.ts

export type View =
  | 'home'
  | 'checkRoom'
  | 'registerProduct'
  // 'makeSale' is deprecated/removed
  | 'manageRooms'
  | 'registerRoom'
  | 'roomDetail'
  | 'checkout'
  | 'history'
  | 'simulator'
  | 'manageAmenities'
  | 'managePackages';

export interface Product {
  id: string;
  name: string;
  price: number;
}

export interface Amenity {
  id: string;
  name: string;
}

export interface PackageService {
  id: string;
  name: string;
}

export interface Package {
  id: string;
  name: string;
  price: number;
  description: string;
  serviceIds: string[]; // Changed from includedProducts
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productPrice: number;
  quantity: number;
}

export interface HotelRoom {
  id: string;
  number: string;
  name: string;
  amenities: string[];
}

export interface Room {
  id: string;
  roomNumber: string;
  roomName: string;
  guestName: string;
  dailyRate: number;
  checkInDate: string; // ISO string
  checkOutDate: string | null; // ISO string
  order: OrderItem[];
  status: 'occupied' | 'reserved';
  amenities: string[];
  mealPackage: {
    breakfast: boolean;
    lunch: boolean;
    dinner: boolean;
  };
  packageId?: string;
  packageName?: string;
  packagePrice?: number;
}

export type ClosedRoom = Room & {
  finalCheckOutDate: string; // ISO string
  roomTotal: number;
  orderTotal: number;
  mealPackageTotal: number;
  totalAmount: number;
  originalStatus: 'occupied' | 'reserved';
};
