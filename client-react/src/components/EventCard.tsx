import { Card, Typography, Chip, IconButton, Box, styled, Theme, SxProps, Divider, CardActions } from '@mui/material';
import FaceIcon from '@mui/icons-material/Face';
import DeleteForeverRoundedIcon from '@mui/icons-material/DeleteForeverRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import AccessTimeFilledRoundedIcon from '@mui/icons-material/AccessTimeFilledRounded';
import MeetingRoomRoundedIcon from '@mui/icons-material/MeetingRoomRounded';
import InsertLinkRoundedIcon from '@mui/icons-material/InsertLinkRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import StairsIcon from '@mui/icons-material/Stairs';

const chips = ['asd', 'asdasd', 'asdass dasd', 'asdasd', 'asdasd', 'asdasdasd'];

interface ChipData {
  key: number;
  label: string;
}

interface EventCardProps {
  sx?: SxProps<Theme>;
}
const ListItem = styled('li')(({ theme }) => ({
  margin: theme.spacing(0.3),
}));

const EventCard = ({ sx }: EventCardProps) => {
  return (
    <Card sx={{ borderRadius: 2, py: 1.5, px: 1.5, ...sx }}>
      <Typography
        variant="h5"
        component="div"
        sx={{
          textAlign: 'left',
        }}
      >
        Quick Meeting 1
      </Typography>

      <Box
        component="ul"
        sx={{
          display: 'flex',
          justifyContent: 'left',
          flexWrap: 'wrap',
          listStyle: 'none',
          p: 0,
          m: 0,
          mt: 1,
        }}
      >
        {chips.map((chip, i) => {
          let icon;

          // if (chip.label === 'React') {
          //   icon = <TagFacesIcon />;
          // }

          return (
            <ListItem key={i} sx={{ mt: 0.4 }}>
              <Chip
                icon={<FaceIcon />}
                label={chip}
                sx={{
                  fontSize: 14,
                }}
              />
            </ListItem>
          );
        })}
      </Box>

      <Divider sx={{ my: 1 }} />

      <CardActions sx={{ p: 0, justifyContent: 'flex-end' }}>
        <IconButton aria-label="edit" color={'primary'}>
          <EditRoundedIcon />
        </IconButton>
        <IconButton aria-label="delete" color={'error'}>
          <DeleteForeverRoundedIcon />
        </IconButton>
      </CardActions>
    </Card>
  );
};

export default EventCard;
