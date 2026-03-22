import { useAuth } from './context/AuthContext';
import AppRouter from './router/Router';
import withLoading from './hoc/withLoading';

const AppWithLoading = withLoading(AppRouter);

function App() {
  const { isLoading } = useAuth();

  return <AppWithLoading isLoading={isLoading} />;
}

export default App;
