import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAdminAuth } from '../context/AdminAuthContext';

const AdminLayout = ({ children }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile); // Desktop default open, mobile default closed
  const location = useLocation();
  const navigate = useNavigate();
  const { admin, logout } = useAdminAuth();

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      // Auto-open sidebar on desktop, keep current state on mobile
      if (!mobile && !sidebarOpen) {
        setSidebarOpen(true);
      } else if (mobile && sidebarOpen) {
        // On mobile, you can choose to keep it open or close it
        // setSidebarOpen(false); // Uncomment if you want to auto-close on mobile
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Check on mount

    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarOpen]);

  const getRoleEmoji = (role) => {
    switch (role) {
      case 'StateAdmin': return '🏛️';
      case 'DistrictAdmin': return '🏢';
      case 'BlockAdmin': return '🏘️';
      case 'VillageAdmin': return '🏠';
      default: return '👤';
    }
  };

  const menuItems = [
    { path: '/admin/dashboard', name: 'Dashboard', icon: '📊' },
    { path: '/admin/complaints', name: 'Complaints', icon: '📋' },
    { path: '/admin/analytics', name: 'Analytics', icon: '📈' },
    ...(admin?.role !== 'VillageAdmin' ? [{ path: '/admin/admins', name: 'Admin Management', icon: '👥' }] : []),
    { path: '/admin/profile', name: 'Profile', icon: '👤' },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  // Handle sidebar toggle - only works on mobile
  const handleSidebarToggle = () => {
    if (isMobile) {
      setSidebarOpen(!sidebarOpen); // Mobile: toggle open/close
    }
    // Desktop: No toggle functionality - sidebar always stays open
  };

  return (
    <div className="min-h-screen bg-gray-100 flex relative">
      {/* Mobile Backdrop */}
      {isMobile && sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.div
        initial={{ x: -250 }}
        animate={{ 
          x: sidebarOpen ? 0 : (isMobile ? -280 : 0), // Desktop: Always visible (x: 0)
        }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={`bg-white shadow-lg fixed h-full z-30 overflow-hidden ${
          isMobile ? 'w-72' : 'w-64' // Desktop: Always full width
        }`}
      >
        {/* Logo/Header */}
        <div className="p-4 lg:p-6 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-xl lg:text-2xl">{getRoleEmoji(admin?.role)}</div>
              <motion.div
                animate={{ opacity: (isMobile && sidebarOpen) || !isMobile ? 1 : 0 }}
                className={`${(isMobile && sidebarOpen) || !isMobile ? 'block' : 'hidden'}`}
              >
                <h2 className="text-base lg:text-lg font-bold text-gray-900">Admin Panel</h2>
                <p className="text-xs lg:text-sm text-gray-600">{admin?.role}</p>
              </motion.div>
            </div>
            
            {/* Mobile Close Button */}
            {isMobile && sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
              >
                <motion.div
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 180 }}
                  className="w-6 h-6 flex items-center justify-center"
                >
                  <span className="text-gray-500 text-xl">×</span>
                </motion.div>
              </button>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-4 lg:mt-6 overflow-y-auto max-h-[calc(100vh-200px)]">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => isMobile && setSidebarOpen(false)}
              className={`flex items-center px-4 lg:px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 border-r-4 transition-all ${
                location.pathname === item.path
                  ? 'bg-blue-50 text-blue-600 border-blue-600'
                  : 'border-transparent'
              }`}
            >
              <span className="text-lg lg:text-xl mr-3 min-w-[24px]">{item.icon}</span>
              <motion.span 
                animate={{ opacity: (isMobile && sidebarOpen) || !isMobile ? 1 : 0 }}
                className={`font-medium text-sm lg:text-base ${(isMobile && sidebarOpen) || !isMobile ? 'block' : 'hidden'}`}
              >
                {item.name}
              </motion.span>
            </Link>
          ))}
        </nav>

        {/* User Info & Logout */}
        <div className="absolute bottom-0 w-full p-4 lg:p-6 border-t bg-white">
          <motion.div 
            animate={{ opacity: (isMobile && sidebarOpen) || !isMobile ? 1 : 0 }}
            className={`mb-4 ${(isMobile && sidebarOpen) || !isMobile ? 'block' : 'hidden'}`}
          >
            <p className="text-sm font-medium text-gray-900 truncate">{admin?.name}</p>
            <p className="text-xs text-gray-600 truncate">{admin?.email}</p>
          </motion.div>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center justify-center lg:justify-start px-2 lg:px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors`}
          >
            <span className="text-lg mr-0 lg:mr-2">🚪</span>
            <motion.span 
              animate={{ opacity: (isMobile && sidebarOpen) || !isMobile ? 1 : 0 }}
              className={`${(isMobile && sidebarOpen) || !isMobile ? 'block' : 'hidden'}`}
            >
              Logout
            </motion.span>
          </button>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${
        isMobile 
          ? 'ml-0' 
          : 'ml-64' // Desktop: Always full margin since sidebar is always open
      }`}>
        {/* Top Bar */}
        <div className="bg-white shadow-sm p-3 lg:p-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center space-x-3">
            {/* Hamburger Button - Only show on mobile */}
            {isMobile && (
              <button
                onClick={handleSidebarToggle}
                className={`p-2 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  sidebarOpen ? 'hover:bg-red-50 bg-red-50' : 'hover:bg-gray-100'
                }`}
                title={sidebarOpen ? 'Close Menu' : 'Open Menu'}
              >
                {sidebarOpen ? (
                  // Mobile: Show close (×) when sidebar is open
                  <motion.div
                    initial={{ rotate: 0 }}
                    animate={{ rotate: 180 }}
                    transition={{ duration: 0.3 }}
                    className="w-6 h-6 flex items-center justify-center"
                  >
                    <span className="text-red-600 text-xl font-bold">×</span>
                  </motion.div>
                ) : (
                  // Mobile: Show hamburger when sidebar is closed
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="w-6 h-6 flex flex-col justify-center items-center"
                  >
                    <span className="w-5 h-0.5 bg-gray-700 mb-1 block"></span>
                    <span className="w-5 h-0.5 bg-gray-700 mb-1 block"></span>
                    <span className="w-5 h-0.5 bg-gray-700 block"></span>
                  </motion.div>
                )}
              </button>
            )}
            
            {/* Mobile Admin Info */}
            <div className="lg:hidden">
              <p className="text-sm font-medium text-gray-900 truncate max-w-[120px]">{admin?.name}</p>
              <p className="text-xs text-gray-600">{admin?.role}</p>
            </div>
            
            {/* Desktop Title */}
            <div className="hidden lg:block">
              <h1 className="text-lg font-semibold text-gray-900">Admin Dashboard</h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden sm:block text-xs lg:text-sm text-gray-600">
              {new Date().toLocaleDateString('en-IN', { 
                weekday: isMobile ? 'short' : 'long', 
                year: 'numeric', 
                month: isMobile ? 'short' : 'long', 
                day: 'numeric' 
              })}
            </div>
            
            {/* Mobile Menu Indicator */}
            <div className="lg:hidden">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="p-3 lg:p-6 overflow-x-hidden min-h-screen">
          <div className="max-w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;