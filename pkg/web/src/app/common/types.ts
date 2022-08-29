import { BrandType } from '@app/global-flags';
import { UseMutationResult, UseQueryResult } from 'react-query';

export interface IMetaVars {
  clusterApi: string;
  devServerPort: string;
  oauth: {
    clientId: string;
    redirectUrl: string;
    userScope: string;
    clientSecret: string;
  };
  namespace: string;
  inventoryApi: string;
  inventoryPayloadApi: string;
}

export interface IEnvVars {
  AUTH_REQUIRED: string;
  NODE_ENV: string;
  DATA_SOURCE: string;
  BRAND_TYPE: BrandType;
  FORKLIFT_OPERATOR_VERSION: string;
  FORKLIFT_CONTROLLER_GIT_COMMIT: string;
  FORKLIFT_MUST_GATHER_GIT_COMMIT: string;
  FORKLIFT_OPERATOR_GIT_COMMIT: string;
  FORKLIFT_UI_GIT_COMMIT: string;
  FORKLIFT_VALIDATION_GIT_COMMIT: string;
  FORKLIFT_CLUSTER_VERSION: string;
}

export type UnknownResult = Pick<
  UseQueryResult<unknown>,
  'isError' | 'isLoading' | 'isIdle' | 'error'
>;

export type UnknownMutationResult = Pick<
  UseMutationResult<unknown>,
  'isError' | 'isLoading' | 'isIdle' | 'error' | 'reset'
>;
