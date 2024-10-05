import { Box, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Grid from '@mui/material/Grid2';
import Dropdown, { DropdownOption } from '../../../components/Dropdown';
import LoadingButton from '@mui/lab/LoadingButton';
import { convertToRFC3339, createDropdownOptions, getTimeZoneString, renderError } from '../../../helpers/utility';
import toast from 'react-hot-toast';
import AccessTimeFilledRoundedIcon from '@mui/icons-material/AccessTimeFilledRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import { FormData } from '../../../helpers/types';
import { BookRoomDto, EventResponse, IConferenceRoom } from '@bookify/shared';
import MeetingRoomRoundedIcon from '@mui/icons-material/MeetingRoomRounded';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AdvancedOptionsDialog from '../AdvancedOptionsDialog';
import { CacheService, CacheServiceFactory } from '../../../helpers/cache';
import Api from '../../../api/api';
import { availableDurations, availableRoomCapacities, availableStartTimeOptions } from '../shared';
import HourglassBottomRoundedIcon from '@mui/icons-material/HourglassBottomRounded';
import RoomsDropdown, { RoomsDropdownOption } from '../../../components/RoomsDropdown';

const createRoomDropdownOptions = (rooms: IConferenceRoom[]) => {
  return (rooms || []).map((room) => ({ value: room.email, text: room.name, seats: room.seats, floor: room.floor }) as RoomsDropdownOption);
};

interface BookRoomViewProps {
  refresh?: boolean;
  setRefresh: (val: boolean) => void;
}

export default function BookRoomView({ refresh, setRefresh }: BookRoomViewProps) {
  const [loading, setLoading] = useState(false);
  const [roomLoading, setRoomLoading] = useState(false);

  const [firstRender, setFirstRender] = useState(false);

  const [timeOptions, setTimeOptions] = useState<DropdownOption[]>([]);
  const [durationOptions, setDurationOptions] = useState<DropdownOption[]>([]);
  const [roomCapacityOptions, setRoomCapacityOptions] = useState<DropdownOption[]>([]);

  const navigate = useNavigate();
  const [advOptionsOpen, setAdvOptionsOpen] = useState(false);

  const [availableRoomOptions, setAvailableRoomOptions] = useState<RoomsDropdownOption[]>([]);

  const cacheService: CacheService = CacheServiceFactory.getCacheService();
  const api = new Api();

  const [formData, setFormData] = useState<FormData>({
    startTime: '',
    duration: 30,
    seats: 1,
  });

  useEffect(() => {
    if (refresh) {
      setAvailableRooms().then(async () => {
        await setPreferences();
        setRefresh(false);
      });
    }
  }, [refresh]);

  useEffect(() => {
    setPreferences();
    setFirstRender(true);
  }, []);

  // todo: fix it so that this hook is not called multiple times on initial page load
  useEffect(() => {
    if (firstRender) {
      console.log('changed');

      setAvailableRooms();
    }
  }, [firstRender, formData.startTime, formData.duration, formData.seats]);

  const handleInputChange = (id: string, value: string | number | string[] | boolean) => {
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  async function setPreferences() {
    setTimeOptions(createDropdownOptions(availableStartTimeOptions));
    setDurationOptions(createDropdownOptions(availableDurations, 'time'));
    setRoomCapacityOptions(createDropdownOptions(availableRoomCapacities));

    const initializeFormData = async () => {
      const duration = await cacheService.get('duration');
      const seats = await cacheService.get('seats');

      setFormData((prevFormData) => ({
        ...prevFormData,
        startTime: availableStartTimeOptions[0],
        seats: Number(seats || availableRoomCapacities[0]),
        duration: parseInt(duration || availableDurations[0]),
      }));
    };

    initializeFormData().then(() => {
      setFirstRender(true);
    });
  }

  async function setAvailableRooms() {
    const { startTime, duration, seats } = formData;
    console.log('room fetch');

    const date = new Date(Date.now()).toISOString().split('T')[0];
    const formattedStartTime = convertToRFC3339(date, startTime);

    const floor = (await cacheService.get('floor')) || undefined;

    setRoomLoading(true);

    const res = await api.getAvailableRooms(formattedStartTime, duration, getTimeZoneString(), seats, floor);

    setRoomLoading(false);

    if (res.status !== 'success') {
      return renderError(res, navigate);
    }

    const data = res.data as IConferenceRoom[];
    let roomEmail: string | undefined;
    let roomOptions: RoomsDropdownOption[] = [];

    if (data.length > 0) {
      roomEmail = data[0].email;
      roomOptions = createRoomDropdownOptions(data);
    }

    setFormData({
      ...formData,
      room: roomEmail,
    });

    setAvailableRoomOptions(roomOptions);
  }

  async function onBookClick() {
    setLoading(true);
    const { startTime, duration, seats, conference, attendees, title, room } = formData;

    if (!room) {
      return;
    }

    const date = new Date(Date.now()).toISOString().split('T')[0];
    const formattedStartTime = convertToRFC3339(date, startTime);

    const floor = await cacheService.get('floor');

    const payload: BookRoomDto = {
      startTime: formattedStartTime,
      duration: duration,
      seats: seats,
      floor: floor || undefined,
      timeZone: getTimeZoneString(),
      createConference: conference,
      title,
      room: room,
      attendees,
    };

    const res = await api.createRoom(payload);
    const { data, status } = res;
    setLoading(false);

    if (status !== 'success') {
      return renderError(res, navigate);
    }

    const { room: roomName } = data as EventResponse;

    toast.success(`${roomName} has been booked!`);

    setAvailableRoomOptions([]);
    await setAvailableRooms();
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
            id="seats"
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

        <RoomsDropdown
          id="room"
          options={availableRoomOptions}
          value={formData.room || ''}
          loading={roomLoading}
          disabled={!availableRoomOptions.length}
          onChange={handleInputChange}
          placeholder={availableRoomOptions.length === 0 ? 'No rooms are available' : 'Select your room'}
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
          variant="contained"
          disabled={roomLoading || !formData.room ? true : false}
          disableElevation
          sx={[
            (theme) => ({
              py: 2,
              alignItems: 'baseline',
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
    </Box>
  );
}
