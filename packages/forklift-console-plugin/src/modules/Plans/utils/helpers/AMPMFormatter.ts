export const formatToAmPm = (date: Date): string => {
  const hours = date.getHours() % 12 || 12;
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const period = hours === 12 ? 'PM' : 'AM';

  return `${hours}:${minutes} ${period}`;
};
