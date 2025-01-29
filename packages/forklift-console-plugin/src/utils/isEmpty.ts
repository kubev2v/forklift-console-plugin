// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isEmpty = (obj: any) =>
  [Array, Object].includes((obj || {}).constructor) && !Object.entries(obj || {}).length;
