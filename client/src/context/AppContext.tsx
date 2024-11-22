import Api from '@/api/api';
import { CacheService, CacheServiceFactory } from '@/helpers/cache';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AppProviderStates {
  maxSeatCap: number;
}

interface AppContextType {
  appState: AppProviderStates;
}

interface AppProviderProps {
  children: ReactNode;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: AppProviderProps) => {
  const cacheService: CacheService = CacheServiceFactory.getCacheService();
  const [appState, setAppState] = useState<AppProviderStates>({
    maxSeatCap: 0,
  });
  const api = new Api();

  useEffect(() => {
    const loadMaxSeats = async () => {
      let maxSeats: string | null = await cacheService.get('max_seat_capacity');
      if (!maxSeats) {
        const res = await api.getMaxSeatCount();
        if (res?.data) {
          maxSeats = String(res.data);
          await cacheService.save('max_seat_capacity', maxSeats);
        }
      }

      setAppState({ maxSeatCap: Number(maxSeats) || 0 });
    };

    loadMaxSeats();
  }, []);

  return <AppContext.Provider value={{ appState }}>{children}</AppContext.Provider>;
};

export const useAppState = () => useContext(AppContext)!;
