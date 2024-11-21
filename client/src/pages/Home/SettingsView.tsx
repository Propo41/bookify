import * as React from 'react';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { Box } from '@mui/material';
import ArrowBackIosRoundedIcon from '@mui/icons-material/ArrowBackIosRounded';
import Dropdown, { DropdownOption } from '@components/Dropdown';
import { ROUTES } from '@config/routes';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import EventSeatRoundedIcon from '@mui/icons-material/EventSeatRounded';
import HourglassBottomRoundedIcon from '@mui/icons-material/HourglassBottomRounded';
import StairsIcon from '@mui/icons-material/Stairs';
import { CacheService, CacheServiceFactory } from '@helpers/cache';
import Api from '@api/api';
import { chromeBackground, createDropdownOptions, isChromeExt, renderError } from '@helpers/utility';
import { availableDurations, availableRoomCapacities } from './shared';
import { capitalize } from 'lodash';
import { styled, ToggleButton, ToggleButtonGroup } from '@mui/material';
import ExitToAppRoundedIcon from '@mui/icons-material/ExitToAppRounded';
import BugReportRoundedIcon from '@mui/icons-material/BugReportRounded';
import { secrets } from '@config/secrets';
import LightbulbRoundedIcon from '@mui/icons-material/LightbulbRounded';
import StyledTextField from '@components/StyledTextField';
import TitleIcon from '@mui/icons-material/Title';

const TopBar = styled(Box)(({ theme }) => ({
  paddingTop: theme.spacing(1.5),
  paddingBottom: theme.spacing(1.5),
  display: 'flex',
  width: '100%',
  justifyContent: 'center',
  alignItems: 'center',
  textAlign: 'center',
}));

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme: _ }) => ({
  borderRadius: 30,
  '& .MuiToggleButtonGroup-grouped': {
    border: 'none',
    '&:not(:first-of-type)': {
      borderRadius: 30,
    },
    '&:first-of-type': {
      borderRadius: 30,
    },
  },
  justifyContent: 'center',
}));

const StyledToggleButton = styled(ToggleButton)(({ theme }) => ({
  borderRadius: 30,
  border: 'none',
  textTransform: 'none',
  width: '140px',
  padding: '15px',
  fontWeight: 600,
  color: theme.palette.text.disabled,
  '&:hover': {
    backgroundColor: 'inherit',
  },
  '&.Mui-selected': {
    border: 'none',
    boxShadow: 'inset 0px 2px 5px rgba(0, 0, 0, 0.1)',
    backgroundColor: '#F2F2F2',
    fontWeight: 600,
    color: theme.palette.text.primary,
  },
}));

