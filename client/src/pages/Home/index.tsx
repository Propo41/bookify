import { Box, IconButton, LinearProgress, Stack, styled } from '@mui/material';
import MuiCard from '@mui/material/Card';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { capitalize } from 'lodash';
import { CacheService, CacheServiceFactory } from '@helpers/cache';
import TopNavigationBar from './TopNavigationBar';
import { ROUTES } from '@config/routes';
import BookRoomView from './BookRoomView';
import MyEventsView from './MyEventsView';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import SettingsView from './SettingsView';
import { Action, chromeBackground, isChromeExt } from '@helpers/utility';

const cacheService: CacheService = CacheServiceFactory.getCacheService();

const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexGrow: 1,
  position: 'relative',
  justifyContent: 'flex-end',
  flexDirection: 'column',
  alignSelf: 'center',
  textAlign: 'center',
  width: '100%',
  maxHeight: '550px',
  borderRadius: 20,
  boxShadow: '0 8px 20px 0 rgba(0,0,0,0.1)',
  background: 'linear-gradient(180deg, #FFFFFF 0%, rgba(255, 255, 255, 0.6) 100%)',
  border: 'none',
  [theme.breakpoints.up('sm')]: {
    maxWidth: '450px',
  },
  [theme.breakpoints.down('sm')]: {
    maxWidth: '390px',
  },
  zIndex: 1,
}));

const Container = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  textAlign: 'center',
  paddingBottom: 0,
  gap: theme.spacing(2),
  height: '100vh',
  ...chromeBackground,
  overflow: 'hidden',
  borderRadius: isChromeExt ? 0 : 'auto',
}));

const RootContainer = styled(Stack)(({ theme: _ }) => ({
  textAlign: 'center',
  minHeight: '100vh',
  justifyContent: 'center',
  position: 'relative',
  overflow: 'hidden',
  background: 'linear-gradient(to bottom right, #fff7e6, #e6fffa)',
  ...chromeBackground,
}));

const tabs = [
  {
    title: capitalize('book room'),
    component: (props?: any) => <BookRoomView {...props} />,
  },
  {
    title: capitalize('my events'),
    component: (props?: any) => <MyEventsView {...props} />,
  },
];

export default function Home() {
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const [settingsViewOpen, setSettingsViewOpen] = useState(false);

  useEffect(() => {
    cacheService.get('access_token').then((token) => {
      if (!token) {
        navigate(ROUTES.signIn);
        return;
      }

      setLoading(false);

      return () => {
        setRefresh(false);
      };
    });
  }, []);

  const onAction = (action: Action) => {
    if (action === Action.ROOM_BOOKED) {
      setTabIndex(1);
    }
  };

  const handleTabChange = (newValue: number) => {
    setTabIndex(newValue);
  };

  const onSettingClick = () => {
    setSettingsViewOpen(true);
  };

  const handleSettingsClose = () => {
    setSettingsViewOpen(false);
  };

  const common = (
    <Box
      ref={ref}
      sx={{
        flexGrow: 1,
        overflowY: 'auto',
        paddingBottom: '56px',
        position: 'relative',
      }}
    >
      <Box
        display={'flex'}
        alignItems={'center'}
        sx={{
          zIndex: 100,
        }}
      >
        <TopNavigationBar
          sx={{
            pr: 1,
          }}
          tabIndex={tabIndex}
          handleTabChange={handleTabChange}
        />
        <Box
          sx={{
            borderRadius: 100,
            backgroundColor: 'white',
            py: 1,
            px: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            mr: 2,
          }}
        >
          <IconButton aria-label="settings" sx={{ mr: 0, backgroundColor: 'white' }} onClick={onSettingClick}>
            <SettingsRoundedIcon />
          </IconButton>
        </Box>
      </Box>

      {loading ? <LinearProgress /> : tabs[tabIndex].component({ onAction, refresh, setRefresh: (val: boolean) => setRefresh(val) })}
    </Box>
  );

  let innerComponent = common;

  if (settingsViewOpen) {
    innerComponent = <SettingsView open={settingsViewOpen} handleClose={handleSettingsClose} onSave={() => setRefresh(true)} />;
  }
  // web view
  if (!isChromeExt) {
    return (
      <RootContainer direction="column" justifyContent="space-between">
        <Card variant="outlined">{innerComponent}</Card>
      </RootContainer>
    );
  }

  // chrome view
  return <Container>{innerComponent}</Container>;
}
