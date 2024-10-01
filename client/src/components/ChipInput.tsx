import React, { useState } from 'react';
import { TextField, Chip, Box, SxProps, Theme } from '@mui/material';

interface ChipInputProps {
  id: string;
  sx?: any;
  value?: any[];
  disabled?: boolean;
  onChange: (id: string, value: string[]) => void;
}

export default function ChipInput({ id, sx, onChange, value }: ChipInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [chips, setChips] = useState<any[]>(value || []);

  const handleKeyDown = (event: any) => {
    if (event.key === ' ' && inputValue.trim() !== '') {
      const newChips = [...chips, inputValue.trim()];
      setChips(newChips);
      setInputValue('');

      onChange(id, newChips);
    }
  };

  const handleDelete = (chipToDelete: any[]) => {
    const newChips = chips.filter((chip) => chip !== chipToDelete);
    setChips(newChips);
    onChange(id, newChips);
  };

  return (
    <Box
      display="flex"
      alignItems="center"
      flexWrap="wrap"
      sx={[
        (theme) => ({
          gap: '8px',
          padding: '15px',
          borderRadius: 1,
          backgroundColor: '#f9f9f9',
          '&:focus-within': {
            border: 'none',
          },
          ...sx,
        }),
      ]}
    >
      {chips.map((chip, index) => (
        <Chip
          key={index}
          label={chip}
          onDelete={() => handleDelete(chip)}
          sx={[
            (theme) => ({
              backgroundColor: theme.palette.grey[100],
              color: theme.palette.common.black,
              fontSize: '14px',
            }),
          ]}
        />
      ))}
      <TextField
        variant="standard"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={value && value.length > 0 ? '' : 'Invite attendees'}
        slotProps={{
          input: {
            disableUnderline: true,
          },
        }}
        sx={[
          (theme) => ({
            flex: 1,
            py: 0,
            px: 1,
            '& .MuiInputBase-input': {
              fontSize: theme.typography.subtitle1,
            },
            '& .MuiInputBase-input::placeholder': {
              color: theme.palette.primary,
              fontSize: theme.typography.subtitle1,
            },
          }),
        ]}
      />
    </Box>
  );
}
