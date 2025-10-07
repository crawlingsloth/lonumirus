import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../lib/auth';

export function HomePage() {
  const navigate = useNavigate();
  const user = getCurrentUser();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Redirect based on role
    switch (user.role) {
      case 'admin':
        navigate('/admin');
        break;
      case 'delivery':
        navigate('/delivery/batches');
        break;
      case 'customer':
        navigate('/customer/orders');
        break;
    }
  }, [user, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
