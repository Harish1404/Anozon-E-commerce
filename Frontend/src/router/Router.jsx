import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../layouts/mainLayout';
import AuthLayout from '../layouts/authLayout';
import ProductList from '../pages/ProductList';
import ProductDetails from '../pages/ProductDetails';
import Cart from '../pages/Cart';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import AdminDashboard from '../pages/AdminDashboard';

const LoadingSpinner = () => (

  <div className='flex items-center justify-center min-h-screen'>
    <div className='text-center'>
      <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
      <p className='text-gray-600 dark:text-gray-400'>Loading...</p>
    </div>
  </div>
);

const ProtectedRoute = ({ children }) => {

  const { isAuth, isLoading } = useAuth();
  if (isLoading) return <LoadingSpinner />;
  return isAuth ? children : <Navigate to='/login' replace />;
};

const AdminRoute = ({ children }) => {
  const { isAuth, isLoading, isAdmin } = useAuth();
  if (isLoading) return <LoadingSpinner />;
  if (!isAuth) return <Navigate to='/login' replace />;
  if (!isAdmin()) return <Navigate to='/' replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { isAuth, isLoading } = useAuth();
  if (isLoading) return <LoadingSpinner />;
  return isAuth ? <Navigate to='/' replace /> : children;
};

const AppRouter = () => {
  const { isAuth } = useAuth();

  return (
    <Routes>
      <Route element={<PublicRoute><AuthLayout /></PublicRoute>}>
        <Route path='/login' element={<Login />} />
        <Route path='/signup' element={<Signup />} />
      </Route>

      <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route path='/' element={<ProductList />} />
        <Route path='/cart' element={<Cart />} />
        <Route path='/product/:id' element={<ProductDetails />} />
      </Route>

      <Route element={<AdminRoute><MainLayout /></AdminRoute>}>
        <Route path='/admin' element={<AdminDashboard />} />
      </Route>

      <Route path='*' element={<Navigate to={isAuth ? '/' : '/login'} replace />} />
    </Routes>
  );
};

export default AppRouter;
