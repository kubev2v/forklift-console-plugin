import type { V1beta1NetworkMapSpecMapDestination } from '@forklift-ui/types';
import { describe, expect, it } from '@jest/globals';

import { isNetworkIPModeEditable } from '../networkIPModeUtils';

describe('isNetworkIPModeEditable', () => {
  it('disables Pod destinations', () => {
    const destination = { type: 'pod' } as V1beta1NetworkMapSpecMapDestination;

    expect(isNetworkIPModeEditable(destination)).toBe(false);
  });

  it('disables ignored destinations', () => {
    const destination = { type: 'ignored' } as V1beta1NetworkMapSpecMapDestination;

    expect(isNetworkIPModeEditable(destination)).toBe(false);
  });

  it('enables Multus destinations', () => {
    const destination = {
      name: 'network',
      namespace: 'default',
      type: 'multus',
    } as V1beta1NetworkMapSpecMapDestination;

    expect(isNetworkIPModeEditable(destination)).toBe(true);
  });

  it('disables missing destinations', () => {
    expect(isNetworkIPModeEditable(undefined)).toBe(false);
  });
});
