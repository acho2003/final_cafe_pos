# Café POS System - Multi-Tenant MVP

A complete multi-tenant café Point of Sale (POS) system built with Node.js, Express, React, and TailwindCSS. This system supports multiple cafés with role-based access control, dynamic table ordering via QR codes, and comprehensive order management.

## 🚀 Features

### Core Functionality
- **Multi-tenant Architecture**: Support for multiple café locations
- **Role-based Access Control**: Super Admin, Café Admin, Manager, and Customer roles
- **QR Code Table Ordering**: Customers scan QR codes to access dynamic menus
- **Real-time Order Management**: Live order updates and status tracking
- **Menu Management**: Full CRUD operations for menu items with categories
- **Staff Management**: Add and manage café staff members

### User Roles & Permissions

#### Super Admin
- Create and manage café locations
- Assign café administrators
- View all platform users and statistics
- Platform-wide management capabilities

#### Café Admin
- Manage café menu items (CRUD operations)
- Generate QR codes for tables
- Add/remove managers
- View and edit all café orders
- Staff management for their café

#### Manager
- View and manage orders by table
- Approve/reject customer orders
- Edit orders manually
- Mark payment status and method
- Real-time order dashboard

#### Customer (No Login Required)
- Access via QR code: `/order?cafe_id=CAFE01&table=5`
- Browse dynamic menu with categories
- Add/remove items with notes
- Real-time bill calculation
- Submit orders to kitchen

## 📱 Usage Guide

### For Customers
1. Scan the QR code at your table
2. Browse the menu by categories
3. Add items to your cart with optional notes
4. Review your order and total
5. Submit your order to the kitchen
6. Wait for order approval and preparation

### For Managers
1. Login with manager credentials
2. View pending orders in real-time
3. Approve or reject customer orders
4. Update order status (preparing, ready, served)
5. Mark payment status and method
6. Add staff notes to orders

### For Café Admins
1. Login with café admin credentials
2. Manage menu items (add, edit, delete, toggle availability)
3. Generate QR codes for tables
4. Add and manage staff members
5. View comprehensive order history
6. Download QR codes for printing

### For Super Admins
1. Login with super admin credentials
2. Create and manage café locations
3. Assign café administrators
4. View platform-wide statistics
5. Manage all users across the platform
