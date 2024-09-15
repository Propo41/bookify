export default function Button() {
  return {
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: '0 3px 15px 0 rgba(0,0,0,0.0), 0 3px 20px 0 rgba(0,0,0,0.2)',
          '&:hover': {
            boxShadow: '0 3px 15px 0 rgba(0,0,0,0.0), 0 3px 20px 0 rgba(0,0,0,0.3)',
          },
          '&:active': {
            boxShadow: '0 3px 15px 0 rgba(0,0,0,0.0), 0 3px 20px 0 rgba(0,0,0,0.4)',
          },
          '&:focus': {
            boxShadow: '0 3px 15px 0 rgba(0,0,0,0.0), 0 3px 20px 0 rgba(0,0,0,0.2)',
          },
          '&.Mui-disabled': {
            backgroundColor: '#E8E8E8',
            color: '#a0a0a0',
            boxShadow: 'none',
          },
          borderRadius: 10,
        },
      },
    },
  };
}
