export const getRandomChars = (len = 6): string => {
  const array = new Uint8Array(len);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => (byte % 36).toString(36)).join('');
};
