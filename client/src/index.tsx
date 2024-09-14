import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { StyledEngineProvider } from '@mui/material/styles';
import { secrets } from './config/secrets';

//  import the styles
if (secrets.appEnvironment === 'chrome') {
  import('./styles.css').then(() => {
    console.log('Web styles loaded');
  });
}

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <StyledEngineProvider injectFirst>
    <BrowserRouter basename={secrets.appEnvironment === 'chrome' ? '/index.html' : ''}>
      <App />
    </BrowserRouter>
  </StyledEngineProvider>,
);
