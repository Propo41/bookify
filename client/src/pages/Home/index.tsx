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
import {
  convertToLocaleTime,
  convertToRFC3339,
  createDropdownOptions,
  getTimeZoneString,
  populateDurationOptions,
  populateRoomCapacity,
  populateTimeOptions,
  renderError,
} from '../../helpers/utility';
import toast from 'react-hot-toast';
import AccessTimeFilledRoundedIcon from '@mui/icons-material/AccessTimeFilledRounded';
import ModeEditOutlineRoundedIcon from '@mui/icons-material/ModeEditOutlineRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import { FormData } from '../../helpers/types';
import { CacheService, CacheServiceFactory } from '../../helpers/cache';
import { secrets } from '../../config/secrets';
import TopNavigationBar from './TopNavigationBar';
import { ROUTES } from '../../config/routes';
import Api from '../../api/api';
import { BookRoomDto, EventResponse, IConferenceRoom } from '@bookify/shared';
import { isMobile } from 'react-device-detect';
import HourglassBottomRoundedIcon from '@mui/icons-material/HourglassBottomRounded';
import MeetingRoomRoundedIcon from '@mui/icons-material/MeetingRoomRounded';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AdvancedOptionsDialog from './AdvancedOptionsDialog';

// const isChromeExt = secrets.appEnvironment === 'chrome';
const isChromeExt = true;

const roomChangeTimeFrame = 2;
const cacheService: CacheService = CacheServiceFactory.getCacheService();
const commonDurations = ['15', '30', '60'];
const api = new Api();

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

