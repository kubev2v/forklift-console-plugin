import type { V1beta1Plan } from '@forklift-ui/types';
import { describe, expect, it } from '@jest/globals';
import { render } from '@testing-library/react';

import { ServiceAccountHelpText } from '../ServiceAccountHelpText';

const mockPlan = {
  metadata: { namespace: 'plan-ns' },
  spec: { targetNamespace: 'target-ns' },
} as V1beta1Plan;

const renderText = (isPreHook: boolean, plan?: V1beta1Plan): string =>
  render(<ServiceAccountHelpText isPreHook={isPreHook} plan={plan} />).container.textContent ?? '';

describe('ServiceAccountHelpText', () => {
  it('uses plan namespace for pre-hook helper text', () => {
    expect(renderText(true, mockPlan)).toContain('plan-ns');
    expect(renderText(true, mockPlan)).toContain("plan's project.");
  });

  it('uses target namespace for post-hook helper text', () => {
    expect(renderText(false, mockPlan)).toContain('target-ns');
    expect(renderText(false, mockPlan)).toContain("plan's target project.");
  });

  it('falls back to empty project when plan is missing', () => {
    // Empty namespace interpolates as a blank token before the project label
    expect(renderText(true)).toContain("plan's project.");
    expect(renderText(true)).toContain('in the ');
    expect(renderText(false)).toContain("plan's target project.");
    expect(renderText(false)).toContain('in the ');
  });

  it('falls back to empty project when namespaces are absent', () => {
    const emptyPlan = { metadata: {}, spec: {} } as V1beta1Plan;
    expect(renderText(true, emptyPlan)).toContain("plan's project.");
    expect(renderText(true, emptyPlan)).toContain('in the ');
    expect(renderText(false, emptyPlan)).toContain("plan's target project.");
    expect(renderText(false, emptyPlan)).toContain('in the ');
  });
});
