import { Box, Button, Stack, styled, Typography } from '@mui/material';
import MuiCard from '@mui/material/Card';
import { useEffect } from 'react';
import { GoogleIcon } from '../../components/CustomIcons';
import { useLocation, useNavigate } from 'react-router-dom';
import { CacheService, CacheServiceFactory } from '../../helpers/cache';
import { secrets } from '../../config/secrets';
import { ROUTES } from '../../config/routes';
import toast from 'react-hot-toast';
import Api from '../../api/api';
import { renderError } from '../../helpers/utility';

const isChromeExt = secrets.appEnvironment === 'chrome';

const cacheService: CacheService = CacheServiceFactory.getCacheService();
const api = new Api();

const Container = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  textAlign: 'center',
  gap: theme.spacing(2),
  height: '100%',
}));

const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  textAlign: 'center',
  width: '100%',
  gap: theme.spacing(2),
  maxHeight: '750px',
  height: '750px',
  borderRadius: 20,
  boxShadow: '0 8px 20px 0 rgba(0,0,0,0.1)', // Adjusted for better visibility with transparent background
  background: 'linear-gradient(180deg, #FFFFFF 0%, rgba(255, 255, 255, 0.6) 100%)',
  border: 'none',
  [theme.breakpoints.up('sm')]: {
    maxWidth: '412px',
  },
  [theme.breakpoints.down('sm')]: {
    maxWidth: '390px',
  },
}));

const RootContainer = styled(Stack)(({ theme }) => ({
  textAlign: 'center',
  minHeight: '100vh',
  justifyContent: 'center',
  position: 'relative',
  overflow: 'hidden',
  background: 'linear-gradient(to bottom right, #ffffff, #fffbeb, #f0f9ff)',
  '&::before, &::after': {
    content: '""',
    position: 'absolute',
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    borderRadius: '50%',
    border: '8px solid rgba(255, 255, 255, 0.3)',
  },

  '&::before': {
    top: '25%',
    left: '25%',
    right: '25%',
    bottom: '25%',
    transform: 'rotate(-45deg)',
  },

  '&::after': {
    top: '33%',
    left: '33%',
    right: '-33%',
    bottom: '-33%',
    transform: 'rotate(12deg)',
  },
}));

const Login = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const errorMessage = state?.message;

  if (errorMessage) {
    toast.error(errorMessage);
  }

  useEffect(() => {
    cacheService.get('access_token').then((token) => {
      if (token) {
        navigate(ROUTES.home);
      }
    });
  }, []);

  async function onSignInClick(): Promise<void> {
    if (secrets.appEnvironment === 'chrome') {
      const res = await api.loginChrome();
      const { data, status } = res;

      if (status !== 'success') {
        return renderError(res, navigate);
      }

      if (data) {
        const cacheService: CacheService = CacheServiceFactory.getCacheService();
        await cacheService.save('access_token', data);
        navigate(ROUTES.home);
      }
    } else {
      await api.login();
    }
  }

  const common = (
    <>
      <Box mt={isChromeExt ? 4 : 18}>
        <Typography variant="h2" sx={[(theme) => ({ color: theme.palette.text.primary, width: '100%' })]}>
          {secrets.appTitle}
        </Typography>
        <Typography variant="h5" sx={[(theme) => ({ color: theme.palette.text.secondary, fontWeight: 400, mt: 1 })]}>
          {secrets.appSlogan}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 4, height: isChromeExt ? 'auto' : '100vh' }}>
        <Box sx={{ px: isChromeExt ? 0 : 5 }}>
          <Button
            type="submit"
            sx={[
              (theme) => ({
                height: 70,
                backgroundColor: theme.palette.common.white,
                color: theme.palette.common.black,
                fontSize: theme.typography.h6,
                fontWeight: 700,
                '& .MuiButton-endIcon': {
                  marginLeft: theme.spacing(20),
                },
              }),
            ]}
            fullWidth
            variant="contained"
            endIcon={<GoogleIcon />}
            onClick={onSignInClick}
          >
            Sign in
          </Button>
        </Box>
        {/* login bottom asset */}
        {!isChromeExt && (
          <>
            <Box sx={{ flexGrow: 1 }} />
            <Box>
              <Box component="img" alt="The house from the offer." src="./branding_asset.png" />
            </Box>
          </>
        )}
      </Box>
    </>
  );

  // for web view
  if (!isChromeExt) {
    return (
      <RootContainer direction="column" justifyContent="space-between">
        <Card variant="outlined">{common}</Card>
      </RootContainer>
    );
  }

  // for chrome view
  return (
    <Container
      sx={{
        maxHeight: isChromeExt ? '600px' : '100vh',
        px: isChromeExt ? 4 : 0,
        pt: isChromeExt ? 9 : 0,
      }}
    >
      {common}
    </Container>
  );
};

export default Login;
