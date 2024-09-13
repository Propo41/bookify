import { MenuItem, Select, SelectChangeEvent, SxProps, Theme, Typography } from '@mui/material';
import { useEffect, useState } from 'react';

interface DropdownProps {
  id: string;
  sx?: SxProps<Theme>;
  options?: DropdownOption[];
  value?: string;
  disabled?: boolean;
  onChange: (id: string, value: string) => void;
}

export interface DropdownOption {
  text: string;
  value: string; // the main value used for api calls
}

export default function Dropdown({ sx, id, disabled, value, options, onChange }: DropdownProps) {
  const height = '65px';

  const handleChange = (event: SelectChangeEvent) => {
    onChange(id, event.target.value);
  };

  return (
    <Select
      value={value}
      onChange={handleChange}
      fullWidth
      disabled={disabled || false}
      sx={[
        // @ts-ignore
        (theme) => ({
          height: height,
          backgroundColor: theme.palette.grey[100],
          ...sx,
        }),
      ]}
    >
      {options?.map((option) => (
        <MenuItem value={option.value} key={option.value}>
          <Typography variant="subtitle1">{option.text}</Typography>
        </MenuItem>
      ))}
    </Select>
  );
}
