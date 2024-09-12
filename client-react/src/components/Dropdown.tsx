import { Box, Button, MenuItem, Select, SelectChangeEvent, SxProps, Theme, Typography } from '@mui/material';
import { useState } from 'react';

interface DropdownProps {
  sx?: SxProps<Theme>;
  options?: any[];
}

export default function Dropdown({ sx, options }: DropdownProps) {
  const [age, setAge] = useState((options && options[0]) || '');
  const height = '65px';

  const handleChange = (event: SelectChangeEvent) => {
    setAge(event.target.value);
  };

  return (
    <Select
      value={age}
      onChange={handleChange}
      fullWidth
      sx={[
        (theme) => ({
          height,
          backgroundColor: theme.palette.grey[100],
        }),
      ]}
    >
      {options?.map((option) => (
        <MenuItem value={option} key={option}>
          <Typography variant="subtitle1">{option}</Typography>
        </MenuItem>
      ))}
    </Select>
  );
}
