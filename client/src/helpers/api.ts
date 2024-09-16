import toast from 'react-hot-toast';
import { CacheService, CacheServiceFactory } from './cache';
import { secrets } from '../config/secrets';

const cacheService: CacheService = CacheServiceFactory.getCacheService();

export const SCOPES = [
  'https://www.googleapis.com/auth/admin.directory.resource.calendar.readonly',
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
];

export async function handleOAuthCallback(code: string) {
  const res = await makeRequest('/oauth2callback', 'POST', { code, redirectUrl: secrets.oAuthRedirectUrl }, null, false);
  return res;
}

interface IResponse {
  status?: number;
  errorMessage?: string;
  data?: any;
  redirect?: boolean;
}

export async function makeRequest(path: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE', body?: any, params?: any, requiresToken = true): Promise<IResponse> {
  const token = await cacheService.getFromCache('access_token');
  if (requiresToken && !token) {
    return {
      status: 400,
      errorMessage: 'An access token is required.',
    };
  }

  try {
    let url = `${secrets.backendEndpoint}${path}`;
    if (params) {
      const queryParams = new URLSearchParams(params).toString();
      url += `?${queryParams}`;
    }

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'X-Redirect-URL': secrets.oAuthRedirectUrl || '',
      },
      body: JSON.stringify(body || undefined),
    });

    const data = await res.json();
    if (res.status === 429) {
      toast.error(res.statusText);
      return {
        status: res.status,
        errorMessage: 'Too many requests',
      };
    }

    if (res.status === 401) {
      await cacheService.removeFromCache('access_token');
      return {
        status: res.status,
        errorMessage: res.statusText,
        redirect: true,
      };
    }

    return {
      status: res.status,
      errorMessage: '',
      data: data,
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      status: 500,
      errorMessage: 'Something went wrong while making the request',
    };
  }
}

export async function logout() {
  await makeRequest('/logout', 'POST');
  await cacheService.removeFromCache('access_token');
  await cacheService.removeFromCache('floors');
  await cacheService.removeFromCache('floor');
}

export async function loginChrome() {
  const scopes = SCOPES.join(' ').trim();
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${secrets.clientId}&redirect_uri=${secrets.oAuthRedirectUrl}&response_type=code&scope=${scopes}&access_type=offline`;

  return handleChromeOauthFlow(authUrl);
}

export async function login() {
  const scopes = SCOPES.join(' ').trim();
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${secrets.clientId}&redirect_uri=${secrets.oAuthRedirectUrl}&response_type=code&scope=${scopes}&access_type=offline`;

  window.location.href = authUrl;
}

async function handleChromeOauthFlow(authUrl: string) {
  const redirectUrl = await new Promise<boolean>((resolve, _) => {
    chrome.identity.launchWebAuthFlow(
      {
        url: authUrl,
        interactive: true,
      },
      async function (redirectUrl) {
        if (chrome.runtime.lastError || !redirectUrl) {
          toast.error("Couldn't complete the OAuth flow");
          console.error(chrome.runtime.lastError);
        } else {
          console.log('Redirect URL:', redirectUrl);
          const url = new URL(redirectUrl);

          const code = url.searchParams.get('code');
          console.log(code);

          try {
            if (code) {
              await handleOAuthCallback(code);
              resolve(true);
            }
          } catch (error: any) {
            console.error(error);
            resolve(false);
          }
        }
      },
    );
  });

  return redirectUrl;
}
