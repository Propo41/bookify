import { CacheService, CacheServiceFactory } from '@/helpers/cache';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Preferences {
  duration: number;
  seats: number;
  title?: string;
  floor?: string;
}

interface PreferencesContextType {
  preferences: Preferences;
  setPreferences: React.Dispatch<React.SetStateAction<Preferences>>;
}

interface PreferencesProviderProps {
  children: ReactNode;
}

const AppContext = createContext<PreferencesContextType | undefined>(undefined);

export const PreferencesProvider = ({ children }: PreferencesProviderProps) => {
  const cacheService: CacheService = CacheServiceFactory.getCacheService();
  const [preferences, setPreferences] = useState<Preferences>({
    duration: 30,
    seats: 1
  });

  useEffect(() => {
    const loadPreferences = async () => {
      const savedPreferences = await cacheService.get('preferences');
      setPreferences(savedPreferences ? JSON.parse(savedPreferences) : preferences);
    };

    loadPreferences();
  }, []);


  useEffect(() => {
    cacheService.save('preferences', JSON.stringify(preferences));
  }, [preferences]);

  return (
    <AppContext.Provider value={{ preferences, setPreferences }}>
      {children}
    </AppContext.Provider>
  );
};

export const usePreferences = () => useContext(AppContext)!;
