import { Typography, Chip, IconButton, Box, styled, Theme, SxProps, Menu, MenuItem } from '@mui/material';
import InsertLinkRoundedIcon from '@mui/icons-material/InsertLinkRounded';
import React, { useEffect, useState } from 'react';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { BookRoomDto, EventResponse } from '@bookify/shared';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditDialog from './EditDialog';
import MeetingRoomRoundedIcon from '@mui/icons-material/MeetingRoomRounded';
import StairsIcon from '@mui/icons-material/Stairs';
import AccessTimeFilledRoundedIcon from '@mui/icons-material/AccessTimeFilledRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import { ROUTES } from '../../config/routes';
import Api from '../../api/api';
import { convertToLocaleTime, convertToRFC3339, getTimeZoneString } from '../../helpers/utility';
import { FormData } from '../../helpers/types';

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
  event: EventResponse;
  onDelete: (id?: string) => void;
  handleEditClick: (id: string) => void;
  disabled?: boolean;
}

interface ChipData {
  icon: React.ReactElement;
  label: string;
  color?: string;
  type?: 'conference' | 'floor' | 'seats' | 'time' | 'room';
}

const EventCard = ({ sx, event, onDelete, handleEditClick }: EventCardProps) => {
  const [chips, setChips] = useState<ChipData[]>([]);
  const [isOngoingEvent, setIsOngoingEvent] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const [currentRoom, setCurrentRoom] = useState({});

  useEffect(() => {
    console.log('event', event);
    const startInMs = new Date(event.start!).getTime();
    const endInMs = new Date(event.end!).getTime();
    const currentTimeInMs = Date.now();

    if (currentTimeInMs >= startInMs && currentTimeInMs <= endInMs) {
      setIsOngoingEvent(true);
    } else {
      setIsOngoingEvent(false);
    }

    const _chips: ChipData[] = createChips(event);

    if (event.meet) {
      _chips.push({
        label: event.meet,
        type: 'conference',
        icon: <InsertLinkRoundedIcon />,
      });
    }

    setChips(_chips);
  }, [event]);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const onEditClick = () => {
    handleEditClick(event.eventId!);
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
      }}
    >
      <Box display={'flex'} alignItems="center" pl={2}>
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
          <MenuItem onClick={onEditClick}>Edit</MenuItem>
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
          px: 2,
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
    </Box>
  );
};

export default EventCard;
