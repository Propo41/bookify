import Button from '@mui/material/Button';
import AppBar from '@mui/material/AppBar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { Box, Checkbox, Divider } from '@mui/material';
import StyledTextField from '../../components/StyledTextField';
import ChipInput from '../../components/ChipInput';
import ArrowBackIosRoundedIcon from '@mui/icons-material/ArrowBackIosRounded';
import { FormData } from '../../helpers/types';

interface AdvancedOptionsDialogProps {
  handleInputChange: (id: string, value: string | number | string[] | boolean) => void;
  handleClose: () => void;
  open: boolean;
  formData: FormData;
}

export default function AdvancedOptionsDialog({ handleInputChange, open, handleClose, formData }: AdvancedOptionsDialogProps) {
  if (!open) return <></>;

  console.log(formData);

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        right: 0,
        left: 0,
        height: '100%',
        zIndex: 100,
        boxShadow: 'none',
        overflow: 'hidden',
        backgroundColor: 'white',
        // background: 'linear-gradient(to bottom right, #ffffff, #fffbeb, #f0f9ff)',
      }}
    >
      <AppBar
        sx={{
          bgcolor: 'transparent',
          position: 'relative',
          display: 'flex',
          flexDirection: 'row',
          py: 2,
          alignItems: 'center',
          px: 3,
          boxShadow: 'none',
        }}
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
          Additional options
        </Typography>
      </AppBar>
      <Box
        mx={2}
        mt={2}
        sx={{
          background: 'rgba(242, 242, 242, 0.5)',
          backdropFilter: 'blur(100px)',
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
            pb: 2,
            my: 1,
            mt: 2,
          }}
        >
          <Typography variant="subtitle1">Create meet link: </Typography>
          <Checkbox checked={formData.conference} value={formData.conference} onChange={(e) => handleInputChange('conference', e.target.checked)} />
        </Box>
      </Box>
      <Box
        sx={{
          mx: 2,
          mb: 3,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
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
    </Box>
  );
}
