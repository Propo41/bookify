export interface CacheService {
  saveToCache(key: string, val: string): Promise<void>;
  getFromCache(key: string): Promise<string | null>;
  removeFromCache(key: string): Promise<void>;
}

class WebCacheService implements CacheService {
  getFromCache(key: string): Promise<string | null> {
    return new Promise<string | null>((resolve, reject) => {
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
    return new Promise<void>((resolve, reject) => {
      window.localStorage.removeItem(key);
      resolve();
    });
  }

  saveToCache(key: string, val: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      window.localStorage.setItem(key, val);
      resolve();
    });
  }
}

class ChromeCacheService implements CacheService {
  async saveToCache(key: string, val: string): Promise<void> {
    await chrome.storage.sync.set({ [key]: val });
  }

  async getFromCache(key: string): Promise<string | null> {
    const item = await chrome.storage.sync.get('access_token');
    console.log('token from storage api: ', item['access_token']);
    const data = item['access_token'];

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
    const isChrome = process.env.REACT_APP_ENVIRONMENT === 'chrome';
    if (isChrome) {
      return new ChromeCacheService();
    } else {
      return new WebCacheService();
    }
  }
}
