import { secrets } from './secrets';

export const baseUrl = secrets.appEnvironment === 'chrome' ? '/index.html' : '';

export const ROUTES = {
  signIn: `/sign-in`,
  home: `/`,
  myEvents: `/my-events`,
  settings: `/settings`,
};

console.log(ROUTES);
