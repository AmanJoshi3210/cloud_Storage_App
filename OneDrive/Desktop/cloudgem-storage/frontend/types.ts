export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface FileItem {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  createdAt: string;
  ownerId: string;
}

export interface ApiError {
  message: string;
  statusCode?: number;
}