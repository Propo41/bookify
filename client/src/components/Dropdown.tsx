import { Box, MenuItem, Select, SelectChangeEvent, Typography } from '@mui/material';
import { ReactElement } from 'react';

interface DropdownProps {
  id: string;
  sx?: any;
  options?: DropdownOption[];
  value?: string;
  disabled?: boolean;
  onChange: (id: string, value: string) => void;
  decorator?: string;
  icon?: ReactElement;
}

export interface DropdownOption {
  text: string;
  value: string; // the main value used for api calls
}

export default function Dropdown({ sx, id, disabled, value, options, onChange, decorator, icon }: DropdownProps) {
  const height = '58px';

  const handleChange = (event: SelectChangeEvent) => {
    onChange(id, event.target.value);
  };

  return (
    <Select
      value={value}
      onChange={handleChange}
      fullWidth
      variant="standard"
      disabled={disabled || false}
      renderValue={(selected) => {
        const selectedOption = options?.find((option) => option.value === selected);
        return (
          <Box
            sx={{
              alignItems: 'center',
              display: 'flex',
            }}
          >
            {icon && icon}
            <Typography
              variant="subtitle1"
              sx={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                ml: 2,
              }}
            >
              {selectedOption ? selectedOption.text + (decorator || '') : ''}
            </Typography>
          </Box>
        );
      }}
      disableUnderline={true}
      sx={[
        (theme) => ({
          height: height,
          backgroundColor: theme.palette.common.white,
          paddingLeft: 1.5,
          paddingRight: 1.5,
          '& .MuiSelect-icon': {
            paddingRight: 1.5,
            color: theme.palette.grey[50],
          },
          ...sx,
        }),
      ]}
    >
      {options?.map((option) => (
        <MenuItem value={option.value} key={option.value}>
          <Typography variant="subtitle1">
            {option.text}
            {decorator}
          </Typography>
        </MenuItem>
      ))}
    </Select>
  );
}
