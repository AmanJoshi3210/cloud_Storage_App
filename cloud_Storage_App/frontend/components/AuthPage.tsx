import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Button } from './Button';
import { Input } from './Input';
import { Cloud, Lock, Mail, User as UserIcon, AlertCircle, ArrowRight } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let response;
      if (isLogin) {
        response = await api.auth.login(formData.email, formData.password);
      } else {
        response = await api.auth.register(formData.name, formData.email, formData.password);
      }
      login(response.user, response.token);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
       <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col">
          <div className="p-8 bg-blue-600 text-white text-center">
              <div className="inline-flex p-3 bg-white/10 rounded-xl mb-4">
                  <Cloud size={32} />
              </div>
              <h1 className="text-2xl font-bold">Welcome to CloudGem</h1>
              <p className="text-blue-100 mt-2 text-sm">AI-Powered Secure Cloud Storage</p>
          </div>

          <div className="p-8 flex-1">
              <div className="flex gap-4 mb-8 p-1 bg-slate-100 rounded-lg">
                  <button 
                    onClick={() => setIsLogin(true)}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${isLogin ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Log In
                  </button>
                  <button 
                    onClick={() => setIsLogin(false)}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${!isLogin ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Sign Up
                  </button>
              </div>

              {error && (
                  <div className="mb-6 bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2">
                      <AlertCircle size={16} />
                      {error}
                  </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                  {!isLogin && (
                      <div className="relative">
                          <UserIcon className="absolute left-3 top-3 text-slate-400" size={18} />
                          <Input 
                            placeholder="Full Name" 
                            className="pl-10"
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                            required
                          />
                      </div>
                  )}
                  <div className="relative">
                      <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
                      <Input 
                        type="email" 
                        placeholder="Email Address" 
                        className="pl-10"
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                        required
                      />
                  </div>
                  <div className="relative">
                      <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
                      <Input 
                        type="password" 
                        placeholder="Password" 
                        className="pl-10"
                        value={formData.password}
                        onChange={e => setFormData({...formData, password: e.target.value})}
                        required
                      />
                  </div>

                  <Button type="submit" className="w-full mt-4" size="lg" isLoading={loading}>
                      {isLogin ? 'Log In' : 'Create Account'} <ArrowRight size={18} className="ml-2" />
                  </Button>
              </form>
              
              <div className="mt-6 text-center">
                  <p className="text-xs text-slate-400">
                      By continuing, you agree to our Terms of Service and Privacy Policy.
                  </p>
              </div>
          </div>
       </div>
    </div>
  );
};