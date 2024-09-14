import { Box, IconButton, styled, Typography } from '@mui/material';
import { logout } from '../../helpers/api';
import ExitToAppRoundedIcon from '@mui/icons-material/ExitToAppRounded';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../config/routes';

const TopBar = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.grey[100],
  paddingTop: theme.spacing(1.5),
  paddingBottom: theme.spacing(1.5),
  paddingRight: theme.spacing(2),
  paddingLeft: theme.spacing(2),
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-end',
  textAlign: 'left',
}));

const TopNavigationBar = ({ title }: { title: string }) => {
  const navigate = useNavigate();

  const onLogoutClick = async () => {
    await logout();
    navigate(ROUTES.signIn);
  };

  return (
    <TopBar>
      <Box>
        <Typography variant="h4">{title}</Typography>
      </Box>

      <IconButton
        aria-label="logout"
        onClick={onLogoutClick}
        size="medium"
        sx={[
          (theme) => ({
            bgcolor: theme.palette.primary.main,
            borderRadius: 1,
            color: theme.palette.common.white,
            boxShadow: 'none',
            '&:hover': {
              boxShadow: 'none',
              backgroundColor: theme.palette.primary.light,
            },
          }),
        ]}
      >
        <ExitToAppRoundedIcon />
      </IconButton>
    </TopBar>
  );
};
export default TopNavigationBar;
