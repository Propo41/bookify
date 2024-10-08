import { Box, styled, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';

const TopBar = styled(Box)(({ theme }) => ({
  paddingTop: theme.spacing(1.5),
  paddingBottom: theme.spacing(1.5),
  paddingRight: theme.spacing(2),
  paddingLeft: theme.spacing(2),
  display: 'flex',
  width: '100%',
  justifyContent: 'center',
  alignItems: 'center',
  textAlign: 'center',
}));

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  backgroundColor: '#f9f9f9',
  borderRadius: 30,
}));

const StyledToggleButton = styled(ToggleButton)(({ theme }) => ({
  borderRadius: 30,
  border: 'none',
  textTransform: 'none',
  padding: '15px',
  '&.Mui-selected': {
    border: 'none',
    backgroundColor: theme.palette.grey[100],
    color: theme.palette.text.primary,
    '&:hover': {
      backgroundColor: theme.palette.grey[100],
    },
  },
}));

interface TopNavigationBarProps {
  handleTabChange: (tabIndex: number) => void;
  tabIndex: number;
}

const TopNavigationBar = ({ tabIndex, handleTabChange }: TopNavigationBarProps) => {
  const handleChange = (event: React.SyntheticEvent | null, newValue: number) => {
    if (newValue !== null) {
      handleTabChange(newValue);
    }
  };

  return (
    <TopBar>
      <StyledToggleButtonGroup value={tabIndex} exclusive onChange={handleChange} aria-label="event tabs" fullWidth={true}>
        <StyledToggleButton value={0} aria-label="new event" fullWidth={true}>
          <Typography variant="subtitle2">New Event</Typography>
        </StyledToggleButton>
        <StyledToggleButton value={1} aria-label="my events" fullWidth={true}>
          <Typography variant="subtitle2">My Events</Typography>
        </StyledToggleButton>
      </StyledToggleButtonGroup>
    </TopBar>
  );
};
export default TopNavigationBar;
