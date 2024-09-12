import { MenuItem, Select, SelectChangeEvent, SxProps, Theme, Typography } from '@mui/material';
import { useEffect, useState } from 'react';

interface DropdownProps {
  sx?: SxProps<Theme>;
  options: any[];
}

export default function Dropdown({ sx, options }: DropdownProps) {
  const [option, setOption] = useState(options[0] || '');
  const height = '65px';

  useEffect(() => {
    if (options.length > 0) {
      setOption(options[0]);
    }
  }, [options]);

  const handleChange = (event: SelectChangeEvent) => {
    setOption(event.target.value);
  };

  return (
    <Select
      value={option}
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
