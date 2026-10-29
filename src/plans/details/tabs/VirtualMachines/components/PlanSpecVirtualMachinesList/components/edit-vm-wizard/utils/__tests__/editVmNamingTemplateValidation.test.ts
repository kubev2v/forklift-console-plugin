import type { V1beta1Plan } from '@forklift-ui/types';

import type { EditVmWizardFormValues } from '../../types';
import {
  hasNamingTemplatesStepErrors,
  isVmNameTemplateOverrideInvalid,
} from '../editVmNamingTemplateValidation';
import { getDefaultEditVmWizardFormValues } from '../getDefaultEditVmWizardFormValues';

const basePlan = {
  apiVersion: 'forklift.konveyor.io/v1beta1',
  kind: 'Plan',
  metadata: { name: 'test-plan', namespace: 'default' },
  spec: {
    map: {
      network: { name: 'net-map', namespace: 'default' },
      storage: { name: 'storage-map', namespace: 'default' },
    },
    provider: {
      destination: { name: 'target', namespace: 'default' },
      source: { name: 'source', namespace: 'default' },
    },
    targetNamespace: 'target-ns',
    vms: [{ id: 'vm-1', name: 'source-vm' }],
  },
} satisfies V1beta1Plan;

describe('editVmNamingTemplateValidation', () => {
  it('treats empty override template as invalid', () => {
    expect(isVmNameTemplateOverrideInvalid('')).toBe(true);
    expect(isVmNameTemplateOverrideInvalid('   ')).toBe(true);
  });

  it('does not flag inherit mode', () => {
    const values = getDefaultEditVmWizardFormValues(basePlan, 0);
    expect(hasNamingTemplatesStepErrors(values)).toBe(false);
  });

  it('flags override with empty template', () => {
    const values: EditVmWizardFormValues = {
      ...getDefaultEditVmWizardFormValues(basePlan, 0),
      pvcNameTemplate: '',
    };
    expect(hasNamingTemplatesStepErrors(values)).toBe(true);
  });
});
