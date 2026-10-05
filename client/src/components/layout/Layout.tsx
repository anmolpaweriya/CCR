import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { ToastContainer } from '../ui/ToastContainer';
import { CommandPalette } from '../ui/CommandPalette';
import { useAuth } from '../../context/AuthContext';

export const Layout: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // Hide sidebar on landing page, login, and register
  const isAuthOrLanding =
    ['/', '/login', '/register'].includes(location.pathname);

  const showSidebar = isAuthenticated && !isAuthOrLanding;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Navigation */}
      <Navbar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Desktop Sidebar */}
        {showSidebar && <Sidebar />}

        {/* Main Content Area */}
        <main
          className={`flex-1 w-full p-4 sm:p-6 lg:p-8 ${
            showSidebar ? 'pb-20 md:pb-8' : 'pb-8'
          }`}
        >
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      {showSidebar && <MobileNav />}

      {/* Global Utilities */}
      <ToastContainer />
      <CommandPalette />
    </div>
  );
};
