import toast from 'react-hot-toast';
import { CacheService, CacheServiceFactory } from './cache';

const cacheService: CacheService = CacheServiceFactory.getCacheService();

export const SCOPES = [
  'https://www.googleapis.com/auth/admin.directory.resource.calendar.readonly',
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
];

export async function handleOAuthCallback(code: string) {
  try {
    const res = await makeRequest('/oauth2callback', 'POST', { code });
    console.log('Access Token:', res.accessToken);
    if (res?.accessToken) {
      await cacheService.saveToCache('access_token', res.accessToken);
    }
  } catch (error) {
    console.error('Error:', error);
  }

  window.location.href = '/';
}

export async function makeRequest(path: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE', body?: any, params?: any) {
  const token = await cacheService.getFromCache('access_token');
  console.log('making request with ', token);

  try {
    let url = `${process.env.REACT_APP_BACKEND_ENDPOINT}${path}`;
    if (params) {
      const queryParams = new URLSearchParams(params).toString();
      url += `?${queryParams}`;
    }

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body || undefined),
    });

    console.log(res);

    if (res.status === 429) {
      toast.error(res.statusText);
      return null;
    }

    if (res.status === 401) {
      await logout();
      return null;
    }

    if (res) {
      return await res.json();
    }

    return null;
  } catch (error) {
    console.error('Error:', error);
    // alert(error.message || 'Something went wrong while making the request');
    return null;
  }
}

export async function logout() {
  await makeRequest('/logout', 'POST');
  await cacheService.removeFromCache('access_token');
  await cacheService.removeFromCache('floors');
  await cacheService.removeFromCache('floor');

  window.location.reload();
}

export function login() {
  const scopes = SCOPES.join(' ').trim();
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.REACT_APP_CLIENT_ID}&redirect_uri=${process.env.REACT_APP_REDIRECT_URI}&response_type=code&scope=${scopes}&access_type=offline`;
  window.location.href = authUrl;
}
