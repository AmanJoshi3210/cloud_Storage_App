import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { Dashboard } from './components/Dashboard';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [authView, setAuthView] = useState<'login' | 'register'>('login');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
            <Loader2 className="h-10 w-10 text-primary-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Loading secure environment...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Dashboard />;
  }

  return authView === 'login' ? (
    <Login onRegisterClick={() => setAuthView('register')} />
  ) : (
    <Register onLoginClick={() => setAuthView('login')} />
  );
};

export default App;