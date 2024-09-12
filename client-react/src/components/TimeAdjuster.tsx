import { Box, Button, SxProps, Theme, Typography } from '@mui/material';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface TimeAdjusterProps {
  sx?: SxProps<Theme>;
  incrementBy: number;
  minAmount: number;
  decorator?: string;
}
export default function TimeAdjuster({ sx, incrementBy: adjustBy, minAmount, decorator }: TimeAdjusterProps) {
  const [time, setTime] = useState(minAmount);
  const height = '65px';

  const handleIncrease = () => {
    setTime((prev) => prev + adjustBy);
  };

  const handleDecrease = () => {
    setTime((prev) => Math.max(prev - adjustBy, minAmount));
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
        {time}
        {decorator ?? ''}
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
