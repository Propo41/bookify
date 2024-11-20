import { CacheService, CacheServiceFactory } from '@/helpers/cache';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Preferences {
  duration?: number;
  capacity?: number;
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
  const [preferences, setPreferences] = useState<Preferences>({});
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const loadPreferences = async () => {
      const savedPreferences = await cacheService.get('preferences');
      setPreferences(savedPreferences ? JSON.parse(savedPreferences) : {});
      setLoading(false)
    };

    setLoading(true)
    loadPreferences();
  }, []);


  useEffect(() => {
    cacheService.save('preferences', JSON.stringify(preferences));
  }, [preferences]);

  if (loading) {
    return <></>
  }

  return (
    <PreferencesContext.Provider value={{ preferences, setPreferences }}>
      {children}
    </PreferencesContext.Provider>
  );
};

export const usePreferences = () => useContext(PreferencesContext)!;
