import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import AppBar from '@mui/material/AppBar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Slide from '@mui/material/Slide';
import { TransitionProps } from '@mui/material/transitions';
import { Box, Divider, useTheme } from '@mui/material';
import ArrowBackIosRoundedIcon from '@mui/icons-material/ArrowBackIosRounded';
import Dropdown, { DropdownOption } from '../../components/Dropdown';
import { ROUTES } from '../../config/routes';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import HourglassBottomRoundedIcon from '@mui/icons-material/HourglassBottomRounded';
import StairsIcon from '@mui/icons-material/Stairs';
import { CacheService, CacheServiceFactory } from '../../helpers/cache';
import Api from '../../api/api';
import { createDropdownOptions, renderError } from '../../helpers/utility';
import { availableDurations, availableRoomCapacities } from './shared';
import { capitalize } from 'lodash';
import { styled, ToggleButton, ToggleButtonGroup } from '@mui/material';
import ExitToAppRoundedIcon from '@mui/icons-material/ExitToAppRounded';
import BugReportRoundedIcon from '@mui/icons-material/BugReportRounded';
import { secrets } from '../../config/secrets';
import LightbulbRoundedIcon from '@mui/icons-material/LightbulbRounded';

const isChromeExt = secrets.appEnvironment === 'chrome';
// const isChromeExt = true;

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="left" ref={ref} {...props} />;
});

const TopBar = styled(Box)(({ theme }) => ({
  paddingTop: theme.spacing(1.5),
  paddingBottom: theme.spacing(1.5),
  display: 'flex',
  width: '100%',
  justifyContent: 'center',
  alignItems: 'center',
  textAlign: 'center',
}));

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  backgroundColor: '#f9f9f9',
  borderRadius: 30,
}));

const StyledToggleButton = styled(ToggleButton)(({ theme }) => ({
  borderRadius: 30,
  border: 'none',
  textTransform: 'none',
  padding: '15px',
  '&.Mui-selected': {
    border: 'none',
    backgroundColor: theme.palette.grey[100],
    color: theme.palette.text.primary,
    '&:hover': {
      backgroundColor: theme.palette.grey[100],
    },
  },
}));

const SettingsButton = styled(Button)(({ theme }) => ({
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

interface SettingsDialogProps {
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
  });
  const [floorOptions, setFloorOptions] = useState<DropdownOption[]>([]);
  const [durationOptions, setDurationOptions] = useState<DropdownOption[]>([]);
  const [roomCapacityOptions, setRoomCapacityOptions] = useState<DropdownOption[]>([]);
  const cacheService: CacheService = CacheServiceFactory.getCacheService();
  const api = new Api();

  const navigate = useNavigate();

  useEffect(() => {
    const init = async (floors: string[]) => {
      setFloorOptions(createDropdownOptions(floors));
      setDurationOptions(createDropdownOptions(availableDurations, 'time'));

      const floor = await cacheService.get('floor');
      const duration = await cacheService.get('duration');
      const seats = await cacheService.get('seats');

      setFormData({
        ...formData,
        floor: floor || '',
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
    console.log('value', value);

    if (value === '') {
      // remove the id
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [id]: value,
      }));
    }
  };

  const onSaveClick = async () => {
    await cacheService.save('floor', formData.floor);
    await cacheService.save('duration', formData.duration);
    await cacheService.save('seats', formData.seats.toString());
    toast.success('Saved successfully!');
    onSave();
  };

  return (
    <Box
      mx={2}
      mt={1}
      sx={{
        // backgroundColor: 'rgba(0, 0, 0, 0.08)',
        borderRadius: 10,
      }}
    >
      <Box
        sx={{
          bgcolor: 'white',
          borderRadius: 10,
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

        <Divider sx={{ mx: 2 }} />
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
        <Divider sx={{ mx: 2 }} />
        <Dropdown
          sx={{ height: '60px', borderBottomLeftRadius: 15, borderBottomRightRadius: 15 }}
          id="seats"
          placeholder={'Select preferred room capacity'}
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
        backgroundColor: 'rgba(0, 0, 0, 0.08)',
        borderRadius: 10,
      }}
    >
      <Box
        sx={{
          bgcolor: 'white',
          borderRadius: 10,
          textAlign: 'left',
          pt: 2,
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

        <Divider />

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

export default function SettingsDialog({ open, handleClose, onSave }: SettingsDialogProps) {
  const theme = useTheme();
  const [tabIndex, setTabIndex] = useState(0);
  const navigate = useNavigate();

  const api = new Api();

  const onLogoutClick = async () => {
    await api.logout();
    navigate(ROUTES.signIn);
  };

  const handleTabChange = (event: React.SyntheticEvent | null, newValue: number) => {
    if (newValue !== null) {
      setTabIndex(newValue);
    }
  };

  return (
    <Dialog
      fullWidth
      fullScreen={isChromeExt}
      hideBackdrop
      PaperProps={{
        sx: {
          width: '100%',
          [theme.breakpoints.up('sm')]: {
            maxWidth: '412px',
          },
          [theme.breakpoints.down('sm')]: {
            width: '450px',
          },
          height: isChromeExt ? '100%' : '750px',
          mx: isChromeExt ? 0 : 1.5,
          borderRadius: isChromeExt ? 0 : 2.8,
          boxShadow: 'none',
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: 'white',
          // background: 'linear-gradient(to bottom right, #ffffff, #fffbeb, #f0f9ff)',
        },
      }}
      open={open}
      onClose={handleClose}
      TransitionComponent={Transition}
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
          Settings
        </Typography>
      </AppBar>

      {/* inner nav bar */}
      <Box display={'flex'} alignItems={'center'} mx={2}>
        <Box sx={{ width: '100%' }}>
          <TopBar>
            <StyledToggleButtonGroup value={tabIndex} exclusive onChange={handleTabChange} aria-label="event tabs" fullWidth={true}>
              <StyledToggleButton value={0} aria-label="new event" fullWidth={true}>
                <Typography variant="subtitle2">Preferences</Typography>
              </StyledToggleButton>
              <StyledToggleButton value={1} aria-label="my events" fullWidth={true}>
                <Typography variant="subtitle2">Support</Typography>
              </StyledToggleButton>
            </StyledToggleButtonGroup>
          </TopBar>
        </Box>
        <Box>
          <IconButton aria-label="settings" sx={{ ml: 1 }} onClick={onLogoutClick}>
            <ExitToAppRoundedIcon fontSize="medium" />
          </IconButton>
        </Box>
      </Box>

      {tabs[tabIndex].component({ onSave: () => onSave() })}
    </Dialog>
  );
}
