import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Router } from './components/Router';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Dashboard } from './pages/Dashboard';
import { Analytics } from './pages/Analytics';
import { Settings } from './pages/Settings';

const AppContent = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <Router
        routes={[
          { path: '/login', component: <Login /> },
          { path: '/signup', component: <Signup /> },
          { path: '/', component: <Login /> },
        ]}
      />
    );
  }

  return (
    <Router
      routes={[
        { path: '/dashboard', component: <Dashboard /> },
        { path: '/analytics', component: <Analytics /> },
        { path: '/settings', component: <Settings /> },
        { path: '/', component: <Dashboard /> },
      ]}
    />
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
