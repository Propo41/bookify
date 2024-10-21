import { Box, Typography } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Dropdown, { DropdownOption } from '../../../components/Dropdown';
import LoadingButton from '@mui/lab/LoadingButton';
import { chromeBackground, convertToRFC3339, createDropdownOptions, getTimeZoneString, isChromeExt, renderError } from '../../../helpers/utility';
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
  const abortControllerRef = useRef<AbortController | null>(null);

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

    // abort pending requests on component unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  useEffect(() => {
    if (firstRender) {
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

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    const res = await api.getAvailableRooms(abortControllerRef.current.signal, formattedStartTime, duration, getTimeZoneString(), seats, floor);

    setRoomLoading(false);

    if (res.status === 'ignore') {
      return;
    }

    if (res.status === 'error') {
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

  if (advOptionsOpen) {
    return (
      <AdvancedOptionsDialog open={advOptionsOpen} formData={formData} handleInputChange={handleInputChange} handleClose={handleAdvancedOptionsDialogClose} />
    );
  }

  return (
    <Box mx={2} mt={2} display={'flex'}>
      <Box
        sx={{
          background: isChromeExt ? 'rgba(255, 255, 255, 0.4)' : 'rgba(245, 245, 245, 0.5);',
          backdropFilter: 'blur(100px)',
          borderRadius: 2,
          zIndex: 100,
          width: '100%',
        }}
      >
        <Box
          sx={{
            px: 1,
            pt: 1,
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

          <Box sx={{ display: 'flex' }}>
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
          </Box>

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
        </Box>

        <Box
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
        </Box>
        <Box flexGrow={1} />
      </Box>

      <Box
        sx={{
          mt: 2,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          mb: 3,
          mx: 2,
          zIndex: 100,
        }}
      >
        <LoadingButton
          onClick={onBookClick}
          fullWidth
          loading={loading}
          variant="contained"
          disabled={roomLoading || !formData.room ? true : false}
          disableElevation
          loadingPosition="start"
          startIcon={<></>}
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
    </Box>
  );
}
