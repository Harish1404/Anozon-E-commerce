import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import withLoading from '../hoc/withLoading';
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';
import ProductList from '../pages/ProductList';
import ProductDetails from '../pages/ProductDetails';
import Cart from '../pages/Cart';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import AdminDashboard from '../pages/AdminDashboard';

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
