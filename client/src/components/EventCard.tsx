import { Card, Typography, Chip, IconButton, Box, styled, Theme, SxProps, Divider, CardActions } from '@mui/material';
import DeleteForeverRoundedIcon from '@mui/icons-material/DeleteForeverRounded';
import MeetingRoomRoundedIcon from '@mui/icons-material/MeetingRoomRounded';
import InsertLinkRoundedIcon from '@mui/icons-material/InsertLinkRounded';
import StairsIcon from '@mui/icons-material/Stairs';
import React, { useEffect, useState } from 'react';
import AccessTimeFilledRoundedIcon from '@mui/icons-material/AccessTimeFilledRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import { convertToLocaleTime } from '../helpers/utility';
import { RoomResponse } from '../helpers/types';

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
}

const ListItem = styled('li')(({ theme }) => ({
  margin: theme.spacing(0.3),
}));

const EventCard = ({ sx, event, onDelete, disabled }: EventCardProps) => {
  const [chips, setChips] = useState<ChipData[]>([]);

  useEffect(() => {
    const _chips: ChipData[] = [
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

    if (event?.conference) {
      _chips.push({
        label: event.conference,
        type: 'conference',
        icon: <InsertLinkRoundedIcon />,
        color: '#99D2FF',
      });
    }

    setChips(_chips);
  }, [event]);

  return (
    <Card sx={{ borderRadius: 2, py: 1.5, px: 1.5, ...sx }}>
      <Typography
        variant="h5"
        component="div"
        sx={{
          textAlign: 'left',
        }}
      >
        {event?.title}
      </Typography>

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
        {/* <IconButton disabled={disabled || false}  aria-label="edit" color={'primary'}>
          <EditRoundedIcon />
        </IconButton> */}
        <IconButton disabled={disabled || false} aria-label="delete" color={'error'} onClick={() => onDelete(event!.id)}>
          <DeleteForeverRoundedIcon />
        </IconButton>
      </CardActions>
    </Card>
  );
};

export default EventCard;
