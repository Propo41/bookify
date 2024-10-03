import { Box, LinearProgress, Stack, styled } from '@mui/material';
import MuiCard from '@mui/material/Card';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { capitalize } from 'lodash';
import { CacheService, CacheServiceFactory } from '../../helpers/cache';
import TopNavigationBar from './TopNavigationBar';
import { ROUTES } from '../../config/routes';
import { isMobile } from 'react-device-detect';
import BookRoomView from './BookRoomView';
import MyEventsView from './MyEventsView';
import SettingsView from './SettingsView';
import { secrets } from '../../config/secrets';

const isChromeExt = secrets.appEnvironment === 'chrome';
// const isChromeExt = true;

const cacheService: CacheService = CacheServiceFactory.getCacheService();

const Container = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  textAlign: 'center',
  paddingBottom: 0,
  gap: theme.spacing(2),
  height: '100vh',
}));

const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexGrow: 1,
  position: 'relative',
  justifyContent: 'flex-end',
  flexDirection: 'column',
  alignSelf: 'center',
  textAlign: 'center',
  width: '100%',
  maxHeight: '750px',
  height: '750px',
  [theme.breakpoints.up('sm')]: {
    maxWidth: '412px',
  },
  [theme.breakpoints.down('sm')]: {
    maxWidth: '390px',
  },
  boxShadow: 'none',
}));

const RootContainer = styled(Stack)(({ theme }) => ({
  textAlign: 'center',
  backgroundImage: 'radial-gradient(at 50% 50%, #005192, #002644)',
  minHeight: '100vh',
  justifyContent: 'center',
}));

const tabs = [
  {
    title: capitalize('book room'),
    component: <BookRoomView />,
  },
  {
    title: capitalize('my events'),
    component: <MyEventsView />,
  },
  {
    title: capitalize('Settings'),
    component: <SettingsView />,
  },
];

export default function Home() {
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [tabIndex, setTabIndex] = useState(0);

  useEffect(() => {
    cacheService.get('access_token').then((token) => {
      if (!token) {
        navigate(ROUTES.signIn);
        return;
      }

      setLoading(false);
    });
  }, []);

  const handleTabChange = (newValue: number) => {
    setTabIndex(newValue);
  };

  const common = (
    <Box
      ref={ref}
      sx={{
        flexGrow: 1,
        overflowY: 'auto',
        paddingBottom: '56px',
      }}
    >
      <TopNavigationBar tabIndex={tabIndex} handleTabChange={handleTabChange} />
      {loading ? <LinearProgress /> : tabs[tabIndex].component}
    </Box>
  );

  // web view
  if (!isChromeExt && !isMobile) {
    return (
      <RootContainer direction="column" justifyContent="space-between">
        <Card variant="outlined">{common}</Card>
      </RootContainer>
    );
  }

  // chrome view
  return <Container>{common}</Container>;
}
