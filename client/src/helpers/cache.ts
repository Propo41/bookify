import { secrets } from '../config/secrets';

type CacheItems = 'access_token' | 'floor' | 'floors' | 'duration';
export interface CacheService {
  saveToCache(key: CacheItems, val: string): Promise<void>;
  getFromCache(key: CacheItems): Promise<string | null>;
  removeFromCache(key: CacheItems): Promise<void>;
}

class WebCacheService implements CacheService {
  getFromCache(key: string): Promise<string | null> {
    return new Promise<string | null>((resolve, _) => {
      const data = window.localStorage.getItem(key);
      if (!data) {
        resolve(null);
        return;
      }

      if (data === 'undefined' || data.trim() === '') {
        resolve(null);
        return;
      }

      resolve(data);
    });
  }

  removeFromCache(key: string): Promise<void> {
    return new Promise<void>((resolve, _) => {
      window.localStorage.removeItem(key);
      resolve();
    });
  }

  saveToCache(key: string, val: string): Promise<void> {
    return new Promise<void>((resolve, _) => {
      window.localStorage.setItem(key, val);
      resolve();
    });
  }
}

class ChromeCacheService implements CacheService {
  async saveToCache(key: string, val: string): Promise<void> {
    await chrome.storage.sync.set({ [key]: val });
  }

  async getFromCache(key: CacheItems): Promise<string | null> {
    const item = await chrome.storage.sync.get(key);
    console.log('token from storage api: ', item[key]);
    const data = item[key];

    if (!data) {
      return null;
    }

    if (data === 'undefined' || data.trim() === '') {
      return null;
    }

    return data;
  }

  async removeFromCache(key: string): Promise<void> {
    await chrome.storage.sync.remove(key);
  }
}

// service injector
export class CacheServiceFactory {
  static getCacheService(): CacheService {
    const isChrome = secrets.appEnvironment === 'chrome';
    if (isChrome && secrets.nodeEnvironment !== 'development') {
      return new ChromeCacheService();
    } else {
      return new WebCacheService();
    }
  }
}
