import type { V1beta1Plan } from '@forklift-ui/types';
import { describe, expect, it } from '@jest/globals';
import { mockI18n } from '@test-utils/mockI18n';

mockI18n();

import { getServiceAccountHelperText } from '../utils';

const plan = {
  metadata: { namespace: 'plan-ns' },
  spec: { targetNamespace: 'target-ns' },
} as V1beta1Plan;

describe('getServiceAccountHelperText', () => {
  it('uses plan namespace for pre-hook helper text', () => {
    expect(getServiceAccountHelperText(true, plan)).toContain('plan-ns');
    expect(getServiceAccountHelperText(true, plan)).toContain("plan's project.");
  });

  it('uses target namespace for post-hook helper text', () => {
    expect(getServiceAccountHelperText(false, plan)).toContain('target-ns');
    expect(getServiceAccountHelperText(false, plan)).toContain("plan's target project.");
  });

  it('falls back to empty project when plan is missing', () => {
    const pre = getServiceAccountHelperText(true);
    const post = getServiceAccountHelperText(false, undefined);
    expect(pre).toContain("  plan's project.");
    expect(post).toContain("  plan's target project.");
  });

  it('falls back to empty project when namespaces are absent', () => {
    const emptyPlan = { metadata: {}, spec: {} } as V1beta1Plan;
    expect(getServiceAccountHelperText(true, emptyPlan)).toContain("  plan's project.");
    expect(getServiceAccountHelperText(false, emptyPlan)).toContain("  plan's target project.");
  });
});
