import React, { useState } from 'react';
import { TextField, Chip, Box, Typography } from '@mui/material';

export default function ChipInput() {
  const [inputValue, setInputValue] = useState('');
  const [chips, setChips] = useState<any[]>([]);

  // Function to handle chip addition
  const handleKeyDown = (event: any) => {
    if (event.key === ' ' && inputValue.trim() !== '') {
      setChips([...chips, inputValue.trim()]);
      setInputValue(''); // Clear the input after adding the chip
    }
  };

  // Function to remove chip
  const handleDelete = (chipToDelete: any[]) => {
    setChips(chips.filter((chip) => chip !== chipToDelete));
  };

  return (
    <Box display="flex" alignItems="center" flexWrap="wrap" sx={{ gap: '8px', padding: '10px', borderRadius: 1, backgroundColor: '#ECECEC', mt: 1 }}>
      {chips.map((chip, index) => (
        <Chip key={index} label={chip} onDelete={() => handleDelete(chip)} sx={{ backgroundColor: '#bfbfbf', color: '#000', fontSize: '14px' }} />
      ))}
      <TextField
        variant="standard"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Invite attendees"
        InputProps={{
          disableUnderline: true,
        }}
        sx={{ flex: 1, py: 1, px: 1 }}
      />
    </Box>
  );
}
