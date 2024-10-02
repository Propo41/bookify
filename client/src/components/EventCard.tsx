import {
  Card,
  Typography,
  Chip,
  IconButton,
  Box,
  styled,
  Theme,
  SxProps,
  Divider,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Menu,
  MenuItem,
  Slide,
  AppBar,
} from '@mui/material';
import HourglassBottomRoundedIcon from '@mui/icons-material/HourglassBottomRounded';
import MeetingRoomRoundedIcon from '@mui/icons-material/MeetingRoomRounded';
import InsertLinkRoundedIcon from '@mui/icons-material/InsertLinkRounded';
import StairsIcon from '@mui/icons-material/Stairs';
import React, { useEffect, useState } from 'react';
import AccessTimeFilledRoundedIcon from '@mui/icons-material/AccessTimeFilledRounded';
import ArrowBackIosRoundedIcon from '@mui/icons-material/ArrowBackIosRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { convertToLocaleTime, createDropdownOptions, populateDurationOptions } from '../helpers/utility';
import { FormData } from '../helpers/types';
import TimeAdjuster from './TimeAdjuster';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../config/routes';
import Api from '../api/api';
import { EventResponse } from '@bookify/shared';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { TransitionProps } from '@mui/material/transitions';
import Dropdown, { DropdownOption } from './Dropdown';
import StyledTextField from './StyledTextField';

interface ChipData {
  icon: React.ReactElement;
  label: string;
  color?: string;
  type?: 'conference' | 'floor' | 'seats' | 'time' | 'room';
}

interface EventCardProps {
  sx?: SxProps<Theme>;
  event?: EventResponse;
  onDelete: (id?: string) => void;
  disabled?: boolean;
  onEdit: (id: string, data: any) => void;
}

type EditRoomFields = Pick<FormData, 'duration'>;

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="left" ref={ref} {...props} />;
});

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

const ListItem = styled('li')(({ theme }) => ({
  margin: theme.spacing(0.3),
}));

const createChips = (event: EventResponse) => {
  return [
    {
      label: convertToLocaleTime(event?.start) + ' - ' + convertToLocaleTime(event?.end),
      icon: <AccessTimeFilledRoundedIcon />,
      color: '#9BF679',
    },
    {
      label: event?.seats + '' || '-',
      icon: <PeopleRoundedIcon />,
    },
    {
      label: event?.room || '-',
      icon: <MeetingRoomRoundedIcon />,
    },
    {
      label: event?.floor || '-',
      icon: <StairsIcon />,
    },
  ];
};

