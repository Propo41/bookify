import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  BottomNavigation,
  BottomNavigationAction,
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  styled,
  Typography,
} from '@mui/material';
import MuiCard from '@mui/material/Card';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import TimeAdjuster from '../../components/TimeAdjuster';
import Grid from '@mui/material/Grid2';
import Dropdown, { DropdownOption } from '../../components/Dropdown';
import LoadingButton from '@mui/lab/LoadingButton';
import { capitalize } from 'lodash';
import EventCard from '../../components/EventCard';
import { convertToLocaleTime, convertToRFC3339, createDropdownOptions, getTimeZoneString, populateTimeOptions } from '../../helpers/utility';
import { makeRequest } from '../../helpers/api';
import toast from 'react-hot-toast';
import AccessTimeFilledRoundedIcon from '@mui/icons-material/AccessTimeFilledRounded';
import ModeEditOutlineRoundedIcon from '@mui/icons-material/ModeEditOutlineRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import { ConferenceRoom, RoomResponse } from '../../helpers/types';
import { CacheService, CacheServiceFactory } from '../../helpers/cache';
import { secrets } from '../../config/secrets';
import TopNavigationBar from './TopNavigationBar';
import { ROUTES } from '../../config/routes';
import ChipInput from '../../components/ChipInput';
import StyledTextField from '../../components/StyledTextField';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

const isChromeExt = secrets.appEnvironment === 'chrome';
const roomChangeTimeFrame = 2;
const cacheService: CacheService = CacheServiceFactory.getCacheService();

interface Event {
  room?: string;
  eventId?: string;
  start?: string;
  end?: string;
  summary?: string;
  availableRooms?: DropdownOption[];
  roomEmail?: string;
  seats?: number;
  isEditable?: boolean;
  createdAt?: number;
}

interface FormData {
  startTime: string;
  duration: number;
  seats: number;
  floor: string;
  title?: string;
  attendees?: string[];
  conference?: boolean;
}

