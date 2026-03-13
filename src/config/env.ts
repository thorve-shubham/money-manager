import Constants from 'expo-constants';

type AppEnv = 'development' | 'test' | 'production';

interface AppConfig {
  appEnv: AppEnv;
  skipAuth: boolean;
  apiUrl: string;
  googleWebClientId: string;
  googleIosClientId: string;
  googleAndroidClientId: string;
}

export const appConfig: AppConfig = {
  appEnv: (Constants.expoConfig?.extra?.appEnv ?? 'production') as AppEnv,
  skipAuth: Constants.expoConfig?.extra?.skipAuth ?? false,
  apiUrl: process.env.EXPO_PUBLIC_API_URL ?? '',
  googleWebClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '',
  googleIosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? '',
  googleAndroidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ?? '',
};

export const isDev = appConfig.appEnv === 'development';
export const isTest = appConfig.appEnv === 'test';
export const isProd = appConfig.appEnv === 'production';
