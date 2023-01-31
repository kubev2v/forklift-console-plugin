import type { UseMutationResult, UseQueryResult } from 'react-query';

export enum BrandType {
  Konveyor = 'Konveyor',
  RedHat = 'RedHat',
}

export interface IEnvVars {
  NODE_ENV: string;
  DATA_SOURCE: string;
  DEFAULT_NAMESPACE: string;
  BRAND_TYPE: BrandType;
  NAMESPACE: string;
  PLUGIN_NAME: string;
}

export type UnknownResult = Pick<
  UseQueryResult<unknown>,
  'isError' | 'isLoading' | 'isIdle' | 'error'
>;

export type UnknownMutationResult = Pick<
  UseMutationResult<unknown>,
  'isError' | 'isLoading' | 'isIdle' | 'error' | 'reset'
>;
