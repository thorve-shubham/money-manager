import { ConfigContext, ExpoConfig } from 'expo/config';

const isDev = process.env.EXPO_PUBLIC_APP_ENV === 'development';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: isDev ? 'MoneyMgr (Dev)' : 'Money Manager',
  slug: 'money-manager',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'moneymanager',
  userInterfaceStyle: 'automatic',
  ios: {
    icon: './assets/expo.icon',
    bundleIdentifier: 'com.moneymanager.app',
    supportsTablet: false,
  },
  android: {
    package: 'com.moneymanager.app',
    adaptiveIcon: {
      backgroundColor: '#E6F4FE',
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
  },
  web: {
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        backgroundColor: '#208AEF',
        android: {
          image: './assets/images/splash-icon.png',
          imageWidth: 76,
        },
      },
    ],
    'expo-sqlite',
    'expo-secure-store',
    'expo-sharing',
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    appEnv: process.env.EXPO_PUBLIC_APP_ENV ?? 'production',
    skipAuth: process.env.EXPO_PUBLIC_SKIP_AUTH === 'true',
    eas: {
      projectId: 'YOUR_EAS_PROJECT_ID',
    },
  },
});
