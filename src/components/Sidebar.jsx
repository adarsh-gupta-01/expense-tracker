import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FaHome, 
  FaPlus, 
  FaChartPie, 
  FaShareAlt,
  FaUsers,
  FaUserEdit,
  FaSignOutAlt, 
  FaBars, 
  FaTimes,
  FaUserCircle 
} from 'react-icons/fa';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout, userRole, roleLoaded } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const menuItems = [
    { path: '/', icon: FaHome, label: 'Dashboard', show: true },
    { path: '/add-expense', icon: FaPlus, label: 'Add Record', show: true },
    { path: '/analytics', icon: FaChartPie, label: 'Analytics', show: true },
    { path: '/sharing', icon: FaShareAlt, label: 'Sharing', show: true },
    { path: '/shared-with-me', icon: FaUsers, label: 'Shared With Me', show: true },
    { path: '/profile', icon: FaUserEdit, label: 'Profile', show: true },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* ===== MOBILE VIEW ===== */}
      {/* Mobile Header Bar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-black z-40">
        <div className="flex items-center justify-between h-full px-4">
          {/* Hamburger Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors border border-transparent hover:border-black"
            aria-label="Toggle menu"
          >
            {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>

          {/* Logo in Header */}
          <div className="flex items-center space-x-2">
            <div className="p-2 border border-black rounded-lg">
              <svg 
                className="w-6 h-6 text-black" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-black">Expense</h1>
            </div>
          </div>

          {/* User Avatar in Header */}
          <FaUserCircle className="text-3xl text-black" />
        </div>
      </header>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30 top-16"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Sidebar - Slides in from left */}
      <aside
        className={`
          lg:hidden fixed left-0 top-16 h-[calc(100vh-64px)] bg-white border-r border-black z-40 
          transition-transform duration-300 ease-in-out w-64
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* User Info */}
          <div className="p-4 border-b border-black bg-white">
            <div className="flex items-center space-x-3">
              <FaUserCircle className="text-3xl text-black" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {currentUser?.email}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {roleLoaded ? (userRole || 'role not set') : 'loading role...'}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {menuItems.map((item) => {
              if (!item.show) return null;
              
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`
                    flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200
                    ${isActive(item.path)
                      ? 'bg-black text-white'
                      : 'text-black hover:bg-gray-100 border border-transparent hover:border-black'
                    }
                  `}
                >
                  <Icon className="text-xl" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-black">
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 text-black border border-black rounded-lg hover:bg-black hover:text-white transition-colors duration-200"
            >
              <FaSignOutAlt className="text-xl" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ===== DESKTOP VIEW ===== */}
      {/* Desktop Sidebar - Static, always visible */}
      <aside className="hidden lg:flex lg:w-64 flex-shrink-0 flex-col bg-white border-r border-black h-screen">
        <div className="flex flex-col h-full">
          {/* Logo/Header */}
          <div className="p-6 border-b border-black">
            <div className="flex items-center space-x-3">
              <div className="p-2 border border-black rounded-lg">
                <svg 
                  className="w-8 h-8 text-black" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-black">Expense</h1>
                <p className="text-xs text-gray-700">Tracker</p>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-black bg-white">
            <div className="flex items-center space-x-3">
              <FaUserCircle className="text-3xl text-black" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {currentUser?.email}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {roleLoaded ? (userRole || 'role not set') : 'loading role...'}
                </p>
                {roleLoaded && !userRole && (
                  <p className="text-[11px] text-red-600 mt-1 break-all">
                    Add your uid doc in users/{currentUser?.uid}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {menuItems.map((item) => {
              if (!item.show) return null;
              
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200
                    ${isActive(item.path)
                      ? 'bg-black text-white'
                      : 'text-black hover:bg-gray-100 border border-transparent hover:border-black'
                    }
                  `}
                >
                  <Icon className="text-xl" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-black">
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 text-black border border-black rounded-lg hover:bg-black hover:text-white transition-colors duration-200"
            >
              <FaSignOutAlt className="text-xl" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
