import Button from '@mui/material/Button';
import AppBar from '@mui/material/AppBar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { Box } from '@mui/material';
import ArrowBackIosRoundedIcon from '@mui/icons-material/ArrowBackIosRounded';

interface AlertDialogProps {
  handleNegativeClick: () => void;
  handlePositiveClick: () => void;
  open: boolean;
}

export default function AlertDialog({ open, handleNegativeClick, handlePositiveClick }: AlertDialogProps) {
  if (!open) return <></>;

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
        backgroundColor: 'white',
        // background: 'linear-gradient(to bottom right, #ffffff, #fffbeb, #f0f9ff)',
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
          mx: 2,
          alignItems: 'center',
          textAlign: 'center',
          pb: 1,
          my: 1,
          mt: 15,
        }}
      >
        <Typography variant="h4" fontWeight={700}>
          Confirm delete
        </Typography>

        <Typography variant="h5" mt={2} fontWeight={400}>
          Are you sure you want to delete this event?
        </Typography>
        <Box
          sx={{
            mx: 2,
            mt: 6,
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
            <Typography variant="h6" fontWeight={700} color="error">
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
