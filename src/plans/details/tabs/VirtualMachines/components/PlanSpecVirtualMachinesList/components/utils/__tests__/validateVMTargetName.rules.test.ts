import type { V1beta1PlanSpecVms } from '@forklift-ui/types';
import { describe, expect, it } from '@jest/globals';
import { mockI18n } from '@test-utils/mockI18n';

mockI18n();

import { validateVMTargetName } from '../utils';

const vms = [
  { name: 'vm-a', targetName: 'taken-name' },
  { name: 'vm-b' },
] as V1beta1PlanSpecVms[];

describe('validateVMTargetName', () => {
  it('returns null for empty value', () => {
    expect(validateVMTargetName('', vms)).toBeNull();
  });

  it.each(['ValidName', 'UPPER', '-leading', 'trailing-', 'has_underscore', 'bad_name!'])(
    'rejects invalid k8s name %j',
    (value) => {
      expect(validateVMTargetName(value, vms)).toBe(
        "VM target name must contain only lowercase alphanumeric characters or '-', and must start or end with lowercase alphanumeric character.",
      );
    },
  );

  it.each(['a', 'ab', 'my-vm', 'vm-1', 'a1b2c3', 'has.dot', 'a'.repeat(64)])(
    'accepts valid k8s name %j',
    (value) => {
      expect(validateVMTargetName(value, vms)).toBeNull();
    },
  );

  it('rejects duplicate target names within the plan', () => {
    expect(validateVMTargetName('taken-name', vms)).toBe(
      'VM target name must be unique within a plan.',
    );
  });

  it('allows a name that only matches a VM without targetName', () => {
    expect(validateVMTargetName('vm-b', vms)).toBeNull();
  });

  it('handles empty VMs list', () => {
    expect(validateVMTargetName('unique', [])).toBeNull();
  });
});
