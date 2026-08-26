import type { V1beta1Plan } from '@forklift-ui/types';
import { describe, expect, it } from '@jest/globals';
import { mockI18n } from '@test-utils/mockI18n';

mockI18n();

import { hookTypes } from '../constants';
import { validateHooks } from '../utils';

const planWithVms = (vms: V1beta1Plan['spec'] extends infer S
  ? S extends { vms?: infer V }
    ? V
    : never
  : never): V1beta1Plan =>
  ({ spec: { vms } }) as V1beta1Plan;

describe('validateHooks', () => {
  it('returns empty string for missing or empty VMs', () => {
    expect(validateHooks({} as V1beta1Plan)).toBe('');
    expect(validateHooks(planWithVms([]))).toBe('');
    expect(validateHooks(planWithVms(undefined))).toBe('');
  });

  it('returns empty string when all VMs share the same hooks', () => {
    const hooks = [
      { hook: { name: 'pre', namespace: 'ns' }, step: hookTypes.PreHook },
      { hook: { name: 'post', namespace: 'ns' }, step: hookTypes.PostHook },
    ];
    expect(
      validateHooks(
        planWithVms([
          { hooks, name: 'vm-a' },
          { hooks: [...hooks].reverse(), name: 'vm-b' },
        ]),
      ),
    ).toBe('');
  });

  it('returns empty string when VMs have no hooks', () => {
    expect(
      validateHooks(planWithVms([{ name: 'vm-a' }, { hooks: [], name: 'vm-b' }])),
    ).toBe('');
  });

  it('errors when first VM has multiple pre hooks', () => {
    expect(
      validateHooks(
        planWithVms([
          {
            hooks: [
              { hook: { name: 'a', namespace: 'ns' }, step: hookTypes.PreHook },
              { hook: { name: 'b', namespace: 'ns' }, step: hookTypes.PreHook },
            ],
            name: 'vm-a',
          },
        ]),
      ),
    ).toBe('the plan is configured with more then one hook per step');
  });

  it('errors when first VM has multiple post hooks', () => {
    expect(
      validateHooks(
        planWithVms([
          {
            hooks: [
              { hook: { name: 'a', namespace: 'ns' }, step: hookTypes.PostHook },
              { hook: { name: 'b', namespace: 'ns' }, step: hookTypes.PostHook },
            ],
            name: 'vm-a',
          },
        ]),
      ),
    ).toBe('the plan is configured with more then one hook per step');
  });

  it('errors when VMs have different hooks', () => {
    expect(
      validateHooks(
        planWithVms([
          {
            hooks: [{ hook: { name: 'pre', namespace: 'ns' }, step: hookTypes.PreHook }],
            name: 'vm-a',
          },
          {
            hooks: [{ hook: { name: 'other', namespace: 'ns' }, step: hookTypes.PreHook }],
            name: 'vm-b',
          },
        ]),
      ),
    ).toBe('the plan is configured with different hooks for different virtual machines');
  });

  it('treats missing hooks on later VMs as different from first VM hooks', () => {
    expect(
      validateHooks(
        planWithVms([
          {
            hooks: [{ hook: { name: 'pre', namespace: 'ns' }, step: hookTypes.PreHook }],
            name: 'vm-a',
          },
          { name: 'vm-b' },
        ]),
      ),
    ).toBe('the plan is configured with different hooks for different virtual machines');
  });
});
