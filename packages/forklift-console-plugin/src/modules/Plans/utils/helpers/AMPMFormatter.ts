export const formatDateTo12Hours = (date: Date): string => {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const timeSuffix = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  return `${hours12}:${minutes.toString().padStart(2, '0')} ${timeSuffix}`;
};
