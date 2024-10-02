import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import Slide from '@mui/material/Slide';
import { TransitionProps } from '@mui/material/transitions';
import { Box, Checkbox, Divider } from '@mui/material';
import StyledTextField from '../../components/StyledTextField';
import ChipInput from '../../components/ChipInput';
import ArrowBackIosRoundedIcon from '@mui/icons-material/ArrowBackIosRounded';
import { FormData } from '../../helpers/types';

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="left" ref={ref} {...props} />;
});

interface AdvancedOptionsDialogProps {
  handleInputChange: (id: string, value: string | number | string[] | boolean) => void;
  handleClose: () => void;
  open: boolean;
  formData: FormData;
}

export default function AdvancedOptionsDialog({ handleInputChange, open, handleClose, formData }: AdvancedOptionsDialogProps) {
  return (
    <Dialog fullScreen open={open} onClose={handleClose} TransitionComponent={Transition}>
      <AppBar
        sx={{ bgcolor: 'transparent', position: 'relative', display: 'flex', flexDirection: 'row', py: 2, alignItems: 'center', px: 2, boxShadow: 'none' }}
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
          Advance options
        </Typography>
      </AppBar>
      <Box
        mx={2}
        mt={2}
        sx={{
          backgroundColor: 'rgba(0, 0, 0, 0.08)',
          borderBottomLeftRadius: 10,
          borderBottomRightRadius: 10,
          borderTopLeftRadius: 10,
          borderTopRightRadius: 10,
        }}
      >
        <Box
          sx={{
            pt: 1,
            px: 2,
            bgcolor: 'white',
            borderTopLeftRadius: 10,
            borderTopRightRadius: 10,
            borderBottomLeftRadius: 15,
            borderBottomRightRadius: 15,
          }}
        >
          <StyledTextField value={formData.title} id="title" onChange={handleInputChange} />
          <Divider />

          <ChipInput sx={{ mt: 1 }} id="attendees" onChange={handleInputChange} value={formData.attendees} />
        </Box>
        <Box
          sx={{
            display: 'flex',
            mx: 2,
            alignItems: 'center',
            pb: 1,
            my: 1,
            mt: 2,
          }}
        >
          <Typography variant="subtitle1">Create meet link: </Typography>
          <Checkbox onChange={(e) => handleInputChange('conference', e.target.checked)} />
        </Box>
      </Box>
      <Box flexGrow={1} />
      <Box
        sx={{
          mx: 2,
          mb: 3,
        }}
      >
        <Button
          onClick={handleClose}
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
    </Dialog>
  );
}
