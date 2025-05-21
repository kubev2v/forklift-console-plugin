export const POWERED_ON = 'poweredOn';
export const UP = 'up';
export const ACTIVE = 'ACTIVE';
export const EMPTY_CPU = '0';
export const EMPTY_MEMORY = '0Mi';

export const MILLICORES_TO_CORES_DIVIDER = 1000.0;

/* eslint-disable id-length */
export const K8S_UNIT_MULTIPLIERS = {
  E: 10 ** 18,
  Ei: 1024 ** 6,
  G: 10 ** 9,
  Gi: 1024 ** 3,
  K: 10 ** 3,
  Ki: 1024,
  M: 10 ** 6,
  Mi: 1024 ** 2,
  P: 10 ** 15,
  Pi: 1024 ** 5,
  T: 10 ** 12,
  Ti: 1024 ** 4,
} as const;

export type K8sUnit = keyof typeof K8S_UNIT_MULTIPLIERS;
