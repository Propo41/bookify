import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import AppTheme from './theme/AppTheme';
import { Toaster } from 'react-hot-toast';
import { FONT_PRIMARY } from './theme/primitives/typography';

function App() {
  return (
    <AppTheme>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sign-in" element={<Login />} />
        <Route path="/my-events" element={<Home />} />
        <Route path="/settings" element={<Home />} />
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
