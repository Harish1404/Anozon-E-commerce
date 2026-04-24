import { useAuth } from './context/AuthContext';
import AppRouter from './router/Router';
<<<<<<< HEAD
=======
import withLoading from './hoc/withLoading';

const AppWithLoading = withLoading(AppRouter);
>>>>>>> 5d6140282c6fc95b0436535f73c9e902ec8c4c20

function App() {
  const { isLoading } = useAuth();

<<<<<<< HEAD
  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen bg-gray-200 dark:bg-gray-900'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
          <p className='text-gray-600 dark:text-gray-400'>Loading...</p>
        </div>
      </div>
    );
  }

  return <AppRouter />;
=======
  return <AppWithLoading isLoading={isLoading} />;
>>>>>>> 5d6140282c6fc95b0436535f73c9e902ec8c4c20
}

export default App;
