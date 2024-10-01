import { Box, IconButton, styled, Tab, Tabs, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import ExitToAppRoundedIcon from '@mui/icons-material/ExitToAppRounded';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../config/routes';
import Api from '../../api/api';
import { secrets } from '../../config/secrets';
import { useState } from 'react';

const TopBar = styled(Box)(({ theme }) => ({
  // backgroundColor: theme.palette.grey[100],
  paddingTop: theme.spacing(1.5),
  paddingBottom: theme.spacing(1.5),
  paddingRight: theme.spacing(2),
  paddingLeft: theme.spacing(2),
  display: 'flex',
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
  const navigate = useNavigate();

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    if (newValue !== null) {
      handleTabChange(newValue);
    }
  };

  const onLogoutClick = async () => {
    await new Api().logout();
    navigate(ROUTES.signIn);
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
        <StyledToggleButton value={2} aria-label="my events" fullWidth={true}>
          <Typography variant="subtitle2">Settings</Typography>
        </StyledToggleButton>
      </StyledToggleButtonGroup>
    </TopBar>
  );
};
export default TopNavigationBar;
