export default function LoadingButton() {
  return {
    MuiLoadingButton: {
      styleOverrides: {
        root: {
          boxShadow: '0 3px 10px 0 rgba(0,0,0,0.0), 0 3px 10px 0 rgba(0,0,0,0.2)',
          '&:hover': {
            boxShadow: '0 3px 10px 0 rgba(0,0,0,0.0), 0 3px 10px 0 rgba(0,0,0,0.2)',
          },
          '&:active': {
            boxShadow: '0 3px 10px 0 rgba(0,0,0,0.0), 0 3px 10px 0 rgba(0,0,0,0.2)',
          },
          '&:focus': {
            boxShadow: '0 3px 10px 0 rgba(0,0,0,0.0), 0 3px 10px 0 rgba(0,0,0,0.2)',
          },
          '&.Mui-disabled': {
            backgroundColor: '#E8E8E8',
            color: '#a0a0a0',
            boxShadow: 'none',
          },
        },
      },
    },
  };
}
