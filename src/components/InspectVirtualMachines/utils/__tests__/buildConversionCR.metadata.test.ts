import { CONVERSION_LABELS, CONVERSION_TYPE } from '@utils/crds/conversion/constants';

import { buildConversionCR } from '../buildConversionCR';

import { buildArgs, expectedBaseLabels, plan, provider } from './buildConversionCR.fixtures';

describe('buildConversionCR - metadata', () => {
  it('builds conversion CR with sanitized generateName and provider namespace', () => {
    const cr = buildConversionCR(buildArgs({ vmName: 'My VM!!' }));

    expect(cr.kind).toBe('Conversion');
    expect(cr.metadata.generateName).toBe('deep-inspection-my-vm-');
    expect(cr.metadata.namespace).toBe('openshift-mtv');
    expect(cr.metadata.labels).toEqual(expectedBaseLabels);
    expect(cr.spec).toMatchObject({
      connection: { secret: { name: 'vsphere-secret', namespace: 'openshift-mtv' } },
      targetNamespace: 'openshift-mtv',
      type: CONVERSION_TYPE.DEEP_INSPECTION,
      vddkImage: 'quay.io/vddk:latest',
      vm: { id: 'vm-1', name: 'My VM!!', type: 'vsphere' },
    });
  });

  it('adds plan labels and uses plan namespace when plan is provided', () => {
    const cr = buildConversionCR(buildArgs({ plan }));

    expect(cr.metadata.namespace).toBe('plans-ns');
    expect(cr.metadata.labels).toEqual({
      ...expectedBaseLabels,
      [CONVERSION_LABELS.PLAN]: 'plan-uid',
      [CONVERSION_LABELS.PLAN_NAME]: 'plan-a',
      [CONVERSION_LABELS.PLAN_NAMESPACE]: 'plans-ns',
    });
    expect(cr.spec.targetNamespace).toBe('plans-ns');
  });

  it('falls back generateName prefix when name sanitizes to empty', () => {
    const cr = buildConversionCR(buildArgs({ provider, vmName: '!!!' }));

    expect(cr.metadata.generateName).toBe('deep-inspection-vm-');
  });
});
