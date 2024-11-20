import { secrets } from './secrets';

export const baseUrl = secrets.appEnvironment === 'chrome' ? '/index.html' : '';

export const ROUTES = {
  signIn: `/sign-in`,
  home: `/`,
  settings: `/settings`,
  oauth: `/oauthcallback`,
};

console.log(ROUTES);
