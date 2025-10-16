
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  CAFE_ADMIN = 'CAFE_ADMIN',
  MANAGER = 'MANAGER',
}

export enum OrderStatus {
  PENDING = 'PENDING',
  PREPARING = 'PREPARING',
  READY = 'READY',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  REFUNDED = 'REFUNDED',
}

export enum PaymentMethod {
  NONE = 'NONE',
  CASH = 'CASH',
  DK = 'DK',
  MPAY = 'MPAY',
  MBOB = 'MBOB',
}

export interface Cafe {
  id: string;
  name: string;
  location: string;
  adminId?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  cafeId?: string;
}

export interface MenuItem {
  id: string;
  cafeId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
}

export interface Order {
  id: string;
  cafeId: string;
  tableNo: number;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  createdAt: string;
  updatedAt: string;
}

export interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<User | null>;
  logout: () => void;
  loading: boolean;
}
