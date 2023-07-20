import { ProviderVirtualMachine } from '@kubev2v/types';

type ConcernCategory = 'Critical' | 'Warning' | 'Information';

export const getHighestPriorityConcern = (vm: ProviderVirtualMachine): ConcernCategory => {
  if (!vm?.concerns) {
    return undefined;
  }

  if (vm.concerns.some((c) => c.category === 'Critical')) {
    return 'Critical';
  }

  if (vm.concerns.some((c) => c.category === 'Warning')) {
    return 'Warning';
  }

  if (vm.concerns.some((c) => c.category === 'Information')) {
    return 'Information';
  }

  return undefined;
};
