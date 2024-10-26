import { Route, Routes, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import AppTheme from './theme/AppTheme';
import { Toaster } from 'react-hot-toast';
import { FONT_PRIMARY } from './theme/primitives/typography';
import { useEffect } from 'react';
import { ROUTES } from './config/routes';
import { CacheService, CacheServiceFactory } from './helpers/cache';
import Api from './api/api';
import { useColorScheme } from '@mui/material';

// only used for the web version
// for chrome extension, a different oauth flow is used using the chrome api
function OAuth() {
  const navigate = useNavigate();

  useEffect(() => {
    const url = new URL(window.location.href);
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');

    if (error) {
      navigate(ROUTES.signIn, { state: { message: error } });
      return;
    }

    if (code) {
      new Api().handleOAuthCallback(code).then(async (res) => {
        if (!res) return;

        const { status, message, data } = res;
        if (status !== 'success') {
          navigate(ROUTES.signIn, { state: { message: message || 'Something went wrong' } });
          return;
        }

        if (data?.accessToken) {
          console.log('Access Token:', data?.accessToken);
          const cacheService: CacheService = CacheServiceFactory.getCacheService();
          await cacheService.save('access_token', data.accessToken);
          navigate(ROUTES.home);
        }
      });
    }
  }, [navigate]);

  return <></>;
}

function App() {
  const { mode, setMode } = useColorScheme();
  const api = new Api();
  const navigate = useNavigate();

  useEffect(() => {
    if (mode) {
      setMode('light');
    }
  }, []);

  useEffect(() => {
    api.validateSession().then((res) => {
      if (res?.redirect) {
        navigate(ROUTES.signIn);
      }
    });
  }, []);

  return (
    <AppTheme>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sign-in" element={<Login />} />
        <Route path="/oauthcallback" element={<OAuth />} />
      </Routes>
      <Toaster
        position="top-center"
        containerStyle={{
          fontFamily: FONT_PRIMARY,
        }}
        toastOptions={{
          error: {
            duration: 5000,
          },
        }}
      />
    </AppTheme>
  );
}

export default App;
