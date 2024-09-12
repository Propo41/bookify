import { useMemo } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import colorSchemes from './primitives/colorSchemes';
import typography from './primitives/typography';
import shape from './primitives/shape';
import componentsOverride from './components';

interface AppThemeProps {
  children: React.ReactNode;
}

export default function AppTheme({ children }: AppThemeProps) {
  const theme = useMemo(() => {
    return createTheme({
      colorSchemes,
      typography,
      shape,
      cssVariables: {
        colorSchemeSelector: 'data-mui-color-scheme',
        cssVarPrefix: 'bookify',
      },
    });
  }, []);

  theme.components = componentsOverride();
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
