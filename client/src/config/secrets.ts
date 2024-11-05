export const secrets = {
  nodeEnvironment: import.meta.env.NODE_ENV,
  appEnvironment: import.meta.env.REACT_APP_ENVIRONMENT,
  mockCalender: import.meta.env.REACT_APP_MOCK_CALENDER,
  clientId: import.meta.env.REACT_APP_CLIENT_ID,
  oAuthRedirectUrl: import.meta.env.REACT_APP_REDIRECT_URI,
  backendEndpoint: import.meta.env.REACT_APP_BACKEND_ENDPOINT,
  appSlogan: import.meta.env.REACT_APP_APP_SLOGAN,
  appTitle: import.meta.env.REACT_APP_APP_TITLE,
};

// todo: https://vite.dev/guide/env-and-mode.html
// process not defined
console.log(secrets);
