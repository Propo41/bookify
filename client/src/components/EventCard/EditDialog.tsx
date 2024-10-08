import { AppBar, Box, Button, Divider, IconButton, Typography } from '@mui/material';
import Dropdown, { DropdownOption } from '../Dropdown';
import React, { useEffect } from 'react';
import ArrowBackIosRoundedIcon from '@mui/icons-material/ArrowBackIosRounded';
import { createDropdownOptions } from '../../helpers/utility';
import HourglassBottomRoundedIcon from '@mui/icons-material/HourglassBottomRounded';
import { EditRoomFields } from './util';
import { availableDurations } from '../../pages/Home/shared';
import { LoadingButton } from '@mui/lab';

interface EditDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onChange: (id: string, value: string | number | string[] | boolean) => void;
  data: EditRoomFields;
  onEditRoomClick: () => void;
  loading?: boolean;
}

export default function EditDialog({ open, setOpen, onChange, data, onEditRoomClick, loading }: EditDialogProps) {
  const [durationOptions, setDurationOptions] = React.useState<DropdownOption[]>([]);

  useEffect(() => {
    if (open) {
      setDurationOptions(createDropdownOptions(availableDurations, 'time'));
    }
  }, [open]);

  const handleClose = () => {
    setOpen(false);
  };

  if (!open) return <></>;

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '100%',
        zIndex: 10,
        boxShadow: 'none',
        overflow: 'hidden',
        backgroundColor: 'white',
        // background: 'linear-gradient(to bottom right, #ffffff, #fffbeb, #f0f9ff)',
      }}
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
          Edit event
        </Typography>
      </AppBar>

      <Box
        mt={2}
        mx={4}
        sx={{
          py: 1,
          px: 0,
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
          value={data.duration.toString()}
          onChange={onChange}
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
        <Divider />
      </Box>

      <Box
        sx={{
          mx: 4,
          mb: 3,
          textAlign: 'center',
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
        }}
      >
        <LoadingButton
          onClick={onEditRoomClick}
          fullWidth
          variant="contained"
          disableElevation
          loading={loading}
          loadingPosition="start"
          startIcon={<></>}
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
            Save changes
          </Typography>
        </LoadingButton>

        <Button
          variant="text"
          onClick={handleClose}
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
            Cancel
          </Typography>
        </Button>
      </Box>
    </Box>
  );
}