const CustomButton = styled(Button)(({ theme }) => ({
  boxShadow: 'none',
  '&:hover': {
    boxShadow: 'none',
  },
  '&:active': {
    boxShadow: 'none',
  },
  '&:focus': {
    boxShadow: 'none',
  },
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

const BookRoomView = () => {
  const [loading, setLoading] = useState(false);
  const [changeRoomLoading, setChangeRoomLoading] = useState(false);
  const [timeOptions, setTimeOptions] = useState<DropdownOption[]>([]);
  const [floorOptions, setFloorOptions] = useState<DropdownOption[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editRoom, setEditRoom] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<Event>({});
  const [requestedRoom, setRequestedRoom] = useState('');
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormData>({
    startTime: '',
    duration: 15,
    seats: 1,
    floor: '',
  });

  useEffect(() => {
    const options = populateTimeOptions();
    setTimeOptions(createDropdownOptions(options));

    const init = async (floors: string[]) => {
      setFloorOptions(createDropdownOptions(floors));

      const floor = await cacheService.getFromCache('floor');
      setFormData({
        ...formData,
        startTime: options[0],
        floor: floor || floors[0],
      });
    };

    cacheService.getFromCache('floors').then(async (floors) => {
      console.log(floors);

      if (floors) {
        await init(JSON.parse(floors));
      } else {
        makeRequest('/floors', 'GET').then(async (res) => {
          const { data, redirect } = res;
          if (redirect) {
            toast.error("Couldn't complete request. Redirecting to login page");
            setTimeout(() => {
              navigate(ROUTES.signIn);
            }, 2000);
          }

          if (data === null) {
            return;
          }

          await cacheService.saveToCache('floors', JSON.stringify(data));
          await init(data);
        });
      }
    });
  }, []);

  const handleInputChange = (id: string, value: string | number | string[] | boolean) => {
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));

    console.log(formData);
  };

  const handleRoomChange = (id: string, value: string) => {
    setRequestedRoom(value);
  };

  const onChangeRoomClick = async () => {
    if (currentEvent.roomEmail === requestedRoom) {
      toast.error('You have already booked this room');
      return;
    }

    if (currentEvent.createdAt) {
      console.log(Date.now() - currentEvent.createdAt);
    }

    if (currentEvent.createdAt && Date.now() - currentEvent.createdAt > roomChangeTimeFrame * 60 * 1000) {
      toast.error('Not possible to change the room at the moment');
      return;
    }

    setChangeRoomLoading(true);

    const { data, redirect } = await makeRequest('/room', 'PUT', {
      eventId: currentEvent.eventId,
      roomId: requestedRoom,
      requestedAt: new Date(),
    });

    if (redirect) {
      toast.error("Couldn't complete request. Redirecting to login page");
      setTimeout(() => {
        navigate(ROUTES.signIn);
      }, 2000);
    }

    console.log(data);

    if (data.error) {
      toast.error(data.message);
      setChangeRoomLoading(false);
      return;
    }

    setCurrentEvent({
      ...currentEvent,
      room: data.room,
      seats: data.seats,
      isEditable: false,
    });

    setChangeRoomLoading(false);
    toast.success('Room changed!');
  };

  async function onBookClick() {
    setLoading(true);
    const { startTime, duration, floor, seats, conference, attendees, title } = formData;

    const date = new Date(Date.now()).toISOString().split('T')[0];
    const formattedStartTime = convertToRFC3339(date, startTime);

    const { data, redirect } = await makeRequest('/room', 'POST', {
      startTime: formattedStartTime,
      duration: duration,
      seats: seats,
      floor: floor,
      timeZone: getTimeZoneString(),
      createConference: conference,
      title,
      attendees,
    });

    if (redirect) {
      toast.error("Couldn't complete request. Redirecting to login page");
      setTimeout(() => {
        navigate(ROUTES.signIn);
      }, 2000);
    }

    if (data.error) {
      toast.error(data.message);
      setLoading(false);
      return;
    }

    console.log('room booked: ', data);

    const { room, eventId, start, end, summary, seats: _seats, roomEmail, availableRooms } = data;
    setLoading(false);

    setCurrentEvent({
      isEditable: true,
      eventId,
      room,
      start: convertToLocaleTime(start),
      end: convertToLocaleTime(end),
      summary,
      roomEmail,
      seats: _seats,
      availableRooms: availableRooms.map((r: ConferenceRoom) => ({ value: r.email, text: `${r.name} (${r.seats})` })),
      createdAt: Date.now(),
    });

    setRequestedRoom(roomEmail);
    setDialogOpen(true);

    toast.success(`Room booked! You have ${roomChangeTimeFrame} minutes to change the room`);
  }

  return (
    <Box>
      <Grid container spacing={1} columns={16} px={2} mt={3}>
        <Grid size={8}>
          <Dropdown id="startTime" options={timeOptions} value={formData.startTime} onChange={handleInputChange} />
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
          <TimeAdjuster
            incrementBy={15}
            minAmount={15}
            decorator={'m'}
            value={formData.duration}
            onChange={(newValue) => handleInputChange('duration', newValue)}
          />
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
          <TimeAdjuster incrementBy={1} minAmount={1} value={formData.seats} onChange={(newValue) => handleInputChange('seats', newValue)} />
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
          <Dropdown id="floor" value={formData.floor} options={floorOptions} onChange={handleInputChange} />
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
          onClick={onBookClick}
          fullWidth
          loading={loading}
          loadingPosition="center"
          variant="contained"
          disableElevation
          sx={[
            (_) => ({
              py: 2.5,
              boxShadow: 'none',
            }),
          ]}
        >
          <Typography variant="h6">Book</Typography>
        </LoadingButton>

        <Box sx={{ mt: 2, pb: 2 }}>
          <Accordion
            sx={{
              boxShadow: '0 0px 6px 0 rgba(0,0,0,0.0), 0 3px 10px 0 rgba(0,0,0,0.2)',
            }}
            disableGutters
          >
            <AccordionSummary expandIcon={<ArrowDropDownIcon />} sx={{ px: 1.5 }} aria-controls="panel2-content" id="panel2-header">
              <Typography>More options</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ py: 0, my: 0, px: 1.5 }}>
              <Box pb={0}>
                <StyledTextField id="title" onChange={handleInputChange} />
                <ChipInput id="attendees" onChange={handleInputChange} />
                <Box display={'flex'} mt={1} pb={1} alignItems={'center'}>
                  <Typography variant="subtitle2">Create online conference: </Typography>
                  <Checkbox onChange={(e) => handleInputChange('conference', e.target.checked)} />
                </Box>
              </Box>
            </AccordionDetails>
          </Accordion>
        </Box>
      </Box>

      <Dialog
        PaperProps={{
          sx: { width: '350px' },
        }}
        open={dialogOpen}
        onClose={onChangeRoomClick}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle fontSize={20} fontWeight={800} id="alert-dialog-title">
          {'Room has been booked'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1">
            <b>Title: </b>
            {currentEvent.summary || ''}
          </Typography>

          <Box display={'flex'} alignItems={'center'} mt={1}>
            <Typography variant="subtitle1">
              <b>Room: </b>
            </Typography>
            <Dropdown
              id="room"
              disabled={!editRoom}
              value={requestedRoom}
              sx={{ height: '28px', mx: 1 }}
              options={currentEvent.availableRooms}
              onChange={handleRoomChange}
            />
            <IconButton
              disabled={!currentEvent.isEditable}
              aria-label="edit-room"
              sx={{ p: 1 }}
              onClick={() => {
                setEditRoom(!editRoom);
              }}
            >
              {editRoom ? <CheckRoundedIcon /> : <ModeEditOutlineRoundedIcon />}
            </IconButton>
          </Box>

          <Chip sx={{ mt: 2, fontSize: 16 }} icon={<AccessTimeFilledRoundedIcon />} label={currentEvent.start + ' - ' + currentEvent.end || ''} />
          <Chip sx={{ mt: 2, fontSize: 16, ml: 1 }} icon={<PeopleRoundedIcon />} label={currentEvent.seats} />
        </DialogContent>
        <DialogActions>
          <CustomButton disabled={changeRoomLoading || !currentEvent.isEditable} variant="text" color="error" disableElevation onClick={onChangeRoomClick}>
            Change room
          </CustomButton>
          <CustomButton disabled={changeRoomLoading} onClick={() => setDialogOpen(false)}>
            Dismiss
          </CustomButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

const MyEventsView = () => {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<RoomResponse[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    makeRequest('/rooms', 'GET', null, {
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
      timeZone: getTimeZoneString(),
    }).then(({ data, redirect }) => {
      setLoading(false);

      if (redirect) {
        toast.error("Couldn't complete request. Redirecting to login page");
        setTimeout(() => {
          navigate(ROUTES.signIn);
        }, 2000);
      }

      if (!data?.length) {
        return;
      }

      setEvents(data);
    });
  }, []);

  const onDeleteClick = async (id?: string) => {
    setLoading(true);

    const { data, redirect } = await makeRequest('/room', 'DELETE', { id });

    if (redirect) {
      toast.error("Couldn't complete request. Redirecting to login page");
      setTimeout(() => {
        navigate(ROUTES.signIn);
      }, 2000);
    }

    if (data) {
      setEvents(events.filter((e) => e.id !== id));
      toast.success('Deleted event!');
    }

    setLoading(false);
  };

  return (
    <Box>
      {loading && <LinearProgress />}

      {events.length === 0 && (
        <Typography mt={3} variant="h6">
          No events to show
        </Typography>
      )}
      {events.map((event, i) => (
        <EventCard
          key={i}
          event={event}
          sx={{
            mx: 2,
            mt: 2,
            mb: i === events.length - 1 ? 3 : 0,
          }}
          disabled={loading}
          onDelete={onDeleteClick}
        />
      ))}
    </Box>
  );
};

const SettingsView = () => {
  const [formData, setFormData] = useState({
    floor: '',
  });
  const [floorOptions, setFloorOptions] = useState<DropdownOption[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const init = (floors: string[]) => {
      setFloorOptions(createDropdownOptions(floors));
      cacheService.getFromCache('floor').then((floor) => {
        setFormData({
          ...formData,
          floor: floor || floors[0],
        });
      });
    };

    cacheService.getFromCache('floors').then(async (floors) => {
      if (floors) {
        init(JSON.parse(floors));
      }

      if (!floors) {
        const { data, redirect } = await makeRequest('/floors', 'GET');

        if (redirect) {
          toast.error("Couldn't complete request. Redirecting to login page");
          setTimeout(() => {
            navigate(ROUTES.signIn);
          }, 2000);
        }

        if (data) {
          await cacheService.saveToCache('floors', JSON.stringify(floors));
          init(data);
        }
      }
    });
  }, []);

  const handleInputChange = (id: string, value: string | number) => {
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  const onSaveClick = async () => {
    await cacheService.saveToCache('floor', formData.floor);
  };

  return (
    <Box
      mt={4}
      mx={2}
      sx={{
        textAlign: 'left',
      }}
    >
      <Typography variant="subtitle1">Select preferred floor</Typography>
      <Dropdown sx={{ mt: 1, height: '60px' }} id="floor" value={formData.floor} options={floorOptions} onChange={handleInputChange} />

      <CustomButton sx={{ py: 2, mt: 2 }} onClick={onSaveClick} fullWidth variant="contained">
        Save
      </CustomButton>
    </Box>
  );
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cacheService.getFromCache('access_token').then((token) => {
      if (!token) {
        navigate(ROUTES.signIn);
        return;
      }

      setLoading(false);
    });
  }, []);

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

      {loading ? <LinearProgress /> : tabs[value].component}

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
