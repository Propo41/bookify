import { Route, Routes, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import AppTheme from './theme/AppTheme';
import { Toaster } from 'react-hot-toast';
import { FONT_PRIMARY } from './theme/primitives/typography';
import { useEffect } from 'react';
import { handleOAuthCallback } from './helpers/api';

function OAuth() {
  const navigate = useNavigate();

  useEffect(() => {
    const url = new URL(window.location.href);
    const code = url.searchParams.get('code');

    if (code) {
      handleOAuthCallback(code);
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
