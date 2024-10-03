import { useNavigate } from 'react-router-dom';
import Api from '../../../api/api';
import { CacheService, CacheServiceFactory } from '../../../helpers/cache';
import { useEffect, useState } from 'react';
import { createDropdownOptions, populateDurationOptions, populateRoomCapacity, renderError } from '../../../helpers/utility';
import Dropdown, { DropdownOption } from '../../../components/Dropdown';
import { ROUTES } from '../../../config/routes';
import toast from 'react-hot-toast';
import { Box, Button, Typography } from '@mui/material';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import HourglassBottomRoundedIcon from '@mui/icons-material/HourglassBottomRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import StairsIcon from '@mui/icons-material/Stairs';

export default function SettingsView() {
  const [formData, setFormData] = useState({
    floor: '',
    duration: '30',
    seats: 1,
  });
  const [floorOptions, setFloorOptions] = useState<DropdownOption[]>([]);
  const [durationOptions, setDurationOptions] = useState<DropdownOption[]>([]);
  const [roomCapacityOptions, setRoomCapacityOptions] = useState<DropdownOption[]>([]);

  const cacheService: CacheService = CacheServiceFactory.getCacheService();
  const commonDurations = ['15', '30', '60'];
  const api = new Api();

  const navigate = useNavigate();

  useEffect(() => {
    const init = async (floors: string[]) => {
      setFloorOptions(createDropdownOptions(floors));

      const durationOptions = populateDurationOptions(30, 3 * 60); // 30 mins -> 5 hrs
      setDurationOptions(createDropdownOptions(durationOptions, 'time'));

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

    const capacityOptions = populateRoomCapacity();
    setRoomCapacityOptions(createDropdownOptions(capacityOptions));
  }, []);

  const handleInputChange = (id: string, value: string | number) => {
    console.log(value);

    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  const onLogoutClick = async () => {
    await api.logout();
    navigate(ROUTES.signIn);
  };

  const onSaveClick = async () => {
    await cacheService.save('floor', formData.floor);
    await cacheService.save('duration', formData.duration);
    await cacheService.save('seats', formData.seats.toString());
    toast.success('Saved successfully!');
  };

  return (
    <Box
      mx={2}
      mt={1}
      sx={{
        backgroundColor: 'rgba(0, 0, 0, 0.08)',
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
      }}
    >
      <Box
        sx={{
          bgcolor: 'white',
          borderTopLeftRadius: 10,
          borderTopRightRadius: 10,
          borderBottomLeftRadius: 15,
          borderBottomRightRadius: 15,
          textAlign: 'left',
        }}
      >
        <Dropdown
          sx={{ borderTopLeftRadius: 10, borderTopRightRadius: 10, height: '60px' }}
          id="floor"
          value={formData.floor}
          options={floorOptions}
          onChange={handleInputChange}
          icon={
            <StairsIcon
              sx={[
                (theme) => ({
                  color: theme.palette.grey[50],
                }),
              ]}
            />
          }
        />

        <Dropdown
          sx={{ height: '60px' }}
          id="duration"
          value={formData.duration}
          options={durationOptions}
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
          sx={{ height: '60px', borderBottomLeftRadius: 15, borderBottomRightRadius: 15 }}
          id="seats"
          value={formData.seats + ''}
          options={roomCapacityOptions}
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

      <Box>
        <Button
          variant="text"
          color="primary"
          disableElevation
          fullWidth
          onClick={onLogoutClick}
          startIcon={<LogoutRoundedIcon />}
          sx={{
            py: 3,
            borderRadius: 0,
            fontWeight: 700,
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
            '& .MuiButton-startIcon': {
              mr: 1.5,
            },
            alignItems: 'flex-start',
          }}
        >
          Logout
        </Button>
      </Box>

      <Box flexGrow={1} />
      <Box
        sx={{
          mx: 2,
          mb: 3,
          textAlign: 'center',
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
        }}
      >
        <Button
          onClick={onSaveClick}
          fullWidth
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
          <Typography variant="h6" fontWeight={700} color="error">
            Save
          </Typography>
        </Button>
      </Box>
    </Box>
  );
}
