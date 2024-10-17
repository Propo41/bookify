import { AppBar, Box, Button, IconButton, Typography } from '@mui/material';
import Dropdown, { DropdownOption } from '../Dropdown';
import React, { useEffect, useRef, useState } from 'react';
import ArrowBackIosRoundedIcon from '@mui/icons-material/ArrowBackIosRounded';
import { convertToLocaleTime, convertToRFC3339, createDropdownOptions, getTimeZoneString, populateTimeOptions, renderError } from '../../helpers/utility';
import HourglassBottomRoundedIcon from '@mui/icons-material/HourglassBottomRounded';
import { EditRoomFields } from './util';
import { availableDurations, availableRoomCapacities, availableStartTimeOptions } from '../../pages/Home/shared';
import { LoadingButton } from '@mui/lab';
import AccessTimeFilledRoundedIcon from '@mui/icons-material/AccessTimeFilledRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import RoomsDropdown, { RoomsDropdownOption } from '../RoomsDropdown';
import MeetingRoomRoundedIcon from '@mui/icons-material/MeetingRoomRounded';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { FormData } from '../../helpers/types';
import { CacheService, CacheServiceFactory } from '../../helpers/cache';
import Api from '../../api/api';
import { IConferenceRoom } from '@bookify/shared';
import { useNavigate } from 'react-router-dom';
import AdvancedOptionsDialog from '../../pages/Home/AdvancedOptionsDialog';

const createRoomDropdownOptions = (rooms: IConferenceRoom[]) => {
  return (rooms || []).map((room) => ({ value: room.email, text: room.name, seats: room.seats, floor: room.floor }) as RoomsDropdownOption);
};

interface EditDialogProps {
  open: boolean;
  handleClose: () => void;
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  onEditRoomClick: () => void;
  loading?: boolean;
  currentRoom: IConferenceRoom;
}

export default function EditDialog({ open, handleClose, formData, setFormData, currentRoom, onEditRoomClick, loading }: EditDialogProps) {
  const [timeOptions, setTimeOptions] = useState<DropdownOption[]>([]);
  const [durationOptions, setDurationOptions] = useState<DropdownOption[]>([]);
  const [roomCapacityOptions, setRoomCapacityOptions] = useState<DropdownOption[]>([]);
  const [availableRoomOptions, setAvailableRoomOptions] = useState<RoomsDropdownOption[]>([]);
  const [roomLoading, setRoomLoading] = useState(false);
  const [advOptionsOpen, setAdvOptionsOpen] = useState(false);

  const cacheService: CacheService = CacheServiceFactory.getCacheService();
  const [firstRender, setFirstRender] = useState(false);
  const api = new Api();
  const abortControllerRef = useRef<AbortController | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // abort pending requests on component unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  useEffect(() => {
    console.log('formData', formData);
    if (open) {
      setPreferences();
    }
  }, [open]);

  useEffect(() => {
    setAvailableRooms();
  }, [formData.startTime, formData.duration, formData.seats]);

  const handleInputChange = (id: string, value: string | number | string[] | boolean) => {
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

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
    let roomOptions: RoomsDropdownOption[] = [];

    if (data.length > 0) {
      roomOptions = createRoomDropdownOptions(data);
    }

    setAvailableRoomOptions(roomOptions);
    setFormData((prev) => {
      return {
        ...prev,
        room: roomOptions[0].value,
      };
    });
  }

  async function setPreferences() {
    const date = new Date(Date.now()).toISOString().split('T')[0];
    console.log(' formData.startTime', formData.startTime);

    const formattedStartTime = convertToRFC3339(date, formData.startTime);
    const timeOptions = populateTimeOptions(formattedStartTime);

    setTimeOptions(createDropdownOptions(timeOptions));
    setDurationOptions(createDropdownOptions(availableDurations, 'time'));
    setRoomCapacityOptions(createDropdownOptions(availableRoomCapacities));
  }

  const handleAdvancedOptionsDialogOpen = () => {
    setAdvOptionsOpen(true);
  };

  const handleAdvancedOptionsDialogClose = () => {
    setAdvOptionsOpen(false);
  };

  if (!open) return <></>;

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '100%',
        zIndex: 10,
        boxShadow: 'none',
        overflow: 'hidden',
        backgroundColor: 'white',
        // background: 'linear-gradient(to bottom right, #ffffff, #fffbeb, #f0f9ff)',
      }}
    >
      <AppBar
        sx={{ bgcolor: 'transparent', position: 'relative', display: 'flex', flexDirection: 'row', py: 2, alignItems: 'center', px: 3, boxShadow: 'none' }}
      >
        <IconButton edge="start" color="inherit" onClick={handleClose} aria-label="close">
          <ArrowBackIosRoundedIcon
            fontSize="small"
            sx={[
              (theme) => ({
                color: theme.palette.common.black,
              }),
            ]}
          />
        </IconButton>
        <Typography
          sx={[
            (theme) => ({
              textAlign: 'center',
              flex: 1,
              color: theme.palette.common.black,
              fontWeight: 700,
            }),
          ]}
          variant="h5"
          component={'div'}
        >
          Edit event
        </Typography>
      </AppBar>

      <Box
        sx={{
          background: 'rgba(242, 242, 242, 0.5)',
          backdropFilter: 'blur(100px)',
          borderRadius: 2,
          mx: 2,
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
          currentRoom={createRoomDropdownOptions([currentRoom])[0]}
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
          mx: 4,
          mb: 3,
          textAlign: 'center',
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
        }}
      >
        <LoadingButton
          onClick={onEditRoomClick}
          fullWidth
          variant="contained"
          disableElevation
          loading={loading}
          loadingPosition="start"
          startIcon={<></>}
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
            Save changes
          </Typography>
        </LoadingButton>

        <Button
          variant="text"
          onClick={handleClose}
          sx={{
            py: 2,
            mt: 2,
            px: 3,
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
          }}
        >
          <Typography variant="subtitle2" fontWeight={700}>
            Cancel
          </Typography>
        </Button>
      </Box>
      {advOptionsOpen && (
        <AdvancedOptionsDialog open={advOptionsOpen} formData={formData} handleInputChange={handleInputChange} handleClose={handleAdvancedOptionsDialogClose} />
      )}
    </Box>
  );
}
