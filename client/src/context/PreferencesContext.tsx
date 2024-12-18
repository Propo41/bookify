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

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export const PreferencesProvider = ({ children }: PreferencesProviderProps) => {
  const cacheService: CacheService = CacheServiceFactory.getCacheService();
  const [preferences, setPreferences] = useState<Preferences>({
    duration: 30,
    seats: 1
  });

  useEffect(() => {
    const loadPreferences = async () => {
      const savedPreferences = await cacheService.get('preferences');
      if (savedPreferences) {
        const parsedPref = JSON.parse(savedPreferences);
        if (parsedPref.duration !== preferences.duration && parsedPref.seats !== preferences.seats) {
          setPreferences(parsedPref);
        }
      }
    };

    loadPreferences();
  }, []);


  useEffect(() => {
    cacheService.save('preferences', JSON.stringify(preferences));
  }, [preferences]);

  return (
    <PreferencesContext.Provider value={{ preferences, setPreferences }}>
      {children}
    </PreferencesContext.Provider>
  );
};

export const usePreferences = () => useContext(PreferencesContext)!;
