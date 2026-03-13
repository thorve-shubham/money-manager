import { makeRedirectUri, useAuthRequest } from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';

import { appConfig } from '@/config/env';
import { User } from '@/types/auth';
import { secureStorageService, STORAGE_KEYS } from './secure-storage-service';

WebBrowser.maybeCompleteAuthSession();

export function useGoogleAuth() {
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: appConfig.googleWebClientId,
    iosClientId: appConfig.googleIosClientId,
    androidClientId: appConfig.googleAndroidClientId,
  });

  return { request, response, promptAsync };
}

export const authService = {
  async getStoredUser(): Promise<User | null> {
    const stored = await secureStorageService.get(STORAGE_KEYS.USER);
    if (!stored) return null;
    try {
      return JSON.parse(stored) as User;
    } catch {
      return null;
    }
  },

  async storeUser(user: User): Promise<void> {
    await secureStorageService.set(STORAGE_KEYS.USER, JSON.stringify(user));
  },

  async clearUser(): Promise<void> {
    await secureStorageService.delete(STORAGE_KEYS.USER);
    await secureStorageService.delete(STORAGE_KEYS.AUTH_TOKEN);
  },
};
