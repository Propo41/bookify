export default function Card() {
  return {
    MuiCard: {
      styleOverrides: {
        root: ({ theme }: any) => ({
          boxShadow: '0 3px 10px 0 rgba(0,0,0,0.0), 0 3px 10px 0 rgba(0,0,0,0.2)',
          ...theme.applyStyles('dark', {
            boxShadow: '0 3px 10px 0 rgba(0,0,0,0.0), 0 3px 10px 0 rgba(0,0,0,0.2)',
          }),

          zIndex: 0,
          borderRadius: 10,
        }),
      },
    },
  };
}
