import { Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Divider, IconButton, Skeleton, styled, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Grid from '@mui/material/Grid2';
import Dropdown, { DropdownOption } from '../../../components/Dropdown';
import LoadingButton from '@mui/lab/LoadingButton';
import { convertToLocaleTime, convertToRFC3339, createDropdownOptions, getTimeZoneString, renderError } from '../../../helpers/utility';
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
import { availableDurations, availableRoomCapacities, availableStartTimeOptions, Event } from '../shared';
import HourglassBottomRoundedIcon from '@mui/icons-material/HourglassBottomRounded';
import RoomsDropdown, { RoomsDropdownOption } from '../../../components/RoomsDropdown';

const roomChangeTimeFrame = 2;

const createRoomDropdownOptions = (rooms: IConferenceRoom[]) => {
  return (rooms || []).map((room) => ({ value: room.email, text: room.name, seats: room.seats, floor: room.floor }) as RoomsDropdownOption);
};

interface BookRoomViewProps {
  refresh?: boolean;
  setRefresh: (val: boolean) => void;
}

export default function BookRoomView({ refresh, setRefresh }: BookRoomViewProps) {
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

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
      console.log('refresh');

      setAvailableRooms();
      setPreferences();
      setRefresh(false);
    }
  }, [refresh]);

  useEffect(() => {
    setPreferences();
  }, []);

  useEffect(() => {
    if (initialized) {
      console.log('initialized');
      setAvailableRooms();
    }

    return () => {
      setInitialized(false);
    };
  }, [initialized, formData.startTime, formData.duration, formData.seats]);

  const handleInputChange = (id: string, value: string | number | string[] | boolean) => {
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));

    console.log(formData);
  };

  async function setPreferences() {
    setTimeOptions(createDropdownOptions(availableStartTimeOptions));
    setDurationOptions(createDropdownOptions(availableDurations, 'time'));
    setRoomCapacityOptions(createDropdownOptions(availableRoomCapacities));

    const init = async (floors: string[]) => {
      setFormData({
        ...formData,
        startTime: availableStartTimeOptions[0],
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

    initializeFormData().then(() => {
      setInitialized(true);
    });
  }

  async function setAvailableRooms() {
    const { startTime, duration, seats } = formData;

    const date = new Date(Date.now()).toISOString().split('T')[0];
    const formattedStartTime = convertToRFC3339(date, startTime);

    const floor = (await cacheService.get('floor')) || undefined;

    const res = await api.getAvailableRooms(formattedStartTime, duration, getTimeZoneString(), seats, floor);
    setLoading(false);

    if (res.status !== 'success') {
      return renderError(res, navigate);
    }

    const data = res.data as IConferenceRoom[];
    if (data.length > 0) {
      setFormData((prev) => {
        return {
          ...prev,
          room: data[0].email,
        };
      });
      setAvailableRoomOptions(createRoomDropdownOptions(data));
    }
  }

  // TODO: add room email to request
  async function onBookClick() {
    setLoading(true);
    const { startTime, duration, seats, conference, attendees, title } = formData;

    console.log(formData);

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
      attendees,
    };

    const res = await api.createRoom(payload);
    const { data, status } = res;
    setLoading(false);

    if (status !== 'success') {
      return renderError(res, navigate);
    }

    const { room, eventId, start, end, summary, seats: _seats, roomEmail, availableRooms } = data;

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
          loading={loading}
          disabled={!availableRoomOptions.length}
          onChange={handleInputChange}
          placeholder={availableRoomOptions.length === 0 ? 'Search for rooms first' : 'Select your room'}
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
    </Box>
  );
}
