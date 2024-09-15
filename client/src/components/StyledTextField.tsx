import { Box, SxProps, TextField, Theme } from '@mui/material';

interface StyledTextFieldProps {
  id: string;
  sx?: SxProps<Theme>;
  value?: string;
  disabled?: boolean;
  onChange: (id: string, value: string) => void;
}

const StyledTextField = ({ id, sx, disabled, onChange }: StyledTextFieldProps) => {
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
      <TextField
        onChange={(e) => onChange(id, e.target.value)}
        variant="standard"
        placeholder="Enter title"
        slotProps={{
          input: {
            disableUnderline: true,
          },
        }}
        fullWidth
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
};

export default StyledTextField;
