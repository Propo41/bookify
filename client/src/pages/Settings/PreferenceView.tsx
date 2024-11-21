import Api from "@/api/api";
import type { DropdownOption } from "@/components/Dropdown";
import Dropdown from "@/components/Dropdown";
import StyledTextField from "@/components/StyledTextField";
import { usePreferences } from "@/context/PreferencesContext";
import { CacheServiceFactory, type CacheService } from "@/helpers/cache";
import { createDropdownOptions, isChromeExt, renderError } from "@/helpers/utility";
import { availableDurations, availableRoomCapacities } from "@/pages/Home/shared";
import { Box, Button, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import EventSeatRoundedIcon from '@mui/icons-material/EventSeatRounded';
import HourglassBottomRoundedIcon from '@mui/icons-material/HourglassBottomRounded';
import StairsIcon from '@mui/icons-material/Stairs';
import TitleIcon from '@mui/icons-material/Title';

export default function PreferenceView () {
    const [formData, setFormData] = useState({ floor: '', duration: '30', seats: 1, title: '' });
    const [floorOptions, setFloorOptions] = useState<DropdownOption[]>([]);
    const [durationOptions, setDurationOptions] = useState<DropdownOption[]>([]);
    const [roomCapacityOptions, setRoomCapacityOptions] = useState<DropdownOption[]>([]);
    const cacheService: CacheService = CacheServiceFactory.getCacheService();
    const { preferences, setPreferences } = usePreferences()
    const api = new Api();
  
    const navigate = useNavigate();
  
    useEffect(() => {
      const init = async (floors: string[]) => {
        const floorOptions = createDropdownOptions(floors);
        floorOptions.unshift({ text: 'No preference', value: '' });
  
        setFloorOptions(floorOptions);
        setDurationOptions(createDropdownOptions(availableDurations, 'time'));
  
        const { floor, duration, title, seats } = preferences;
  
        setFormData({
          ...formData,
          floor: floor || '',
          title: title || '',
          duration: String(duration) || availableDurations[0],
          seats: seats || 1,
        });
      };
  
      cacheService.get('floors').then(async (floors) => {
        if (floors) {
          init(JSON.parse(floors));
          return;
        }
  
        const res = await api.getFloors();
        const { data, status } = res!;
  
        if (status !== 'success') {
          return renderError(res, navigate);
        }
  
        if (data) {
          await cacheService.save('floors', JSON.stringify(data));
          init(data);
        }
      });
  
      setRoomCapacityOptions(createDropdownOptions(availableRoomCapacities));
    }, []);
  
    const handleInputChange = (id: string, value: string | number) => {
      setFormData((prevData) => ({
        ...prevData,
        [id]: value,
      }));
    };
  
    const onSaveClick = async () => {
      setPreferences({
        seats: formData.seats,
        floor: formData.floor,
        title: formData.title,
        duration: Number(formData.duration),
      })
  
      toast.success('Saved successfully!');
    };
  
    return (
      <Box
        mx={2}
        mt={1}
        sx={{
          background: isChromeExt ? 'rgba(255, 255, 255, 0.4)' : 'rgba(245, 245, 245, 0.5);',
          borderRadius: 2,
        }}
      >
        <Box
          sx={{
            px: 1,
            py: 1,
          }}
        >
          <Box
            sx={{
              bgcolor: 'white',
              borderTopLeftRadius: 10,
              borderTopRightRadius: 10,
              borderBottomLeftRadius: 10,
              borderBottomRightRadius: 10,
              textAlign: 'left',
            }}
          >
            <Dropdown
              sx={{ borderTopLeftRadius: 10, borderTopRightRadius: 10, height: '60px' }}
              id="floor"
              value={formData.floor}
              placeholder={'Select preferred floor'}
              options={floorOptions}
              onChange={handleInputChange}
              icon={
                <StairsIcon
                  sx={[
                    (theme) => ({
                      color: theme.palette.grey[50],
                    }),
                  ]}
                />
              }
            />
  
            <Dropdown
              sx={{ height: '60px' }}
              id="duration"
              value={formData.duration}
              options={durationOptions}
              onChange={handleInputChange}
              placeholder={'Select preferred meeting duration'}
              icon={
                <HourglassBottomRoundedIcon
                  sx={[
                    (theme) => ({
                      color: theme.palette.grey[50],
                    }),
                  ]}
                />
              }
            />
  
            <Dropdown
              sx={{ height: '60px', borderBottomLeftRadius: 15, borderBottomRightRadius: 15 }}
              id="seats"
              placeholder={'Select preferred room capacity'}
              value={formData.seats + ''}
              options={roomCapacityOptions}
              onChange={handleInputChange}
              icon={
                <EventSeatRoundedIcon
                  sx={[
                    (theme) => ({
                      color: theme.palette.grey[50],
                    }),
                  ]}
                />
              }
            />
  
            <StyledTextField
              value={formData.title}
              startIcon={
                <TitleIcon
                  sx={[
                    (theme) => ({
                      color: theme.palette.grey[50],
                    }),
                  ]}
                />
              }
              id="title"
              placeholder="Add preferred title"
              onChange={handleInputChange}
            />
          </Box>
        </Box>
  
        <Box
          sx={{
            mx: 2,
            mb: 3,
            textAlign: 'center',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
          }}
        >
          <Button
            onClick={onSaveClick}
            fullWidth
            variant="contained"
            disableElevation
            sx={[
              (theme) => ({
                py: 2,
                backgroundColor: theme.palette.common.white,
                borderRadius: 15,
                textTransform: 'none',
                color: theme.palette.common.black,
              }),
            ]}
          >
            <Typography variant="h6" fontWeight={700}>
              Save
            </Typography>
          </Button>
        </Box>
      </Box>
    );
  };
  