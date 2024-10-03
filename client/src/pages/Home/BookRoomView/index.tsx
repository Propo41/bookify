import { Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, styled, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Grid from '@mui/material/Grid2';
import Dropdown, { DropdownOption } from '../../../components/Dropdown';
import LoadingButton from '@mui/lab/LoadingButton';
import {
  convertToLocaleTime,
  convertToRFC3339,
  createDropdownOptions,
  getTimeZoneString,
  populateDurationOptions,
  populateRoomCapacity,
  populateTimeOptions,
  renderError,
} from '../../../helpers/utility';
import toast from 'react-hot-toast';
import AccessTimeFilledRoundedIcon from '@mui/icons-material/AccessTimeFilledRounded';
import ModeEditOutlineRoundedIcon from '@mui/icons-material/ModeEditOutlineRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import { FormData } from '../../../helpers/types';
import { BookRoomDto, IConferenceRoom } from '@bookify/shared';
import MeetingRoomRoundedIcon from '@mui/icons-material/MeetingRoomRounded';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AdvancedOptionsDialog from '../AdvancedOptionsDialog';
import { CacheService, CacheServiceFactory } from '../../../helpers/cache';
import Api from '../../../api/api';
import { Event } from '../shared';
import HourglassBottomRoundedIcon from '@mui/icons-material/HourglassBottomRounded';

const roomChangeTimeFrame = 2;

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

export default function BookRoomView() {
  const [loading, setLoading] = useState(false);
  const [changeRoomLoading, setChangeRoomLoading] = useState(false);
  const [timeOptions, setTimeOptions] = useState<DropdownOption[]>([]);
  const [durationOptions, setDurationOptions] = useState<DropdownOption[]>([]);
  const [roomCapacityOptions, setRoomCapacityOptions] = useState<DropdownOption[]>([]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editRoom, setEditRoom] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<Event>({});
  const [requestedRoom, setRequestedRoom] = useState(''); // room
  const navigate = useNavigate();
  const [advOptionsOpen, setAdvOptionsOpen] = useState(false);

  const cacheService: CacheService = CacheServiceFactory.getCacheService();
  const api = new Api();

  const [formData, setFormData] = useState<FormData>({
    startTime: '',
    duration: 30,
    seats: 1,
  });

  useEffect(() => {
    const startTimeOptions = populateTimeOptions();
    setTimeOptions(createDropdownOptions(startTimeOptions));

    const durationOptions = populateDurationOptions(30, 3 * 60); // 30 mins -> 5 hrs
    setDurationOptions(createDropdownOptions(durationOptions, 'time'));

    const capacityOptions = populateRoomCapacity();
    setRoomCapacityOptions(createDropdownOptions(capacityOptions));

    const init = async (floors: string[]) => {
      setFormData({
        ...formData,
        startTime: startTimeOptions[0],
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
    const { startTime, duration, seats, conference, attendees, title } = formData;

    const date = new Date(Date.now()).toISOString().split('T')[0];
    const formattedStartTime = convertToRFC3339(date, startTime);

    const payload: BookRoomDto = {
      startTime: formattedStartTime,
      duration: duration,
      seats: seats,
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
        mt={1}
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
          <Typography variant="subtitle1">Additional options</Typography>
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
}
