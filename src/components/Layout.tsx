import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCurrentUser, logout, switchRole } from '../lib/auth';
import type { UserRole } from '../types';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showDemoHelp, setShowDemoHelp] = useState(false);
  const navigate = useNavigate();
  const user = getCurrentUser();

  const handleRoleSwitch = (role: UserRole) => {
    switchRole(role);
    setShowRoleSwitcher(false);
    window.location.href = '#/'; // Force reload to update UI
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return <>{children}</>;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-50 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link to="/" className="text-xl font-bold text-gray-900">
                Lonumirus
              </Link>
              <span className="text-sm text-gray-500">Chilli Paste Delivery</span>
            </div>

            <div className="flex items-center space-x-4">
              {/* Demo Help */}
              <button
                onClick={() => setShowDemoHelp(!showDemoHelp)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Demo Help
              </button>

              {/* Role Switcher */}
              <div className="relative">
                <button
                  onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
                  className="px-3 py-1 bg-gray-100 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-200"
                >
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </button>
                {showRoleSwitcher && (
                  <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg py-1 z-10">
                    <button
                      onClick={() => handleRoleSwitch('admin')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Admin
                    </button>
                    <button
                      onClick={() => handleRoleSwitch('delivery')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Delivery
                    </button>
                    <button
                      onClick={() => handleRoleSwitch('customer')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Customer
                    </button>
                  </div>
                )}
              </div>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
                >
                  <span className="text-sm">{user.name || user.email}</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main>{children}</main>

      {/* Demo Help Modal */}
      {showDemoHelp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold">Demo Help</h2>
              <button
                onClick={() => setShowDemoHelp(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-bold mb-2">Demo Credentials</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Admin: admin@example.com / demo123</li>
                  <li>Delivery: delivery@example.com / demo123</li>
                  <li>Customer: customer@example.com / demo123</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold mb-2">Quick Demo Flow</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Use the role switcher to try different views</li>
                  <li>As Customer: Create a new order, view your orders</li>
                  <li>As Admin: Manage boats, orders, users, and batches</li>
                  <li>As Delivery: View batches and mark orders as delivered</li>
                  <li>Try viewing public boat pages at /boats</li>
                  <li>Try printing manifests and labels from batch pages</li>
                </ol>
              </div>

              <div>
                <h3 className="font-bold mb-2">Features to Explore</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Boat gallery management with drag-and-drop reordering</li>
                  <li>Order management with status transitions</li>
                  <li>Batch creation for delivery runs</li>
                  <li>Print-friendly manifest and labels</li>
                  <li>Shareable order links (stub)</li>
                  <li>Offline support (PWA)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
