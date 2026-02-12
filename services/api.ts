import { mockBackend } from './mockBackend';
import { User, StoredFile } from '../types';

// Detect if we should use the mock backend (Default to TRUE for this preview environment)
const USE_MOCK_BACKEND = true; 
const API_URL = 'http://localhost:5000/api';

export const api = {
  auth: {
    register: async (name: string, email: string, password: string) => {
      if (USE_MOCK_BACKEND) return mockBackend.auth.register(name, email, password);
      
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data;
    },
    login: async (email: string, password: string) => {
      if (USE_MOCK_BACKEND) return mockBackend.auth.login(email, password);
      
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data;
    }
  },
  files: {
    list: async (token: string, userId: string) => {
      if (USE_MOCK_BACKEND) return mockBackend.files.list(userId);
      
      const res = await fetch(`${API_URL}/files`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data;
    },
    create: async (file: StoredFile, token: string, userId: string) => {
      if (USE_MOCK_BACKEND) return mockBackend.files.create(file, userId);
      
      const res = await fetch(`${API_URL}/files`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(file),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data;
    },
    delete: async (id: string, token: string, userId: string) => {
      if (USE_MOCK_BACKEND) return mockBackend.files.delete(id, userId);
      
      const res = await fetch(`${API_URL}/files/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete');
      return true;
    }
  }
};
