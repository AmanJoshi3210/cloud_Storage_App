import { User, StoredFile } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Simulating Database in LocalStorage
const DB_USERS = 'cloudgem_db_users';
const DB_FILES = 'cloudgem_db_files';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const getUsers = (): User[] => JSON.parse(localStorage.getItem(DB_USERS) || '[]');
const saveUsers = (users: User[]) => localStorage.setItem(DB_USERS, JSON.stringify(users));

const getFiles = (): StoredFile[] => JSON.parse(localStorage.getItem(DB_FILES) || '[]');
const saveFiles = (files: StoredFile[]) => localStorage.setItem(DB_FILES, JSON.stringify(files));

export const mockBackend = {
  auth: {
    register: async (name: string, email: string, password: string) => {
      await delay(800);
      const users = getUsers();
      if (users.find(u => u.email === email)) throw new Error('Email already exists');
      
      const newUser = { id: uuidv4(), name, email, password }; // Note: Storing password plain text only in Mock!
      users.push(newUser);
      saveUsers(users);
      
      return { user: { id: newUser.id, name, email }, token: 'mock-jwt-token-' + newUser.id };
    },
    login: async (email: string, password: string) => {
      await delay(800);
      const users = getUsers();
      const user = users.find(u => u.email === email && (u as any).password === password);
      
      if (!user) throw new Error('Invalid email or password');
      return { user: { id: user.id, name: user.name, email: user.email }, token: 'mock-jwt-token-' + user.id };
    }
  },
  files: {
    list: async (userId: string) => {
      await delay(400);
      const files = getFiles();
      return files.filter(f => f.userId === userId).sort((a, b) => b.createdAt - a.createdAt);
    },
    create: async (fileData: StoredFile, userId: string) => {
      await delay(300);
      const files = getFiles();
      const newFile = { ...fileData, id: uuidv4(), userId };
      files.push(newFile);
      saveFiles(files);
      return newFile;
    },
    delete: async (fileId: string, userId: string) => {
      await delay(300);
      const files = getFiles();
      const filtered = files.filter(f => !(f.id === fileId && f.userId === userId));
      saveFiles(filtered);
      return true;
    }
  }
};
