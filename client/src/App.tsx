import { Route, Routes, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import AppTheme from './theme/AppTheme';
import { Toaster } from 'react-hot-toast';
import { FONT_PRIMARY } from './theme/primitives/typography';
import { useEffect } from 'react';
import { handleOAuthCallback } from './helpers/api';
import { ROUTES } from './config/routes';
import { CacheService, CacheServiceFactory } from './helpers/cache';

// only used for the web version
// for chrome extension, a different oauth flow is used using the chrome api
function OAuth() {
  const navigate = useNavigate();

  useEffect(() => {
    const url = new URL(window.location.href);
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');

    if (error) {
      navigate(ROUTES.signIn, { state: { errorMessage: error } });
      return;
    }

    if (code) {
      handleOAuthCallback(code).then(async ({ data, status }) => {
        if (status !== 201 && status !== 200) {
          navigate(ROUTES.signIn, { state: { errorMessage: data.message || 'Something went wrong' } });
          return;
        }

        console.log('Access Token:', data.accessToken);
        if (data?.accessToken) {
          const cacheService: CacheService = CacheServiceFactory.getCacheService();
          await cacheService.saveToCache('access_token', data.accessToken);
          navigate(ROUTES.home);
        }
      });
    }
  }, [navigate]);

  return <></>;
}

function App() {
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
