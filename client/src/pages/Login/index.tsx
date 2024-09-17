import { Box, Button, Stack, styled, Typography } from '@mui/material';
import MuiCard from '@mui/material/Card';
import { useEffect } from 'react';
import { GoogleIcon } from '../../components/CustomIcons';
import { useLocation, useNavigate } from 'react-router-dom';
import { login, loginChrome } from '../../helpers/api';
import { CacheService, CacheServiceFactory } from '../../helpers/cache';
import { secrets } from '../../config/secrets';
import { ROUTES } from '../../config/routes';
import toast from 'react-hot-toast';

const isChromeExt = secrets.appEnvironment === 'chrome';
const cacheService: CacheService = CacheServiceFactory.getCacheService();

const Container = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  textAlign: 'center',
  padding: theme.spacing(4),
  paddingBottom: 0,
  paddingTop: theme.spacing(15),
  gap: theme.spacing(2),
  maxHeight: '600px',
  height: '100%',
}));

const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  textAlign: 'center',
  width: '100%',
  gap: theme.spacing(2),
  maxHeight: '650px',
  height: '650px',
  [theme.breakpoints.up('sm')]: {
    maxWidth: '412px',
  },
  [theme.breakpoints.down('sm')]: {
    maxWidth: '390px',
  },
  boxShadow: 'none',
}));

const RootContainer = styled(Stack)(({ theme }) => ({
  marginTop: '10vh',
  textAlign: 'center',
  '&::before': {
    content: '""',
    display: 'block',
    position: 'absolute',
    zIndex: -1,
    inset: 0,
    backgroundImage: 'radial-gradient(at 50% 50%, #005192, #002644)',
    backgroundRepeat: 'no-repeat',
  },
}));

const Login = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const errorMessage = state?.errorMessage;
  if (errorMessage) {
    toast.error(errorMessage);
  }

  useEffect(() => {
    cacheService.getFromCache('access_token').then((token) => {
      if (token) {
        navigate(ROUTES.home);
      }
    });
  }, []);

  async function onSignInClick(): Promise<void> {
    if (secrets.appEnvironment === 'chrome') {
      const { redirect, data, errorMessage } = await loginChrome();

      if (data) {
        const cacheService: CacheService = CacheServiceFactory.getCacheService();
        await cacheService.saveToCache('access_token', data);
        navigate(ROUTES.home);
      } else {
        if (redirect) {
          navigate(ROUTES.signIn, { state: { errorMessage: errorMessage || "Couldn't sign in user" } });
        }
      }
    } else {
      await login();
    }
  }

  const common = (
    <>
      <Box mt={isChromeExt ? 4 : 10}>
        <Typography component="h1" variant="h2" sx={{ width: '100%' }}>
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
        {!isChromeExt && (
          <>
            <Box sx={{ flexGrow: 1 }} />
            <Box>
              <Box component="img" sx={{}} alt="The house from the offer." src="./branding_asset.png" />
            </Box>
          </>
        )}
      </Box>
    </>
  );

  if (!isChromeExt) {
    return (
      <RootContainer direction="column" justifyContent="space-between">
        <Card variant="outlined">{common}</Card>
      </RootContainer>
    );
  }
  return <Container>{common}</Container>;
};

export default Login;
