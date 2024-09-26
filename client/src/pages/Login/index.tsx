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
import { isMobile } from 'react-device-detect';

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
  [theme.breakpoints.up('sm')]: {
    maxWidth: '412px',
  },
  [theme.breakpoints.down('sm')]: {
    maxWidth: '390px',
  },
  boxShadow: 'none',
}));

const RootContainer = styled(Stack)(({ theme }) => ({
  paddingTop: '10vh',
  paddingBottom: '10vh',
  textAlign: 'center',
  backgroundImage: 'radial-gradient(at 50% 50%, #005192, #002644)',
  minHeight: '100vh',
  justifyContent: 'center',
  // '&::before': {
  //   content: '""',
  //   display: 'block',
  //   position: 'absolute',
  //   zIndex: -1,
  //   inset: 0,
  //   backgroundImage: '',
  //   backgroundRepeat: 'no-repeat',
  // },
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
  if (!isChromeExt && !isMobile) {
    return (
      <RootContainer direction="column" justifyContent="space-between">
        <Card variant="outlined">{common}</Card>
      </RootContainer>
    );
  }

  // for chrome and web view
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
