import React, { useState, ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types';
import { Coffee, Building, Users, Menu, ClipboardList, QrCode, LogOut, DollarSign } from './Icons';

interface LayoutProps {
  children: ReactNode;
}

const SuperAdminNav = () => (
  <>
    <NavItem icon={<Building className="w-5 h-5" />} text="Cafes" to="/super-admin/cafes" />
    <NavItem icon={<Users className="w-5 h-5" />} text="Users" to="/super-admin/users" />
  </>
);

const CafeAdminNav = () => (
  <>
    <NavItem icon={<ClipboardList className="w-5 h-5" />} text="Orders" to="/cafe-admin/orders" />
    <NavItem icon={<Menu className="w-5 h-5" />} text="Menu" to="/cafe-admin/menu" />
    <NavItem icon={<Users className="w-5 h-5" />} text="Managers" to="/cafe-admin/managers" />
    <NavItem icon={<QrCode className="w-5 h-5" />} text="QR Codes" to="/cafe-admin/qr" />
    <NavItem icon={<DollarSign className="w-5 h-5" />} text="Reports" to="/cafe-admin/reports" />
  </>
);

const ManagerNav = () => (
  <>
    <NavItem icon={<ClipboardList className="w-5 h-5" />} text="Orders" to="/manager/dashboard" />
  </>
);

interface NavItemProps {
    icon: ReactNode;
    text: string;
    to: string;
}
const NavItem: React.FC<NavItemProps> = ({ icon, text, to }) => (
    <NavLink to={to} className={({isActive}) => `flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}>
        {icon}
        <span className="ml-3">{text}</span>
    </NavLink>
);


export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const renderNavLinks = () => {
    switch (currentUser?.role) {
      case UserRole.SUPER_ADMIN:
        return <SuperAdminNav />;
      case UserRole.CAFE_ADMIN:
        return <CafeAdminNav />;
      case UserRole.MANAGER:
        return <ManagerNav />;
      default:
        return null;
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
        <div className="flex items-center px-4 py-6 border-b border-slate-200">
            <Coffee className="w-8 h-8 text-indigo-600" />
            <span className="ml-3 text-xl font-bold text-slate-800">Café POS</span>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-2">
            {renderNavLinks()}
        </nav>
        <div className="px-4 py-4 border-t border-slate-200">
             <button onClick={handleLogout} className="flex items-center w-full px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors">
                <LogOut className="w-5 h-5" />
                <span className="ml-3">Logout</span>
            </button>
        </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-100">
      {/* Sidebar for desktop */}
      <aside className="hidden md:flex md:flex-shrink-0 w-64 bg-white border-r border-slate-200">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      <div className={`fixed inset-0 flex z-40 md:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`}>
          <div className="w-64 bg-white border-r border-slate-200">
            <SidebarContent />
          </div>
          <div className="flex-shrink-0 w-14" onClick={() => setSidebarOpen(false)}></div>
      </div>

      <div className="flex flex-col flex-1 w-0 overflow-hidden">
        <header className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow-sm md:border-none border-b border-slate-200">
          <button className="px-4 text-slate-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 md:hidden" onClick={() => setSidebarOpen(true)}>
            <span className="sr-only">Open sidebar</span>
            <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
            </svg>
          </button>
          <div className="flex-1 px-4 flex justify-end items-center">
            <div className="text-right">
                <p className="text-sm font-medium text-slate-800">{currentUser?.name}</p>
                <p className="text-xs text-slate-500">{currentUser?.role.replace('_', ' ')}</p>
            </div>
          </div>
        </header>
        <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none p-4 sm:p-6 lg:p-8">
            {children}
        </main>
      </div>
    </div>
  );
};