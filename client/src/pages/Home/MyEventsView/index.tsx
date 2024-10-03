import { EventResponse } from '@bookify/shared';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTimeZoneString, renderError } from '../../../helpers/utility';
import Api from '../../../api/api';
import toast from 'react-hot-toast';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, styled, Typography } from '@mui/material';
import { EventCard } from '../../../components/EventCard';

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

export default function MyEventsView() {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<EventResponse[]>([]);
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteEventId, setDeleteEventId] = useState<string | null>(null);

  const api = new Api();

  useEffect(() => {
    const query = {
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
      timeZone: getTimeZoneString(),
    };

    api.getRooms(query.startTime, query.endTime, query.timeZone).then((res) => {
      const { data, status } = res;
      setLoading(false);

      if (status !== 'success') {
        renderError(res, navigate);
      }

      if (!data?.length) {
        return;
      }

      setEvents(data);
    });
  }, []);

  const handleDeleteClick = (id: string) => {
    setDeleteEventId(id);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setDeleteEventId(null);
  };

  const handleConfirmDelete = async () => {
    setLoading(true);
    setDialogOpen(false);

    if (!deleteEventId) {
      toast.error('Please select the event to delete');
      return;
    }

    const res = await api.deleteRoom(deleteEventId);
    const { data, status } = res;
    setLoading(false);

    if (status !== 'success') {
      return renderError(res, navigate);
    }

    if (data) {
      setEvents(events.filter((e) => e.eventId !== deleteEventId));
      toast.success('Deleted event!');
    }
  };

  const onEdit = (id: string, data: any) => {
    if (data) {
      const { start, end } = data;
      setEvents((prevEvents) => prevEvents.map((event) => (event.eventId === id ? { ...event, start, end } : event)));
      toast.success('Room has been updated');
    } else {
      //todo: add proper message from backend
      toast.error('Room was not updated');
    }
  };

  if (loading) return <></>;

  return (
    <Box>
      {events.length === 0 && (
        <Typography mt={3} variant="h6">
          No events to show
        </Typography>
      )}
      <Box
        sx={{
          borderBottomLeftRadius: 10,
          borderBottomRightRadius: 10,
          borderTopLeftRadius: 10,
          borderTopRightRadius: 10,
          pb: 1,
          px: 1.5,
          mx: 2,
          mt: 1,
          bgcolor: 'white',
        }}
      >
        {events.map((event, i) => (
          <React.Fragment key={i}>
            <EventCard key={i} event={event} onEdit={onEdit} disabled={loading} onDelete={() => event.eventId && handleDeleteClick(event.eventId)} />
            {i !== events.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </Box>

      {/* Confirmation Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle fontSize={20} fontWeight={800} id="alert-dialog-title">
          {'Confirm delete'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1">Are you sure you want to delete this event?</Typography>
        </DialogContent>
        <DialogActions>
          <CustomButton onClick={handleCloseDialog} color="primary">
            Cancel
          </CustomButton>
          <CustomButton onClick={() => handleConfirmDelete()} color="error" autoFocus>
            Delete
          </CustomButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
