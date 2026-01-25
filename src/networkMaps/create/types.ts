import type { FieldValues } from 'react-hook-form';

import type { V1beta1Provider } from '@forklift-ui/types';

import type { NetworkMapFieldId, NetworkMapping } from '../utils/types';

export type CreateNetworkMapFormData = FieldValues & {
  [NetworkMapFieldId.MapName]: string;
  [NetworkMapFieldId.Project]: string;
  [NetworkMapFieldId.SourceProvider]: V1beta1Provider | undefined;
  [NetworkMapFieldId.TargetProvider]: V1beta1Provider | undefined;
  [NetworkMapFieldId.NetworkMap]: NetworkMapping[];
};
