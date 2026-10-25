import type { UseFormHandleSubmit } from 'react-hook-form';
import type { CopyAppliancePlacementValues } from 'src/providers/details/tabs/Details/components/DetailsSection/copyAppliancePlacementConfig';

import type { V1beta1Provider } from '@forklift-ui/types';

import type { CreateProviderFormData } from '../types';

export type DeployProviderPlacement = {
  canDeploy: boolean;
  placement: CopyAppliancePlacementValues;
};

export type UseCreateProviderWorkflowParams = {
  handleSubmit: UseFormHandleSubmit<CreateProviderFormData>;
};

export type CreateProviderWorkflow = {
  apiError: Error | null;
  createdProvider: V1beta1Provider | undefined;
  isDeploying: boolean;
  isProviderPersisted: boolean;
  isSecretCreated: boolean;
  onCreate: (onContinue: () => void) => Promise<void>;
  onDeploy: (placement: DeployProviderPlacement) => Promise<void>;
};