const SettingsButton = styled(Button)(({ theme: _ }) => ({
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

interface SettingsViewProps {
  handleClose: () => void;
  onSave: () => void;
  open: boolean;
}

interface PreferenceViewProps {
  onSave: () => void;
}

const PreferenceView = ({ onSave }: PreferenceViewProps) => {
  const [formData, setFormData] = React.useState({
    floor: '',
    duration: '30',
    seats: 1,
    title: '',
  });
  const [floorOptions, setFloorOptions] = useState<DropdownOption[]>([]);
  const [durationOptions, setDurationOptions] = useState<DropdownOption[]>([]);
  const [roomCapacityOptions, setRoomCapacityOptions] = useState<DropdownOption[]>([]);
  const cacheService: CacheService = CacheServiceFactory.getCacheService();
  const api = new Api();

  const navigate = useNavigate();

  useEffect(() => {
    const init = async (floors: string[]) => {
      const floorOptions = createDropdownOptions(floors);
      floorOptions.unshift({ text: 'No preference', value: '' });

      setFloorOptions(floorOptions);
      setDurationOptions(createDropdownOptions(availableDurations, 'time'));

      const floor = await cacheService.get('floor');
      const duration = await cacheService.get('duration');
      const seats = await cacheService.get('seats');
      const title = await cacheService.get('title');

      setFormData({
        ...formData,
        floor: floor || '',
        title: title || '',
        duration: duration || availableDurations[0],
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
        await cacheService.save('floors', JSON.stringify(data));
        init(data);
      }
    });

    setRoomCapacityOptions(createDropdownOptions(availableRoomCapacities));
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
    await cacheService.save('title', formData.title.toString());

    toast.success('Saved successfully!');
    onSave();
  };

  return (
    <Box
      mx={2}
      mt={1}
      sx={{
        background: isChromeExt ? 'rgba(255, 255, 255, 0.4)' : 'rgba(245, 245, 245, 0.5);',
        borderRadius: 2,
      }}
    >
      <Box
        sx={{
          px: 1,
          py: 1,
        }}
      >
        <Box
          sx={{
            bgcolor: 'white',
            borderTopLeftRadius: 10,
            borderTopRightRadius: 10,
            borderBottomLeftRadius: 10,
            borderBottomRightRadius: 10,
            textAlign: 'left',
          }}
        >
          <Dropdown
            sx={{ borderTopLeftRadius: 10, borderTopRightRadius: 10, height: '60px' }}
            id="floor"
            value={formData.floor}
            placeholder={'Select preferred floor'}
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

          {/* <Divider sx={{ mx: 2 }} /> */}
          <Dropdown
            sx={{ height: '60px' }}
            id="duration"
            value={formData.duration}
            options={durationOptions}
            onChange={handleInputChange}
            placeholder={'Select preferred meeting duration'}
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
          {/* <Divider sx={{ mx: 2 }} /> */}
          <Dropdown
            sx={{ height: '60px', borderBottomLeftRadius: 15, borderBottomRightRadius: 15 }}
            id="seats"
            placeholder={'Select preferred room capacity'}
            value={formData.seats + ''}
            options={roomCapacityOptions}
            onChange={handleInputChange}
            icon={
              <EventSeatRoundedIcon
                sx={[
                  (theme) => ({
                    color: theme.palette.grey[50],
                  }),
                ]}
              />
            }
          />

          <StyledTextField
            value={formData.title}
            startIcon={
              <TitleIcon
                sx={[
                  (theme) => ({
                    color: theme.palette.grey[50],
                  }),
                ]}
              />
            }
            id="title"
            placeholder="Add preferred title"
            onChange={handleInputChange}
          />
        </Box>
      </Box>

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
              textTransform: 'none',
              color: theme.palette.common.black,
            }),
          ]}
        >
          <Typography variant="h6" fontWeight={700}>
            Save
          </Typography>
        </Button>
      </Box>
    </Box>
  );
};

