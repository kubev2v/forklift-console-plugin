import type { V1beta1Provider } from '@forklift-ui/types';

import { buildValidation } from '../buildVirtualizationValidation';

describe('buildValidation', () => {
  it('builds a platform-only validation for the selected Provider', () => {
    const provider = {
      metadata: { name: 'remote-cnv', namespace: 'konveyor-forklift' },
    } as V1beta1Provider;

    expect(buildValidation({ provider, runKind: 'platform' })).toMatchObject({
      apiVersion: 'forklift.konveyor.io/v1beta1',
      kind: 'VirtualizationValidation',
      metadata: {
        generateName: 'remote-cnv-validation-',
        namespace: 'konveyor-forklift',
      },
      spec: {
        checks: ['platform'],
        profile: 'Provider',
        providerRef: { name: 'remote-cnv', namespace: 'konveyor-forklift' },
      },
    });
  });

  it('includes a dedicated namespace and the demo failure check for a demo run', () => {
    const provider = {
      metadata: { name: 'remote-cnv', namespace: 'konveyor-forklift' },
    } as V1beta1Provider;

    expect(
      buildValidation({
        provider,
        runKind: 'demo-failure',
        validationNamespace: 'mtv-validation-workloads',
      }),
    ).toMatchObject({
      spec: {
        checks: ['platform', 'workload', 'demo-failure'],
        validationNamespace: 'mtv-validation-workloads',
      },
    });
  });
});
