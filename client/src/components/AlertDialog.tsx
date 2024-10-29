import Button from '@mui/material/Button';
import AppBar from '@mui/material/AppBar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { Box, Chip, SxProps, Theme } from '@mui/material';
import ArrowBackIosRoundedIcon from '@mui/icons-material/ArrowBackIosRounded';
import { EventResponse } from '@bookify/shared';
import MeetingRoomRoundedIcon from '@mui/icons-material/MeetingRoomRounded';
import StairsIcon from '@mui/icons-material/Stairs';
import AccessTimeFilledRoundedIcon from '@mui/icons-material/AccessTimeFilledRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import { chromeBackground, convertToLocaleTime, isChromeExt } from '../helpers/utility';
import TitleIcon from '@mui/icons-material/Title';

interface AlertDialogProps {
  handleNegativeClick: () => void;
  handlePositiveClick: () => void;
  open: boolean;
  event?: EventResponse;
}

export default function AlertDialog({ event, open, handleNegativeClick, handlePositiveClick }: AlertDialogProps) {
  if (!open) return <></>;

  const background: SxProps<Theme> = isChromeExt ? { ...chromeBackground } : { background: 'white' };
  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        height: '100%',
        zIndex: 10,
        width: '100%',
        boxShadow: 'none',
        overflow: 'hidden',
        ...background,
      }}
    >
      <AppBar
        sx={{ bgcolor: 'transparent', position: 'relative', display: 'flex', flexDirection: 'row', py: 2, alignItems: 'center', px: 3, boxShadow: 'none' }}
      >
        <IconButton edge="start" color="inherit" onClick={handleNegativeClick} aria-label="close">
          <ArrowBackIosRoundedIcon
            fontSize="small"
            sx={[
              (theme) => ({
                color: theme.palette.common.black,
              }),
            ]}
          />
        </IconButton>
      </AppBar>
      <Box
        sx={{
          mx: 3,
          alignItems: 'center',
          textAlign: 'center',
          pb: 1,
          my: 1,
          mt: 10,
        }}
      >
        <Typography variant="h4" fontWeight={700}>
          Confirm deletion
        </Typography>
        {event && (
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1,
              textAlign: 'center',
              justifyContent: 'center',
              mt: 2,
              mx: 1,
            }}
          >
            {event.summary && <Chip icon={<TitleIcon fontSize="small" />} label={event.summary} sx={{ fontSize: 15, backgroundColor: '#EFEFEF' }} />}
            {event.room && <Chip icon={<MeetingRoomRoundedIcon fontSize="small" />} label={event.room} sx={{ fontSize: 15, backgroundColor: '#EFEFEF' }} />}
            <Chip
              icon={<AccessTimeFilledRoundedIcon fontSize="small" />}
              label={convertToLocaleTime(event.start) + ' - ' + convertToLocaleTime(event.end)}
              sx={{ fontSize: 15, backgroundColor: '#EFEFEF', px: 0.5, py: 1 }}
            />
            {event.seats && <Chip icon={<PeopleRoundedIcon fontSize="small" />} label={event.seats} sx={{ fontSize: 15, backgroundColor: '#EFEFEF' }} />}
            {event.floor && <Chip icon={<StairsIcon fontSize="small" />} label={event.floor} sx={{ fontSize: 15, backgroundColor: '#EFEFEF' }} />}
          </Box>
        )}

        <Box
          sx={{
            mx: 2,
            mt: 4,
            mb: 3,
            textAlign: 'center',
          }}
        >
          <Button
            onClick={handlePositiveClick}
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
            <Typography
              variant="h6"
              fontWeight={700}
              color="error"
              sx={{
                textTransform: 'none',
              }}
            >
              Delete
            </Typography>
          </Button>

          <Button
            onClick={handleNegativeClick}
            variant="text"
            disableElevation
            sx={[
              (theme) => ({
                py: 1,
                px: 3,
                mt: 2,
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
                textTransform: 'none',
              }),
            ]}
          >
            <Typography variant="subtitle2" fontWeight={700}>
              Cancel
            </Typography>
          </Button>
        </Box>
      </Box>
      <Box flexGrow={1} />
    </Box>
  );
}
