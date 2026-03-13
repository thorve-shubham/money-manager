export interface User {
  id: string;
  googleId: string | null;
  email: string;
  name: string;
  avatarUrl: string | null;
  createdAt: number;
  updatedAt: number;
}

export const MOCK_USER: User = {
  id: 'dev-user-001',
  googleId: null,
  email: 'dev@moneymanager.app',
  name: 'Dev User',
  avatarUrl: null,
  createdAt: Date.now(),
  updatedAt: Date.now(),
};
