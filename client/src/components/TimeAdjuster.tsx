import { Box, Button, SxProps, Theme, Typography } from '@mui/material';

interface TimeAdjusterProps {
  sx?: SxProps<Theme>;
  incrementBy: number;
  minAmount: number;
  decorator?: string;
  value: number;
  onChange: (newValue: number) => void;
}
export default function TimeAdjuster({ sx, incrementBy: adjustBy, minAmount, decorator, value, onChange }: TimeAdjusterProps) {
  const height = '65px';

  const handleIncrease = () => {
    onChange(value + adjustBy); // Pass updated value to parent
  };

  const handleDecrease = () => {
    onChange(Math.max(value - adjustBy, minAmount)); // Pass updated value to parent
  };

  const formatTime = (value: number) => {
    const hours = Math.floor(value / 60);
    const minutes = value % 60;

    let result = '';
    if (hours > 0) {
      result += `${hours} hr${hours > 1 ? 's' : ''} `;
    }
    if (minutes > 0 || hours === 0) {
      result += `${minutes}${decorator ? decorator : ''}`;
    }
    return result.trim();
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ECECEC',
        borderRadius: 1,
        overflow: 'hidden', // Ensure no overflow
        ...sx,
      }}
    >
      <Button
        onClick={handleDecrease}
        disableElevation
        sx={{
          fontSize: 25,
          boxShadow: 'none',
          minWidth: '40px',
          height,
          backgroundColor: '#D9D9D9',
          borderRadius: 0,
          '&:hover': {
            boxShadow: 'none',
            backgroundColor: '#c0c0c0',
          },
          '&:focus': {
            boxShadow: 'none',
            backgroundColor: '#D9D9D9',
          },
        }}
      >
        -
      </Button>
      <Typography
        variant="subtitle1"
        sx={{
          flex: 1,
          textAlign: 'center',
          backgroundColor: '#ECECEC',
        }}
      >
        {formatTime(value)}
      </Typography>
      <Button
        disableElevation
        onClick={handleIncrease}
        sx={{
          fontSize: 25,
          height,
          boxShadow: 'none',
          minWidth: '40px',
          backgroundColor: '#D9D9D9',
          borderRadius: 0,
          '&:hover': {
            boxShadow: 'none',
            backgroundColor: '#c0c0c0',
          },
          '&:focus': {
            boxShadow: 'none',
            backgroundColor: '#D9D9D9',
          },
        }}
      >
        +
      </Button>
    </Box>
  );
}