const EventCard = ({ sx, event, onDelete, disabled, onEdit }: EventCardProps) => {
  const [chips, setChips] = useState<ChipData[]>([]);
  const [isOngoingEvent, setIsOngoingEvent] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [formData, setFormData] = useState<EditRoomFields>({
    duration: 30,
  });
  const [durationOptions, setDurationOptions] = useState<DropdownOption[]>([]);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  // TODO: create separate component for the dialog
  useEffect(() => {
    if (editDialogOpen) {
      const durationOptions = populateDurationOptions(30, 3 * 60); // 30 mins -> 5 hrs
      setDurationOptions(createDropdownOptions(durationOptions, 'time'));
    }
  }, [editDialogOpen]);

  useEffect(() => {
    if (event) {
      const startInMs = new Date(event.start!).getTime();
      const endInMs = new Date(event.end!).getTime();
      const currentTimeInMs = Date.now();

      if (currentTimeInMs >= startInMs && currentTimeInMs <= endInMs) {
        setIsOngoingEvent(true);
      } else {
        setIsOngoingEvent(false);
      }

      const duration = (endInMs - startInMs) / (1000 * 60);
      setFormData((prev) => {
        return {
          ...prev,
          duration,
        };
      });

      const _chips: ChipData[] = createChips(event);

      if (event.meet) {
        _chips.push({
          label: event.meet,
          type: 'conference',
          icon: <InsertLinkRoundedIcon />,
          color: '#99D2FF',
        });
      }

      setChips(_chips);
    }
  }, [event]);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const onEditRoomClick = async () => {
    if (!event?.eventId || !event?.roomEmail) return;

    console.log('edit room:', formData);
    setLoading(true);

    const res = await new Api().updateRoomDuration(event.eventId, event.roomEmail, formData.duration);

    if (res?.redirect) {
      toast.error("Couldn't complete request. Redirecting to login page");
      setTimeout(() => {
        navigate(ROUTES.signIn);
      }, 2000);
    }

    if (res?.status === 'error') {
      res.message && toast.error(res.message);
      setLoading(false);
      setEditDialogOpen(false);
      return;
    }

    if (event.eventId) {
      onEdit(event.eventId, res?.data);

      setLoading(false);
      setEditDialogOpen(false);
    }
  };

  const handleInputChange = (id: string, value: string | number | string[] | boolean) => {
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));

    console.log(formData);
  };

  const handleEditClick = () => {
    setEditDialogOpen(true);
    setAnchorEl(null);
  };

  const handleDeleteClick = () => {
    onDelete(event!.eventId);
    setAnchorEl(null);
  };

  return (
    <Card sx={{ borderRadius: 2, pt: 2, pb: 3, px: 1.5, ...sx }}>
      <Box display={'flex'} alignItems="center">
        <Typography
          variant="h5"
          component="div"
          sx={{
            textAlign: 'left',
          }}
        >
          {event?.summary}
        </Typography>
        {isOngoingEvent && <FiberManualRecordIcon fontSize="small" sx={{ pl: 1 }} color="success" />}
        <Box flexGrow={1} />

        {/* Options menu */}

        <IconButton
          aria-label="more"
          id="basic-button"
          aria-controls={open ? 'basic-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          onClick={handleClick}
          sx={{ p: 0 }}
        >
          <MoreVertIcon />
        </IconButton>

        <Menu
          id="basic-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={() => setAnchorEl(null)}
          MenuListProps={{
            'aria-labelledby': 'basic-button',
          }}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          slotProps={{
            paper: {
              style: {
                width: '15ch',
              },
            },
          }}
        >
          <MenuItem onClick={handleEditClick}>Edit</MenuItem>
          <MenuItem onClick={handleDeleteClick}>Delete</MenuItem>
        </Menu>
      </Box>

      <Box
        component="ul"
        sx={{
          display: 'flex',
          justifyContent: 'left',
          flexWrap: 'wrap',
          listStyle: 'none',
          p: 0,
          m: 0,
          mt: 1,
        }}
      >
        {chips.map((chip, i) => {
          return (
            <ListItem key={i} sx={{ mt: 0.4 }}>
              <Chip
                icon={chip.icon}
                label={chip.label}
                sx={{
                  fontSize: 15,
                  backgroundColor: chip.color,
                  cursor: chip.type === 'conference' ? 'pointer' : 'auto',
                }}
                onClick={() => {
                  if (chip.type === 'conference') {
                    window.open(`https://meet.google.com/${chip.label}`, '_blank');
                  }
                }}
              />
            </ListItem>
          );
        })}
      </Box>

      {/* edit dialog*/}
      <Dialog fullScreen open={editDialogOpen} onClose={() => setEditDialogOpen(false)} TransitionComponent={Transition}>
        <AppBar
          sx={{ bgcolor: 'transparent', position: 'relative', display: 'flex', flexDirection: 'row', py: 2, alignItems: 'center', px: 4, boxShadow: 'none' }}
        >
          <IconButton edge="start" color="inherit" onClick={() => setEditDialogOpen(false)} aria-label="close">
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
          mt={2}
          mx={4}
          sx={{
            py: 1,
            px: 2,
            bgcolor: 'white',
            borderTopLeftRadius: 10,
            borderTopRightRadius: 10,
            borderBottomLeftRadius: 15,
            borderBottomRightRadius: 15,
          }}
        >
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
        </Box>

        <Box flexGrow={1} />
        <Box
          sx={{
            mx: 4,
            mb: 3,
            textAlign: 'center',
          }}
        >
          <Button
            onClick={onEditRoomClick}
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
          <Button
            variant="text"
            onClick={() => setEditDialogOpen(false)}
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
              Dismiss
            </Typography>
          </Button>
        </Box>
      </Dialog>
    </Card>
  );
};

export default EventCard;
