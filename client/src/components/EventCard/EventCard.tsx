import { Typography, Chip, IconButton, Box, styled, Theme, SxProps, Menu, MenuItem } from '@mui/material';
import InsertLinkRoundedIcon from '@mui/icons-material/InsertLinkRounded';
import React, { useEffect, useState } from 'react';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { EventResponse } from '@bookify/shared';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditDialog from './EditDialog';
import MeetingRoomRoundedIcon from '@mui/icons-material/MeetingRoomRounded';
import StairsIcon from '@mui/icons-material/Stairs';
import AccessTimeFilledRoundedIcon from '@mui/icons-material/AccessTimeFilledRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import { EditRoomFields } from './util';
import { ROUTES } from '../../config/routes';
import Api from '../../api/api';
import { convertToLocaleTime } from '../../helpers/utility';

const ListItem = styled('li')(({ theme }) => ({
  margin: theme.spacing(0.3),
}));

export const createChips = (event: EventResponse) => {
  return [
    {
      label: convertToLocaleTime(event?.start) + ' - ' + convertToLocaleTime(event?.end),
      icon: <AccessTimeFilledRoundedIcon />,
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

interface EventCardProps {
  sx?: SxProps<Theme>;
  event?: EventResponse;
  onDelete: (id?: string) => void;
  disabled?: boolean;
  onEdit: (id: string, data: any) => void;
}

interface ChipData {
  icon: React.ReactElement;
  label: string;
  color?: string;
  type?: 'conference' | 'floor' | 'seats' | 'time' | 'room';
}

const EventCard = ({ sx, event, onDelete, disabled, onEdit }: EventCardProps) => {
  const [chips, setChips] = useState<ChipData[]>([]);
  const [isOngoingEvent, setIsOngoingEvent] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const navigate = useNavigate();
  const [formData, setFormData] = useState<EditRoomFields>({
    duration: 30,
  });

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

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

    setEditLoading(true);

    const res = await new Api().updateRoomDuration(event.eventId, event.roomEmail, formData.duration);

    setEditLoading(false);

    if (res?.redirect) {
      toast.error("Couldn't complete request. Redirecting to login page");
      setTimeout(() => {
        navigate(ROUTES.signIn);
      }, 1000);
    }

    if (res?.status === 'error') {
      res.message && toast.error(res.message);
      return;
    }

    if (event.eventId) {
      onEdit(event.eventId, res?.data);

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
    <Box
      sx={{
        py: 3,
        px: 1,
      }}
    >
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

      <EditDialog
        open={editDialogOpen}
        setOpen={setEditDialogOpen}
        onChange={handleInputChange}
        data={formData}
        loading={editLoading}
        onEditRoomClick={onEditRoomClick}
      />
    </Box>
  );
};

export default EventCard;
