import { ApiResponse } from '@bookify/shared';
import { toast } from 'react-hot-toast';
import { NavigateFunction } from 'react-router-dom';
import { ROUTES } from '../config/routes';
import { CacheService, CacheServiceFactory } from './cache';
import { secrets } from '../config/secrets';

/**
 * @param start time in utc format
 */
export function populateTimeOptions(start?: string) {
  const timeOptions = [];
  const now = start ? new Date(start) : new Date();
  let currentHours = now.getHours();
  let currentMinutes = Math.floor(now.getMinutes() / 15) * 15;

  if (currentMinutes === 60) {
    currentMinutes = 0;
    currentHours += 1;
  }

  const currentTimeInMinutes = toMinutesSinceMidnight(currentHours, currentMinutes);

  for (let i = 0; i < 24 * 4; i++) {
    const hours = Math.floor(i / 4);
    const minutes = (i % 4) * 15;
    const formattedTime = formatTime(hours, minutes);
    const optionTimeInMinutes = toMinutesSinceMidnight(hours, minutes);

    if (optionTimeInMinutes >= currentTimeInMinutes) {
      timeOptions.push(formattedTime);
    }
  }

  return timeOptions;
}

export function populateDurationOptions(start: number, end: number) {
  let mins = start;
  const options = [];

  while (mins < end) {
    options.push(mins.toString());
    mins += 15;
  }

  return options;
}

// TODO: fetch from database
export function populateRoomCapacity() {
  const options = [];
  let capacity = 1;

  while (capacity < 15) {
    options.push(capacity.toString());
    capacity += 1;
  }

  return options;
}

export function toMinutesSinceMidnight(hours: number, minutes: number) {
  return hours * 60 + minutes;
}

export function formatTime(hours: number, minutes: number) {
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // If hour is 0, it should be 12
  const _minutes = minutes < 10 ? '0' + minutes : minutes;
  return hours + ':' + _minutes + ' ' + ampm;
}

// returns timeZone formatted as "Asia/Dhaka", etc
export function getTimeZoneString() {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return timeZone;
}

export function getTimezoneOffset() {
  const offsetInMinutes = new Date().getTimezoneOffset();
  const sign = offsetInMinutes <= 0 ? '+' : '-';
  const offsetInHours = Math.floor(Math.abs(offsetInMinutes) / 60);
  const offsetInRemainingMinutes = Math.abs(offsetInMinutes) % 60;
  const formattedOffset = `${sign}${String(offsetInHours).padStart(2, '0')}:${String(offsetInRemainingMinutes).padStart(2, '0')}`;

  return formattedOffset;
}

export function convertToRFC3339(dateString: string, timeString: string) {
  const timeZoneOffset = getTimezoneOffset();
  const date = new Date(`${dateString} ${timeString}`);

  const [offsetSign, offsetHours, offsetMinutes] = timeZoneOffset.match(/([+-])(\d{2}):(\d{2})/)!.slice(1);

  const offsetInMinutes = (parseInt(offsetHours) * 60 + parseInt(offsetMinutes)) * (offsetSign === '+' ? 1 : -1);
  date.setMinutes(date.getMinutes() + offsetInMinutes);

  const isoString = date.toISOString();
  const [isoDate, isoTime] = isoString.split('T');

  // Return the formatted date and time in RFC 3339 format
  return `${isoDate}T${isoTime.split('.')[0]}${timeZoneOffset}`;
}

export function convertToLocaleTime(dateStr?: string) {
  if (!dateStr) return '-';

  const date = new Date(dateStr);

  const options: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  };

  return date.toLocaleTimeString('en-US', options);
}

export const createDropdownOptions = (options: string[], type: 'time' | 'default' = 'default') => {
  return (options || []).map((option) => ({ value: option, text: type === 'time' ? formatMinsToHM(Number(option), 'm') : option }));
};

export const renderError = async (err: ApiResponse<any>, navigate: NavigateFunction) => {
  const { status, statusCode, message, redirect } = err;
  if (status === 'error') {
    if (statusCode === 401) {
      const cacheService: CacheService = CacheServiceFactory.getCacheService();
      await cacheService.remove('access_token');
      navigate(ROUTES.signIn, { state: { message } });
    } else if (redirect) {
      navigate(ROUTES.signIn, { state: { message: message + ' | Try re-logging in' } });
    } else {
      message && toast.error(message);
    }

    return;
  }
};

export const formatMinsToHM = (value: number, decorator?: string) => {
  const hours = Math.floor(value / 60);
  const minutes = value % 60;

  let result = '';
  if (hours > 0) {
    result += `${hours} hr${hours > 1 ? 's' : ''} `;
  }
  if (minutes > 0 || hours === 0) {
    result += `${minutes}${decorator ? decorator : ''}`;
  }
  return result.trim();
};

export const validateEmail = (email: string) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    );
};

export const chromeBackground = {
  backgroundImage: 'url(/background.png)', // Reference your image from the public folder
  backgroundSize: 'cover', // Ensures the image covers the entire card
  backgroundPosition: 'center', // Centers the image
  backgroundRepeat: 'no-repeat', // Prevents the image from repeating
};

export const isChromeExt = secrets.appEnvironment === 'chrome';
// export const isChromeExt = true;
