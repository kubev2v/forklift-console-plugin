import type { FormEvent } from 'react';

import type { IoK8sApiCoreV1Secret } from '@kubev2v/types';

export type CredentialsViewModeByTypeProps = {
  secret: IoK8sApiCoreV1Secret;
  reveal: boolean;
};

export type CredentialsEditModeByTypeProps = {
  secret: IoK8sApiCoreV1Secret;
  onNewSecretChange: (newValue: IoK8sApiCoreV1Secret) => void;
};

export type onChangeFactoryType = (
  changedField: string,
) => (event: FormEvent<HTMLInputElement>, value: string) => void;
