import React, { useState } from 'react';
import { TextField, Chip, Box, SxProps, Theme } from '@mui/material';

interface ChipInputProps {
  id: string;
  sx?: SxProps<Theme>;
  value?: string;
  disabled?: boolean;
  onChange: (id: string, value: string[]) => void;
}

export default function ChipInput({ id, sx, onChange }: ChipInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [chips, setChips] = useState<any[]>([]);

  const handleKeyDown = (event: any) => {
    if (event.key === ' ' && inputValue.trim() !== '') {
      const newChips = [...chips, inputValue.trim()];
      setChips(newChips);
      setInputValue('');

      onChange(id, newChips);
    }
  };

  const handleDelete = (chipToDelete: any[]) => {
    setChips(chips.filter((chip) => chip !== chipToDelete));
  };

  return (
    <Box
      display="flex"
      alignItems="center"
      flexWrap="wrap"
      sx={[
        (theme) => ({
          gap: '8px',
          padding: '10px',
          borderRadius: 1,
          backgroundColor: '#ECECEC',
          mt: 1,
          '&:focus-within': {
            border: `2px solid ${theme.palette.primary.dark}`,
          },
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
        placeholder="Invite attendees"
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
              fontSize: theme.typography.subtitle2,
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
