import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'system';

interface SettingsState {
  theme: Theme;
  currency: string;
  hasSeenOnboarding: boolean;
  setTheme: (theme: Theme) => void;
  setCurrency: (currency: string) => void;
  setHasSeenOnboarding: (seen: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'system',
      currency: 'INR',
      hasSeenOnboarding: false,

      setTheme: (theme) => set({ theme }),
      setCurrency: (currency) => set({ currency }),
      setHasSeenOnboarding: (hasSeenOnboarding) => set({ hasSeenOnboarding }),
    }),
    {
      name: 'money-manager-settings',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
