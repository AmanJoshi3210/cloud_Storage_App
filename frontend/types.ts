export interface StoredFile {
  id: string;
  url: string;
  name: string;
  size: number;
  type: string;
  createdAt: number;
  tags?: string[];
  description?: string;
  width?: number;
  height?: number;
  userId?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  token?: string;
}

export interface CloudinaryConfig {
  cloudName: string;
  uploadPreset: string;
  apiKey?: string;
}

export type ViewMode = 'grid' | 'list';

export enum UploadStatus {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  ANALYZING = 'ANALYZING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export interface FileUploadState {
  file: File;
  preview: string;
  status: UploadStatus;
  progress: number;
  error?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}