const SupportView = () => {
  const onReportBugClick = () => {
    const url = 'https://github.com/Propo41/bookify/issues/new?assignees=&labels=bug&projects=&template=bug_report.md&title=%5BBUG%5D';
    if (secrets.appEnvironment === 'chrome') {
      chrome.tabs.create({
        url: url,
        active: true,
      });
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const onRequestFeatureClick = () => {
    const url = 'https://github.com/Propo41/bookify/issues/new?assignees=&labels=feature+request&projects=&template=feature_request.md&title=%5BFEATURE+REQ%5D';
    if (secrets.appEnvironment === 'chrome') {
      chrome.tabs.create({
        url: url,
        active: true,
      });
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Box
      mx={2}
      mt={1}
      sx={{
        background: isChromeExt ? 'rgba(255, 255, 255, 0.4)' : 'rgba(245, 245, 245, 0.5);',
        borderRadius: 2,
      }}
    >
      <Box
        sx={{
          px: 1,
          py: 1,
        }}
      >
        <Box
          sx={{
            bgcolor: 'white',
            borderTopLeftRadius: 10,
            borderTopRightRadius: 10,
            borderBottomLeftRadius: 10,
            borderBottomRightRadius: 10,
            textAlign: 'left',
          }}
        >
          <SettingsButton
            sx={{
              py: 2.5,
              justifyContent: 'flex-start',
              px: 3,
            }}
            fullWidth
            onClick={onReportBugClick}
            startIcon={<BugReportRoundedIcon sx={{ mr: 1 }} />}
          >
            Report a bug
          </SettingsButton>

          {/* <Divider /> */}

          <SettingsButton
            sx={{
              py: 2.5,
              justifyContent: 'flex-start',
              px: 3,
            }}
            fullWidth
            onClick={onRequestFeatureClick}
            startIcon={<LightbulbRoundedIcon sx={{ mr: 1 }} />}
          >
            Request a feature
          </SettingsButton>
        </Box>
      </Box>
    </Box>
  );
};

const tabs = [
  {
    title: capitalize('preferences'),
    component: (props?: any) => <PreferenceView {...props} />,
  },
  {
    title: capitalize('support'),
    component: (props?: any) => <SupportView {...props} />,
  },
];

export default function SettingsView({ open, handleClose, onSave }: SettingsViewProps) {
  const [tabIndex, setTabIndex] = useState(0);
  const navigate = useNavigate();

  const api = new Api();

  const onLogoutClick = async () => {
    await api.logout();
    navigate(ROUTES.signIn);
  };

  const handleTabChange = (_: React.SyntheticEvent | null, newValue: number) => {
    if (newValue !== null) {
      setTabIndex(newValue);
    }
  };

  if (!open) {
    return <></>;
  }

  const background = isChromeExt ? chromeBackground : { background: 'linear-gradient(180deg, #FFFFFF 0%, rgba(255, 255, 255, 0.6) 100%)' };

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        right: 0,
        left: 0,
        height: '100%',
        zIndex: 10,
        width: '100%',
        boxShadow: 'none',
        overflow: 'hidden',
        ...background,
      }}
    >
      {/* inner nav bar */}
      <Box display={'flex'} alignItems={'center'} mx={2}>
        <TopBar sx={{ width: '100%' }}>
          {/* back icon */}
          <Box
            sx={{
              borderRadius: 100,
              backgroundColor: 'white',
              py: 1,
              px: 0,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center',
              mr: 0,
            }}
          >
            <IconButton aria-label="settings" sx={{ backgroundColor: 'white' }} onClick={handleClose}>
              <ArrowBackIosRoundedIcon
                fontSize="small"
                sx={[
                  (theme) => ({
                    color: theme.palette.common.black,
                  }),
                ]}
              />
            </IconButton>
          </Box>

          <Box flexGrow={1} />

          {/* nav bar */}
          <Box
            sx={{
              bgcolor: 'white',
              py: 0.5,
              px: 0.5,
              width: '100%',
              borderRadius: 30,
              textAlign: 'center',
            }}
          >
            <StyledToggleButtonGroup sx={{ mx: 0 }} value={tabIndex} exclusive onChange={handleTabChange} aria-label="event tabs" fullWidth={true}>
              <StyledToggleButton value={0} aria-label="new event" fullWidth={true}>
                Preferences
              </StyledToggleButton>
              <StyledToggleButton value={1} aria-label="my events" fullWidth={true}>
                Support
              </StyledToggleButton>
            </StyledToggleButtonGroup>
          </Box>
          {/* logout icon */}
          <Box
            sx={{
              borderRadius: 100,
              backgroundColor: 'white',
              py: 1,
              px: 0,
              display: 'flex',
              // width: '100%',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center',
              ml: 0,
            }}
          >
            <IconButton aria-label="settings" sx={{ mr: 0, backgroundColor: 'white' }} onClick={onLogoutClick}>
              <ExitToAppRoundedIcon
                fontSize="small"
                sx={[
                  (theme) => ({
                    color: theme.palette.common.black,
                  }),
                ]}
              />
            </IconButton>
          </Box>
        </TopBar>
      </Box>

      {tabs[tabIndex].component({ onSave: () => onSave() })}
    </Box>
  );
}
