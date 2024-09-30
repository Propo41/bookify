import { MenuItem, Select, SelectChangeEvent, Typography } from '@mui/material';

interface DropdownProps {
  id: string;
  sx?: any;
  options?: DropdownOption[];
  value?: string;
  disabled?: boolean;
  onChange: (id: string, value: string) => void;
  decorator?: string;
}

export interface DropdownOption {
  text: string;
  value: string; // the main value used for api calls
}

export default function Dropdown({ sx, id, disabled, value, options, onChange, decorator }: DropdownProps) {
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
      renderValue={(selected) => {
        const selectedOption = options?.find((option) => option.value === selected);
        return (
          <Typography
            variant="subtitle1"
            sx={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {selectedOption ? selectedOption.text + (decorator || '') : ''}
          </Typography>
        );
      }}
      sx={[
        (theme) => ({
          height: height,
          backgroundColor: theme.palette.grey[100],
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
