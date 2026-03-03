import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from './logo.png';
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
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout, userRole, userProfile, roleLoaded } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setShowLogoutConfirm(false);
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
          <div className="flex items-center">
            <img
              src={logo}
              alt="Expense Tracker"
              className="h-10 w-auto object-contain"
            />
          </div>

          {/* User Avatar in Header */}
          {userProfile?.photoURL ? (
            <img src={userProfile.photoURL} alt="" className="w-8 h-8 rounded-full object-cover border border-gray-200" />
          ) : (
            <FaUserCircle className="text-3xl text-black" />
          )}
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
              {userProfile?.photoURL ? (
                <img src={userProfile.photoURL} alt="" className="w-10 h-10 rounded-full object-cover border border-gray-200 flex-shrink-0" />
              ) : (
                <FaUserCircle className="text-3xl text-black flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                {userProfile?.displayName && (
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {userProfile.displayName}
                  </p>
                )}
                <p className="text-xs text-gray-600 truncate">
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
              onClick={() => { setIsOpen(false); setShowLogoutConfirm(true); }}
              className="w-full flex items-center space-x-3 px-4 py-3 text-black border border-gray-300 rounded-lg hover:bg-red-50 hover:border-red-400 hover:text-red-600 transition-colors duration-200"
            >
              <FaSignOutAlt className="text-xl" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ===== DESKTOP VIEW ===== */}
{/* Desktop Sidebar - Static, always visible */}
<aside className="hidden lg:flex lg:w-72 flex-shrink-0 flex-col bg-white border-r border-black h-screen">
  <div className="flex flex-col h-full">

    {/* Logo/Header */}
    <div className="py-3 px-5 border-b border-black">
      <div className="flex items-center justify-center">
        <img
          src={logo}
          alt="Expense Tracker"
          className="w-44 h-auto object-contain"
        />
      </div>
    </div>

    {/* User Info */}
    <div className="p-4 border-b border-black bg-white">
      <div className="flex items-center space-x-3">
        {userProfile?.photoURL ? (
          <img src={userProfile.photoURL} alt="" className="w-10 h-10 rounded-full object-cover border border-gray-200 flex-shrink-0" />
        ) : (
          <FaUserCircle className="text-3xl text-black flex-shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          {userProfile?.displayName && (
            <p className="text-sm font-semibold text-gray-900 truncate">
              {userProfile.displayName}
            </p>
          )}
          <p className="text-xs text-gray-600 truncate">
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
        onClick={() => setShowLogoutConfirm(true)}
        className="w-full flex items-center space-x-3 px-4 py-3 text-black border border-gray-300 rounded-lg hover:bg-red-50 hover:border-red-400 hover:text-red-600 transition-colors duration-200"
      >
        <FaSignOutAlt className="text-xl" />
        <span className="font-medium">Logout</span>
      </button>
    </div>

  </div>
</aside>

      {/* ===== LOGOUT CONFIRMATION MODAL ===== */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-80 max-w-[90vw] text-center animate-fade-in">
            <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
              <FaSignOutAlt className="text-red-500 text-xl" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Logout</h3>
            <p className="text-sm text-gray-500 mb-6">Are you sure you want to log out?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 px-4 py-2.5 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-2.5 text-sm font-medium rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
