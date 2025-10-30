import type { IoK8sApiCoreV1Secret, V1beta1Provider } from '@kubev2v/types';

export type ProvidersCreateFormsSectionProps = {
  newProvider: V1beta1Provider;
  newSecret: IoK8sApiCoreV1Secret;
  onNewProviderChange: (provider: V1beta1Provider) => void;
  onNewSecretChange: (secret: IoK8sApiCoreV1Secret) => void;
  providerNames?: string[];
  projectName?: string;
  onProjectNameChange: (value: string | undefined) => void;
  providerNamesLoaded?: boolean;
};
