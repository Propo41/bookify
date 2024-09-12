import { BottomNavigation, BottomNavigationAction, Box, IconButton, Paper, Stack, styled, Typography } from '@mui/material';
import MuiCard from '@mui/material/Card';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import ExitToAppRoundedIcon from '@mui/icons-material/ExitToAppRounded';
import TimeAdjuster from '../../components/TimeAdjuster';
import Grid from '@mui/material/Grid2';
import Dropdown from '../../components/Dropdown';
import LoadingButton from '@mui/lab/LoadingButton';
import toast from 'react-hot-toast';
import { capitalize } from 'lodash';
import EventCard from '../../components/EventCard';
import { populateTimeOptions } from '../../helpers/utility';

const isChromeExt = false;

const TopBar = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.grey[100],
  paddingTop: theme.spacing(1.5),
  paddingBottom: theme.spacing(1.5),
  paddingRight: theme.spacing(2),
  paddingLeft: theme.spacing(2),
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-end',
  textAlign: 'left',
}));

const Container = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  textAlign: 'center',
  paddingBottom: 0,
  gap: theme.spacing(2),
  maxHeight: '600px',
  height: '100%',
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
  maxHeight: '650px',
  height: '650px',
  [theme.breakpoints.up('sm')]: {
    maxWidth: '412px',
  },
  [theme.breakpoints.down('sm')]: {
    maxWidth: '390px',
  },
  boxShadow: 'none',
}));

const RootContainer = styled(Stack)(({ theme }) => ({
  marginTop: '10vh',
  textAlign: 'center',
  '&::before': {
    content: '""',
    display: 'block',
    position: 'absolute',
    zIndex: -1,
    inset: 0,
    backgroundImage: 'radial-gradient(at 50% 50%, #005192, #002644)',
    backgroundRepeat: 'no-repeat',
  },
}));

const TopNavigationBar = ({ title }: { title: string }) => {
  return (
    <TopBar>
      <Box>
        <Typography variant="h4">{title}</Typography>
      </Box>

      <IconButton
        aria-label="logout"
        size="medium"
        sx={[
          (theme) => ({
            bgcolor: theme.palette.primary.main,
            borderRadius: 1,
            color: theme.palette.common.white,
            boxShadow: 'none',
            '&:hover': {
              boxShadow: 'none',
              backgroundColor: theme.palette.primary.light,
            },
          }),
        ]}
      >
        <ExitToAppRoundedIcon />
      </IconButton>
    </TopBar>
  );
};

const BookRoomView = () => {
  const [loading, setLoading] = useState(false);
  const [timeOptions, setTimeOptions] = useState<string[]>([]);

  useEffect(() => {
    const { options, selected } = populateTimeOptions();
    setTimeOptions(options);
  }, []);

  function handleClick() {
    setLoading(!loading);
  }

  return (
    <Box>
      <Grid container spacing={1} columns={16} px={2} mt={3}>
        <Grid size={8}>
          <Dropdown options={timeOptions} />
          <Typography
            variant="subtitle1"
            sx={[
              (theme) => ({
                color: theme.palette.grey[400],
                fontStyle: 'italic',
              }),
            ]}
          >
            Start time
          </Typography>
        </Grid>
        <Grid size={8}>
          <TimeAdjuster incrementBy={15} minAmount={15} decorator={'m'} />
          <Typography
            variant="subtitle1"
            sx={[
              (theme) => ({
                color: theme.palette.grey[400],
                fontStyle: 'italic',
              }),
            ]}
          >
            Duration
          </Typography>
        </Grid>
      </Grid>

      <Grid container spacing={1} columns={16} px={2} mt={2}>
        <Grid size={8}>
          <TimeAdjuster incrementBy={1} minAmount={1} />
          <Typography
            variant="subtitle1"
            sx={[
              (theme) => ({
                color: theme.palette.grey[400],
                fontStyle: 'italic',
              }),
            ]}
          >
            Capacity
          </Typography>
        </Grid>
        <Grid size={8}>
          <Dropdown options={['F1']} />
          <Typography
            variant="subtitle1"
            sx={[
              (theme) => ({
                color: theme.palette.grey[400],
                fontStyle: 'italic',
              }),
            ]}
          >
            Floor
          </Typography>
        </Grid>
      </Grid>

      <Box
        sx={{
          mx: 2,
          mt: 2,
        }}
      >
        <LoadingButton
          color="primary"
          onClick={handleClick}
          fullWidth
          loading={loading}
          loadingPosition="center"
          variant="contained"
          disableElevation
          sx={[
            (theme) => ({
              py: 2.5,
              boxShadow: 'none',
            }),
          ]}
        >
          <Typography variant="h6">Book</Typography>
        </LoadingButton>
      </Box>
    </Box>
  );
};

const MyEventsView = () => {
  const array = Array.from({ length: 2 }, (_, index) => `Item ${index + 1}`);

  return (
    <Box>
      {array.map((_, i) => (
        <EventCard
          key={i}
          sx={{
            mx: 2,
            mt: 2,
            mb: i === array.length - 1 ? 3 : 0,
          }}
        />
      ))}
    </Box>
  );
};

const SettingsView = () => {
  return <Box mt={4}>Coming soon!</Box>;
};

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

const Home = () => {
  const navigate = useNavigate();

  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const common = (
    <Box
      ref={ref}
      sx={{
        flexGrow: 1,
        overflowY: 'auto',
        paddingBottom: '56px',
      }}
    >
      <TopNavigationBar title={tabs[value].title} />
      {tabs[value].component}

      <Paper
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          width: '100%',
          boxShadow: 'none',
          border: 'none',
          backgroundColor: 'transparent',
        }}
      >
        <BottomNavigation
          value={value}
          onChange={(event, newValue) => {
            console.log(newValue);
            setValue(newValue);
          }}
          sx={[
            (theme) => ({
              backgroundColor: theme.palette.grey[100],
              borderRadius: 10,
              mx: 2,
              mb: 1,
              overflow: 'hidden',
            }),
          ]}
        >
          <BottomNavigationAction icon={<HomeRoundedIcon />} />
          <BottomNavigationAction icon={<CalendarMonthRoundedIcon />} />
          <BottomNavigationAction icon={<SettingsRoundedIcon />} />
        </BottomNavigation>
      </Paper>
    </Box>
  );

  if (!isChromeExt) {
    return (
      <RootContainer direction="column" justifyContent="space-between">
        <Card variant="outlined">{common}</Card>
      </RootContainer>
    );
  }
  return <Container>{common}</Container>;
};

export default Home;
