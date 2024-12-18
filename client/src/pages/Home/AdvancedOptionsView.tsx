import Button from '@mui/material/Button';
import AppBar from '@mui/material/AppBar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { Box, Checkbox, Divider } from '@mui/material';
import StyledTextField from '@components/StyledTextField';
import ChipInput from '@components/ChipInput';
import ArrowBackIosRoundedIcon from '@mui/icons-material/ArrowBackIosRounded';
import { FormData } from '@helpers/types';
import { chromeBackground, isChromeExt } from '@helpers/utility';

interface AdvancedOptionsViewProps {
  handleInputChange: (id: string, value: string | number | string[] | boolean) => void;
  handleClose: () => void;
  open: boolean;
  formData: FormData;
}

export default function AdvancedOptionsView({ handleInputChange, open, handleClose, formData }: AdvancedOptionsViewProps) {
  if (!open) return <></>;

  const background = isChromeExt ? chromeBackground : { background: 'linear-gradient(180deg, #FFFFFF 0%, rgba(255, 255, 255, 0.9) 100%)' };

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
        ...background,
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
          background: isChromeExt ? 'rgba(255, 255, 255, 0.4)' : 'rgba(245, 245, 245, 0.5);',
          backdropFilter: 'blur(100px)',
          borderBottomLeftRadius: 10,
          borderBottomRightRadius: 10,
          borderTopLeftRadius: 10,
          borderTopRightRadius: 10,
        }}
      >
        <Box
          sx={{
            px: 1,
            py: 1,
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
            <StyledTextField value={formData.title} placeholder="Add title" id="title" onChange={handleInputChange} />
            <Divider />

            <ChipInput sx={{ mt: 1 }} id="attendees" onChange={handleInputChange} value={formData.attendees} />
          </Box>
          <Box
            sx={{
              display: 'flex',
              mx: 2,
              alignItems: 'center',
              my: 1,
              mt: 2,
            }}
          >
            <Typography variant="subtitle1">Create meet link: </Typography>
            <Checkbox checked={formData.conference} value={formData.conference} onChange={(e) => handleInputChange('conference', e.target.checked)} />
          </Box>
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
              textTransform: 'none',
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
