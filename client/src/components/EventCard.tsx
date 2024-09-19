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
} from '@mui/material';
import DeleteForeverRoundedIcon from '@mui/icons-material/DeleteForeverRounded';
import MeetingRoomRoundedIcon from '@mui/icons-material/MeetingRoomRounded';
import InsertLinkRoundedIcon from '@mui/icons-material/InsertLinkRounded';
import StairsIcon from '@mui/icons-material/Stairs';
import React, { useEffect, useState } from 'react';
import AccessTimeFilledRoundedIcon from '@mui/icons-material/AccessTimeFilledRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';

import { convertToLocaleTime } from '../helpers/utility';
import { FormData, RoomResponse } from '../helpers/types';
import TimeAdjuster from './TimeAdjuster';
import { makeRequest } from '../helpers/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../config/routes';

interface ChipData {
  icon: React.ReactElement;
  label: string;
  color?: string;
  type?: 'conference' | 'floor' | 'seats' | 'time' | 'room';
}

interface EventCardProps {
  sx?: SxProps<Theme>;
  event?: RoomResponse;
  onDelete: (id?: string) => void;
  disabled?: boolean;
  onEdit: (id: string, data: any) => void;
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

const ListItem = styled('li')(({ theme }) => ({
  margin: theme.spacing(0.3),
}));

const createChips = (event: RoomResponse) => {
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

  type EditRoomFields = Pick<FormData, 'duration'>;
  const [formData, setFormData] = useState<EditRoomFields>({
    duration: 30,
  });

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

      if (event.conference) {
        _chips.push({
          label: event.conference,
          type: 'conference',
          icon: <InsertLinkRoundedIcon />,
          color: '#99D2FF',
        });
      }

      setChips(_chips);
    }
  }, [event]);

  const onEditRoomClick = async () => {
    if (!event) return;

    console.log('edit room:', formData);
    setLoading(true);

    const { data, redirect } = await makeRequest('/room/duration', 'PUT', {
      eventId: event.id,
      duration: formData.duration,
      roomId: event.roomEmail,
    });

    if (redirect) {
      toast.error("Couldn't complete request. Redirecting to login page");
      setTimeout(() => {
        navigate(ROUTES.signIn);
      }, 2000);
    }

    if (data?.error) {
      toast.error(data.message);
      setLoading(false);
      setEditDialogOpen(false);
      return;
    }

    if (event.id) {
      onEdit(event.id, data);

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

  return (
    <Card sx={{ borderRadius: 2, py: 1.5, px: 1.5, ...sx }}>
      <Box display={'flex'}>
        <Typography
          variant="h5"
          component="div"
          sx={{
            textAlign: 'left',
          }}
        >
          {event?.title}
        </Typography>
        <Box flexGrow={1} />
        {isOngoingEvent && (
          <Chip
            label="Ongoing"
            sx={[
              (theme) => ({
                borderRadius: 1,
                backgroundColor: theme.palette.error.main,
                color: theme.palette.common.white,
              }),
            ]}
          />
        )}
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
                  fontSize: 14,
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

      <Divider sx={{ my: 1 }} />

      <CardActions sx={{ p: 0, justifyContent: 'flex-end' }}>
        <IconButton disabled={disabled || false} color={'primary'} onClick={() => setEditDialogOpen(true)}>
          <EditRoundedIcon />
        </IconButton>
        <IconButton disabled={disabled || false} color={'error'} onClick={() => onDelete(event!.id)}>
          <DeleteForeverRoundedIcon />
        </IconButton>
      </CardActions>

      {/* edit dialog*/}
      <Dialog
        PaperProps={{
          sx: { width: '350px' },
        }}
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
      >
        <DialogTitle fontSize={20} fontWeight={800} id="alert-dialog-title">
          {'Edit event'}
        </DialogTitle>
        <DialogContent>
          <Box
            sx={{
              textAlign: 'center',
              mt: 2,
              mb: 2,
            }}
          >
            <TimeAdjuster
              incrementBy={15}
              minAmount={15}
              decorator={'m'}
              value={formData.duration}
              onChange={(newValue) => handleInputChange('duration', newValue)}
            />
            <Typography
              variant="subtitle1"
              sx={[
                (theme) => ({
                  color: theme.palette.grey[400],
                  fontStyle: 'italic',
                }),
              ]}
            >
              Duration
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <CustomButton disabled={loading} onClick={() => setEditDialogOpen(false)}>
            Dismiss
          </CustomButton>
          <CustomButton disabled={loading} variant="text" color="error" disableElevation onClick={onEditRoomClick}>
            Save changes
          </CustomButton>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default EventCard;
