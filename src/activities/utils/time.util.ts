export const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/;
export const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
export const APP_TIME_ZONE = 'Asia/Jakarta';

export const todayDate = (timeZone = APP_TIME_ZONE): string =>
  new Date().toLocaleDateString('en-CA', { timeZone });

export const normalizeTime = (value: string): string => {
  const [hours, minutes, seconds = '00'] = value.split(':');
  return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`;
};

export const toSeconds = (value: string): number => {
  const [hours, minutes, seconds] = normalizeTime(value).split(':').map(Number);
  return hours * 3600 + minutes * 60 + seconds;
};

export const formatTimeRange = (start: string, end: string): string => {
  const startNorm = normalizeTime(start);
  const endNorm = normalizeTime(end);
  return `${startNorm.slice(0, 5)} - ${endNorm.slice(0, 5)}`;
};
