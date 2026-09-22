import type { V1beta1Provider } from '@forklift-ui/types';
import { getName, getNamespace } from '@utils/crds/common/selectors';

import type { VirtualizationValidation } from '../types';
import type { ValidationRunKind } from '../types';

type BuildValidationParams = {
  provider: V1beta1Provider;
  runKind: ValidationRunKind;
  validationNamespace?: string;
};

const checksForRunKind = (runKind: ValidationRunKind): string[] => {
  switch (runKind) {
    case 'platform':
      return ['platform'];
    case 'workload':
      return ['platform', 'workload'];
    case 'demo-failure':
      return ['platform', 'workload', 'demo-failure'];
    default:
      throw new Error('Unsupported validation run kind');
  }
};

export const buildValidation = ({
  provider,
  runKind,
  validationNamespace,
}: BuildValidationParams): VirtualizationValidation | undefined => {
  const name = getName(provider);
  const namespace = getNamespace(provider);

  if (!name || !namespace) {
    return undefined;
  }

  return {
    apiVersion: 'forklift.konveyor.io/v1beta1',
    kind: 'VirtualizationValidation',
    metadata: {
      generateName: `${name}-validation-`,
      namespace,
    },
    spec: {
      checks: checksForRunKind(runKind),
      profile: 'Provider',
      providerRef: {
        name,
        namespace,
      },
      ...(runKind !== 'platform' && validationNamespace ? { validationNamespace } : {}),
    },
  };
};
