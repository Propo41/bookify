import { Box, IconButton, styled, Typography } from '@mui/material';
import ExitToAppRoundedIcon from '@mui/icons-material/ExitToAppRounded';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../config/routes';
import Api from '../../api/api';
import { secrets } from '../../config/secrets';

const TopBar = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.grey[100],
  paddingTop: theme.spacing(1.5),
  paddingBottom: theme.spacing(1.5),
  paddingRight: theme.spacing(2),
  paddingLeft: theme.spacing(2),
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  textAlign: 'left',
}));

const TopNavigationBar = ({ title }: { title: string }) => {
  const navigate = useNavigate();

  const onLogoutClick = async () => {
    await new Api().logout();
    navigate(ROUTES.signIn);
  };

  return (
    <TopBar>
      <Box>
        <Typography variant="h4">{title}</Typography>
        {(secrets.mockCalender === 'true' || !secrets.mockCalender) && (
          <Typography variant="subtitle2" color={'textDisabled'}>
            App is using mock calender
          </Typography>
        )}
      </Box>

      <IconButton
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
