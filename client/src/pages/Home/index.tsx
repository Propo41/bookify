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
  borderRadius: 20,
  boxShadow: '0 8px 20px 0 rgba(0,0,0,0.1)', // Adjusted for better visibility with transparent background
  background: 'linear-gradient(180deg, #FFFFFF 0%, rgba(255, 255, 255, 0.6) 100%)',
  border: 'none',
  [theme.breakpoints.up('sm')]: {
    maxWidth: '412px',
  },
  [theme.breakpoints.down('sm')]: {
    maxWidth: '390px',
  },
}));

const RootContainer = styled(Stack)(({ theme }) => ({
  textAlign: 'center',
  minHeight: '100vh',
  justifyContent: 'center',
  position: 'relative',
  overflow: 'hidden',
  background: 'linear-gradient(to bottom right, #ffffff, #fffbeb, #f0f9ff)',
  '&::before, &::after': {
    content: '""',
    position: 'absolute',
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    borderRadius: '50%',
    border: '8px solid rgba(255, 255, 255, 0.3)',
  },

  '&::before': {
    top: '25%',
    left: '25%',
    right: '25%',
    bottom: '25%',
    transform: 'rotate(-45deg)',
  },

  '&::after': {
    top: '33%',
    left: '33%',
    right: '-33%',
    bottom: '-33%',
    transform: 'rotate(12deg)',
  },
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
  if (!isChromeExt) {
    return (
      <RootContainer direction="column" justifyContent="space-between">
        <Card variant="outlined">{common}</Card>
      </RootContainer>
    );
  }

  // chrome view
  return <Container>{common}</Container>;
}
