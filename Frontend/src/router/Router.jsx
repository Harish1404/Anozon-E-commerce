import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
<<<<<<< HEAD
=======
import withLoading from '../hoc/withLoading';
>>>>>>> 5d6140282c6fc95b0436535f73c9e902ec8c4c20
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';
import ProductList from '../pages/ProductList';
import ProductDetails from '../pages/ProductDetails';
import Cart from '../pages/Cart';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import AdminDashboard from '../pages/AdminDashboard';
<<<<<<< HEAD
import AiChatbot from '../pages/AiChabot';

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
=======

const LoadingWrapper = withLoading(({ children }) => children);

const ProtectedRoute = ({ children }) => {
  const { isAuth, isLoading } = useAuth();
  return (
    <LoadingWrapper isLoading={isLoading}>
      {isAuth ? children : <Navigate to='/login' replace />}
    </LoadingWrapper>
  );
};

const AdminRoute = ({ children }) => {
  const { isAuth, isLoading, isAdmin } = useAuth();
  return (
    <LoadingWrapper isLoading={isLoading}>
      {!isAuth ? <Navigate to='/login' replace /> : !isAdmin() ? <Navigate to='/' replace /> : children}
    </LoadingWrapper>
  );
};

const PublicRoute = ({ children }) => {
  const { isAuth, isLoading } = useAuth();
  return (
    <LoadingWrapper isLoading={isLoading}>
      {isAuth ? <Navigate to='/' replace /> : children}
    </LoadingWrapper>
  );
>>>>>>> 5d6140282c6fc95b0436535f73c9e902ec8c4c20
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
<<<<<<< HEAD
        <Route path='/products/:id' element={<ProductDetails />} />
        <Route path='/chatbot' element={<AiChatbot />} />
=======
        <Route path='/product/:id' element={<ProductDetails />} />
>>>>>>> 5d6140282c6fc95b0436535f73c9e902ec8c4c20
      </Route>

      <Route element={<AdminRoute><MainLayout /></AdminRoute>}>
        <Route path='/admin' element={<AdminDashboard />} />
      </Route>

    <Route path='*' element={<Navigate to={isAuth ? '/' : '/login'} replace />} />
    </Routes>
  );
};

export default AppRouter;
