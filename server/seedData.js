// This file contains the mock data in a format compatible with the CommonJS seeder script.

const UserRole = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  CAFE_ADMIN: 'CAFE_ADMIN',
  MANAGER: 'MANAGER',
};

const OrderStatus = {
  PENDING: 'PENDING',
  PREPARING: 'PREPARING',
  READY: 'READY',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
};

const PaymentStatus = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  REFUNDED: 'REFUNDED',
};

const PaymentMethod = {
  NONE: 'NONE',
  CASH: 'CASH',
  DK: 'DK',
  MPAY: 'MPAY',
  MBOB: 'MBOB',
};


const MOCK_CAFES = [
  { id: 'CAFE1', name: 'The Grind House', location: 'New York, NY', adminId: 'user2' },
  { id: 'CAFE2', name: 'Bean Around', location: 'Los Angeles, CA', adminId: 'user3' },
];

const MOCK_USERS = [
  { id: 'user1', name: 'Super Admin', email: 'super@admin.com', password: 'password', role: UserRole.SUPER_ADMIN },
  { id: 'user2', name: 'Admin One', email: 'admin1@cafe.com', password: 'password', role: UserRole.CAFE_ADMIN, cafeId: 'CAFE1' },
  { id: 'user3', name: 'Admin Two', email: 'admin2@cafe.com', password: 'password', role: UserRole.CAFE_ADMIN, cafeId: 'CAFE2' },
  { id: 'user4', name: 'Manager One', email: 'manager1@cafe.com', password: 'password', role: UserRole.MANAGER, cafeId: 'CAFE1' },
  { id: 'user5', name: 'Manager Two', email: 'manager2@cafe.com', password: 'password', role: UserRole.MANAGER, cafeId: 'CAFE1' },
];

const MOCK_MENU_ITEMS = [
  { id: 'menu1', cafeId: 'CAFE1', name: 'Espresso', description: 'A classic strong coffee.', price: 2.50, category: 'Coffee', imageUrl: 'https://images.unsplash.com/photo-1579992305312-0455f35543c7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80' },
  { id: 'menu2', cafeId: 'CAFE1', name: 'Cappuccino', description: 'Espresso with steamed milk foam.', price: 3.50, category: 'Coffee', imageUrl: 'https://images.unsplash.com/photo-1557006021-b4ab6ea92954?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80' },
  { id: 'menu3', cafeId: 'CAFE1', name: 'Croissant', description: 'A buttery, flaky pastry.', price: 2.75, category: 'Pastries', imageUrl: 'https://images.unsplash.com/photo-1587241321921-91a834d6d191?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80' },
  { id: 'menu4', cafeId: 'CAFE1', name: 'Avocado Toast', description: 'Toast with fresh avocado.', price: 6.50, category: 'Breakfast', imageUrl: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80' },
  { id: 'menu5', cafeId: 'CAFE2', name: 'Iced Latte', description: 'Chilled espresso with milk.', price: 4.00, category: 'Coffee', imageUrl: 'https://images.unsplash.com/photo-1517701550927-2036ba8ac251?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80' },
];

const now = new Date();
const MOCK_ORDERS = [
  {
    id: 'order1',
    cafeId: 'CAFE1',
    tableNo: 5,
    items: [{ menuItemId: 'menu1', name: 'Espresso', price: 2.50, quantity: 2, phoneNumber:"17777777",notes: 'Extra hot' }],
    total: 5.00,
    status: OrderStatus.PENDING,
    paymentStatus: PaymentStatus.PENDING,
    paymentMethod: PaymentMethod.NONE,
    createdAt: new Date(now.getTime() - 10 * 60000).toISOString(),
    updatedAt: new Date(now.getTime() - 10 * 60000).toISOString(),
  },
  {
    id: 'order2',
    cafeId: 'CAFE1',
    tableNo: 2,
    items: [
        { menuItemId: 'menu2', name: 'Cappuccino',phoneNumber:"17777777", price: 3.50, quantity: 1 },
        { menuItemId: 'menu3', name: 'Croissant', phoneNumber:"17777777", price: 2.75, quantity: 1 }
    ],
    total: 6.25,
    status: OrderStatus.PREPARING,
    paymentStatus: PaymentStatus.PENDING,
    paymentMethod: PaymentMethod.NONE,
    createdAt: new Date(now.getTime() - 5 * 60000).toISOString(),
    updatedAt: new Date(now.getTime() - 2 * 60000).toISOString(),
  },
  {
    id: 'order3',
    cafeId: 'CAFE1',
    tableNo: 8,
    items: [{ menuItemId: 'menu4', name: 'Avocado Toast',phoneNumber:"17777777", price: 6.50, quantity: 1 }],
    total: 6.50,
    status: OrderStatus.COMPLETED,
    paymentStatus: PaymentStatus.PAID,
    paymentMethod: PaymentMethod.DK,
    createdAt: new Date(now.getTime() - 60 * 60000).toISOString(),
    updatedAt: new Date(now.getTime() - 30 * 60000).toISOString(),
  },
];

module.exports = {
    MOCK_CAFES,
    MOCK_USERS,
    MOCK_MENU_ITEMS,
    MOCK_ORDERS
};