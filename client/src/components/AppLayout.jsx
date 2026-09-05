import React, { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Boxes,
  Palette,
  History,
  ShoppingCart,
  Plus,
  LogOut,
  Menu,
  X,
  User,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AddItemModal from './AddItemModal';

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [defaultItemType, setDefaultItemType] = useState('RAW_MATERIAL');

  // Close mobile menu when navigating
  const closeMobileMenu = () => setMobileMenuOpen(false);

  const handleOpenAddItem = (type = 'RAW_MATERIAL') => {
    // If user is on /finished-products, default to FINISHED_PRODUCT
    if (location.pathname === '/finished-products') {
      setDefaultItemType('FINISHED_PRODUCT');
    } else {
      setDefaultItemType(type);
    }
    setIsAddItemModalOpen(true);
    closeMobileMenu();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/raw-materials', label: 'Raw Materials', icon: Boxes },
    { to: '/finished-products', label: 'Finished Products', icon: Palette },
    { to: '/history', label: 'Stock History', icon: History },
    { to: '/purchase-list', label: 'Purchase List', icon: ShoppingCart },
  ];

  return (
    <div className="app-container">
      {/* Mobile Top Header */}
      <header className="mobile-header">
        <div className="mobile-header-left">
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <span className="mobile-brand-title">Reshma's Art Gallery</span>
        </div>
        <button
          className="btn btn-primary btn-sm mobile-add-btn"
          onClick={() => handleOpenAddItem()}
        >
          <Plus size={16} />
          <span>Add</span>
        </button>
      </header>

      {/* Desktop & Mobile Drawer Sidebar */}
      <aside className={`app-sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-logo-circle">🎨</div>
          <div className="brand-text">
            <h1>Reshma's Art Gallery</h1>
            <p>Inventory System</p>
          </div>
        </div>

        <div className="sidebar-action-wrap">
          <button
            className="btn btn-primary btn-block add-item-main-btn"
            onClick={() => handleOpenAddItem()}
          >
            <Plus size={18} />
            <span>+ Add Item</span>
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  `nav-link ${isActive ? 'nav-link-active' : ''}`
                }
              >
                <Icon size={20} className="nav-icon" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile-widget">
            <div className="user-avatar">
              <User size={18} />
            </div>
            <div className="user-info">
              <span className="user-name">{user?.name || 'Administrator'}</span>
              <span className="user-role">{user?.email || 'admin'}</span>
            </div>
          </div>
          <button
            className="btn btn-outline-danger btn-block logout-btn"
            onClick={handleLogout}
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Backdrop for Mobile Menu */}
      {mobileMenuOpen && (
        <div className="mobile-backdrop" onClick={closeMobileMenu}></div>
      )}

      {/* Main Content Viewport */}
      <main className="app-main-content">
        <Outlet context={{ openAddItem: handleOpenAddItem }} />
      </main>

      {/* Global Add Item Modal */}
      <AddItemModal
        isOpen={isAddItemModalOpen}
        onClose={() => setIsAddItemModalOpen(false)}
        defaultType={defaultItemType}
        onItemAdded={() => {
          // Trigger custom event so active pages refresh their data
          window.dispatchEvent(new Event('inventoryUpdated'));
        }}
      />
    </div>
  );
}