const BookRoomView = () => {
  const [loading, setLoading] = useState(false);
  const [changeRoomLoading, setChangeRoomLoading] = useState(false);
  const [timeOptions, setTimeOptions] = useState<DropdownOption[]>([]);
  const [floorOptions, setFloorOptions] = useState<DropdownOption[]>([]);
  const [durationOptions, setDurationOptions] = useState<DropdownOption[]>([]);
  const [roomCapacityOptions, setRoomCapacityOptions] = useState<DropdownOption[]>([]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editRoom, setEditRoom] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<Event>({});
  const [requestedRoom, setRequestedRoom] = useState(''); // room
  const navigate = useNavigate();
  const [advOptionsOpen, setAdvOptionsOpen] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    startTime: '',
    duration: 30,
    seats: 1,
    floor: '',
  });

  useEffect(() => {
    const startTimeOptions = populateTimeOptions();
    setTimeOptions(createDropdownOptions(startTimeOptions));

    const durationOptions = populateDurationOptions(30, 3 * 60); // 30 mins -> 5 hrs
    setDurationOptions(createDropdownOptions(durationOptions));

    const capacityOptions = populateRoomCapacity(); // 30 mins -> 5 hrs
    setRoomCapacityOptions(createDropdownOptions(capacityOptions));

    const init = async (floors: string[]) => {
      setFloorOptions(createDropdownOptions(floors));

      const floor = await cacheService.get('floor');
      setFormData({
        ...formData,
        startTime: startTimeOptions[0],
        floor: floor || floors[0],
        duration: Number(durationOptions[0]),
      });
    };

    const initializeFormData = async () => {
      // Fetch floors first
      const floors = await cacheService.get('floors');
      if (floors) {
        await init(JSON.parse(floors));
      } else {
        const res = await api.getFloors();
        const { data, status } = res;

        if (status !== 'success') {
          return renderError(res, navigate);
        }

        if (!data) {
          return;
        }

        await cacheService.save('floors', JSON.stringify(data));
        await init(data);
      }

      const duration = await cacheService.get('duration');
      if (duration) {
        setFormData((prevFormData) => ({
          ...prevFormData,
          duration: parseInt(duration),
        }));
      }

      const seats = await cacheService.get('seats');
      if (seats) {
        setFormData((prevFormData) => ({
          ...prevFormData,
          seats: Number(seats),
        }));
      }
    };

    initializeFormData();
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
    if (!currentEvent.eventId) return;

    if (currentEvent.roomEmail === requestedRoom) {
      toast.error('You have already booked this room');
      return;
    }

    if (currentEvent.createdAt && Date.now() - currentEvent.createdAt > roomChangeTimeFrame * 60 * 1000) {
      toast.error('Not possible to change the room at the moment');
      return;
    }

    setChangeRoomLoading(true);

    const res = await api.updateRoomId(currentEvent.eventId, requestedRoom, new Date());
    const { data, status } = res;
    setChangeRoomLoading(false);

    if (status !== 'success') {
      return renderError(res, navigate);
    }

    const rooms: DropdownOption[] = (data?.availableRooms || []).map((r: IConferenceRoom) => ({ value: r.email || '', text: `${r.name} (${r.seats})` }));
    if (currentEvent.roomEmail) {
      rooms.push({ value: currentEvent.roomEmail, text: `${currentEvent.room} (${currentEvent.seats})` });
      setRequestedRoom(currentEvent.roomEmail);
    }

    setCurrentEvent({ ...currentEvent, availableRooms: rooms });
    setCurrentEvent({ ...currentEvent, room: data.room, seats: data.seats, isEditable: false });

    toast.success('Room changed!');
  };

  async function onBookClick() {
    setLoading(true);
    const { startTime, duration, floor, seats, conference, attendees, title } = formData;

    const date = new Date(Date.now()).toISOString().split('T')[0];
    const formattedStartTime = convertToRFC3339(date, startTime);

    const payload: BookRoomDto = {
      startTime: formattedStartTime,
      duration: duration,
      seats: seats,
      floor: floor,
      timeZone: getTimeZoneString(),
      createConference: conference,
      title,
      attendees,
    };

    const res = await api.createRoom(payload);
    const { data, status } = res;
    setLoading(false);

    if (status !== 'success') {
      return renderError(res, navigate);
    }

    const { room, eventId, start, end, summary, seats: _seats, roomEmail, availableRooms } = data;

    setCurrentEvent({
      isEditable: true,
      eventId,
      room,
      start: convertToLocaleTime(start),
      end: convertToLocaleTime(end),
      summary,
      roomEmail,
      seats: _seats,
      availableRooms: (availableRooms || []).map((r: IConferenceRoom) => ({ value: r.email || '', text: `${r.name} (${r.seats})` })),
      createdAt: Date.now(),
    });

    roomEmail && setRequestedRoom(roomEmail);
    setDialogOpen(true);

    toast.success(`Room booked! You have ${roomChangeTimeFrame} minutes to change the room`);
  }

  const handleAdvancedOptionsDialogOpen = () => {
    setAdvOptionsOpen(true);
  };

  const handleAdvancedOptionsDialogClose = () => {
    setAdvOptionsOpen(false);
  };

  return (
    <Box mx={2}>
      <Grid
        container
        spacing={0}
        columns={16}
        px={0}
        mt={3}
        sx={{
          backgroundColor: 'rgba(0, 0, 0, 0.08)',
          borderBottomLeftRadius: 10,
          borderBottomRightRadius: 10,
          borderTopLeftRadius: 10,
          borderTopRightRadius: 10,
        }}
      >
        <Dropdown
          id="startTime"
          options={timeOptions}
          value={formData.startTime}
          onChange={handleInputChange}
          sx={{
            borderTopLeftRadius: 10,
            borderTopRightRadius: 10,
          }}
          icon={
            <AccessTimeFilledRoundedIcon
              sx={[
                (theme) => ({
                  color: theme.palette.grey[50],
                }),
              ]}
            />
          }
        />
        <Grid size={8}>
          <Dropdown
            id="duration"
            options={durationOptions}
            value={formData.duration.toString()}
            onChange={handleInputChange}
            icon={
              <HourglassBottomRoundedIcon
                sx={[
                  (theme) => ({
                    color: theme.palette.grey[50],
                  }),
                ]}
              />
            }
          />
        </Grid>
        <Grid size={8}>
          <Dropdown
            id="capacity"
            options={roomCapacityOptions}
            value={formData.seats.toString()}
            onChange={handleInputChange}
            icon={
              <PeopleRoundedIcon
                sx={[
                  (theme) => ({
                    color: theme.palette.grey[50],
                  }),
                ]}
              />
            }
          />
        </Grid>
        <Dropdown
          id="room"
          options={timeOptions}
          value={formData.startTime}
          onChange={handleInputChange}
          sx={{
            borderBottomLeftRadius: 15,
            borderBottomRightRadius: 15,
          }}
          icon={
            <MeetingRoomRoundedIcon
              sx={[
                (theme) => ({
                  color: theme.palette.grey[50],
                }),
              ]}
            />
          }
        />

        <Grid
          size={16}
          sx={{
            display: 'flex',
            px: 2,
            py: 3,
            cursor: 'pointer',
            WebkitTapHighlightColor: 'transparent',
            touchAction: 'manipulation',
          }}
          onClick={handleAdvancedOptionsDialogOpen}
        >
          <Typography variant="subtitle2">Advanced options</Typography>
          <Box
            sx={{
              flexGrow: 1,
            }}
          />
          <PlayArrowIcon
            fontSize="small"
            sx={[
              (theme) => ({
                color: theme.palette.grey[50],
              }),
            ]}
          />
        </Grid>
      </Grid>
      <Box flexGrow={1} />

      <Box
        sx={{
          mt: 2,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          mb: 3,
          mx: 2,
        }}
      >
        <LoadingButton
          onClick={onBookClick}
          fullWidth
          loading={loading}
          loadingPosition="center"
          variant="contained"
          disableElevation
          sx={[
            (theme) => ({
              py: 2,
              backgroundColor: theme.palette.common.white,
              borderRadius: 15,
              color: theme.palette.common.black,
            }),
          ]}
        >
          <Typography variant="h6" fontWeight={700}>
            Book now
          </Typography>
        </LoadingButton>
      </Box>

      <AdvancedOptionsDialog open={advOptionsOpen} formData={formData} handleInputChange={handleInputChange} handleClose={handleAdvancedOptionsDialogClose} />

      <Dialog
        PaperProps={{
          sx: { width: '350px' },
        }}
        open={dialogOpen}
        onClose={onChangeRoomClick}
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
              sx={{
                height: '28px',
                mx: 1,
                minWidth: '205px',
              }}
              options={currentEvent.availableRooms}
              onChange={handleRoomChange}
            />
            <IconButton
              disabled={!currentEvent.isEditable}
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
  const [events, setEvents] = useState<EventResponse[]>([]);
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteEventId, setDeleteEventId] = useState<string | null>(null);

  useEffect(() => {
    const query = {
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
      timeZone: getTimeZoneString(),
    };

    api.getRooms(query.startTime, query.endTime, query.timeZone).then((res) => {
      const { data, status } = res;
      setLoading(false);

      if (status !== 'success') {
        renderError(res, navigate);
      }

      if (!data?.length) {
        return;
      }

      setEvents(data);
    });
  }, []);

  const handleDeleteClick = (id: string) => {
    setDeleteEventId(id);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setDeleteEventId(null);
  };

  const handleConfirmDelete = async () => {
    setLoading(true);
    setDialogOpen(false);

    if (!deleteEventId) {
      toast.error('Please select the event to delete');
      return;
    }

    const res = await api.deleteRoom(deleteEventId);
    const { data, status } = res;
    setLoading(false);

    if (status !== 'success') {
      return renderError(res, navigate);
    }

    if (data) {
      setEvents(events.filter((e) => e.eventId !== deleteEventId));
      toast.success('Deleted event!');
    }
  };

  const onEdit = (id: string, data: any) => {
    if (data) {
      const { start, end } = data;
      setEvents((prevEvents) => prevEvents.map((event) => (event.eventId === id ? { ...event, start, end } : event)));
      toast.success('Room has been updated');
    } else {
      //todo: add proper message from backend
      toast.error('Room was not updated');
    }
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
          onEdit={onEdit}
          disabled={loading}
          onDelete={() => event.eventId && handleDeleteClick(event.eventId)}
        />
      ))}

      {/* Confirmation Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle fontSize={20} fontWeight={800} id="alert-dialog-title">
          {'Confirm delete'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1">Are you sure you want to delete this event?</Typography>
        </DialogContent>
        <DialogActions>
          <CustomButton onClick={handleCloseDialog} color="primary">
            Cancel
          </CustomButton>
          <CustomButton onClick={() => handleConfirmDelete()} color="error" autoFocus>
            Delete
          </CustomButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

const SettingsView = () => {
  const [formData, setFormData] = useState({
    floor: '',
    duration: commonDurations[0],
    seats: 1,
  });
  const [floorOptions, setFloorOptions] = useState<DropdownOption[]>([]);
  const [durationOptions, setDurationOptions] = useState<DropdownOption[]>([]);

  const navigate = useNavigate();

  useEffect(() => {
    const init = async (floors: string[]) => {
      setFloorOptions(createDropdownOptions(floors));
      setDurationOptions(createDropdownOptions(commonDurations));

      const floor = await cacheService.get('floor');
      const duration = await cacheService.get('duration');
      const seats = await cacheService.get('seats');

      setFormData({
        ...formData,
        floor: floor || floors[0],
        duration: duration || commonDurations[0],
        seats: Number(seats) || 1,
      });
    };

    cacheService.get('floors').then(async (floors) => {
      if (floors) {
        init(JSON.parse(floors));
        return;
      }

      const res = await api.getFloors();
      const { data, status } = res!;

      if (status !== 'success') {
        return renderError(res, navigate);
      }

      if (data) {
        await cacheService.save('floors', JSON.stringify(floors));
        init(data);
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
    await cacheService.save('floor', formData.floor);
    await cacheService.save('duration', formData.duration);
    await cacheService.save('seats', formData.seats.toString());
    toast.success('Saved successfully!');
  };

  return (
    <Box
      mt={4}
      mx={2}
      sx={{
        textAlign: 'left',
      }}
    >
      <Typography variant="subtitle1">Preferred floor</Typography>
      <Dropdown sx={{ mt: 1, height: '60px' }} id="floor" value={formData.floor} options={floorOptions} onChange={handleInputChange} />

      <Typography variant="subtitle1" mt={2}>
        Preferred meeting duration
      </Typography>
      <Dropdown sx={{ mt: 1, height: '60px' }} id="duration" value={formData.duration} decorator="m" options={durationOptions} onChange={handleInputChange} />

      <Typography variant="subtitle1" mt={2}>
        Preferred room capacity
      </Typography>
      <TimeAdjuster
        sx={{ mt: 1, height: '60px' }}
        incrementBy={1}
        minAmount={1}
        value={formData.seats}
        onChange={(newValue) => handleInputChange('seats', newValue)}
      />

      <CustomButton sx={{ py: 2, mt: 3 }} onClick={onSaveClick} fullWidth variant="contained">
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
  return (
    <Container
      sx={{
        maxHeight: isChromeExt ? '600px' : '100vh',
      }}
    >
      {common}
    </Container>
  );
};

export default Home;
