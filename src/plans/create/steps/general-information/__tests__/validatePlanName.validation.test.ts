import { describe, expect, it } from '@jest/globals';

import { validatePlanName } from '../utils';

describe('validatePlanName - validation', () => {
  it('requires a non-empty name', () => {
    expect(validatePlanName('', [])).toMatch(/required/i);
  });

  it('rejects invalid k8s names', () => {
    expect(validatePlanName('Bad_Name', [])).toMatch(/lowercase alphanumeric/i);
  });

  it('rejects duplicate plan names across namespaces', () => {
    const plans = [{ metadata: { name: 'my-plan' } }] as never[];
    expect(validatePlanName('my-plan', plans)).toMatch(/unique/i);
  });

  it('accepts a unique valid name', () => {
    expect(validatePlanName('my-plan', [{ metadata: { name: 'other' } }] as never[])).toBeUndefined();
  });
});
