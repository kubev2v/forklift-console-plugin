import type { IoK8sApiCoreV1Pod } from '@forklift-ui/types';

import { getMigrationLogPod } from '../getMigrationLogPod';

const buildPod = (
  name: string,
  phase: string,
  labels?: Record<string, string>,
): IoK8sApiCoreV1Pod => ({
  metadata: { labels, name },
  spec: { containers: [{ name: 'virt-v2v' }] },
  status: { phase },
});

describe('getMigrationLogPod', () => {
  it('returns failed virt-v2v pod for ImageConversion', () => {
    const pods = [
      buildPod('forklift-wait-reboot-x', 'Running'),
      buildPod('plan-vm-1', 'Succeeded', { 'forklift.app': 'virt-v2v' }),
      buildPod('plan-vm-2', 'Failed', { 'forklift.app': 'virt-v2v' }),
    ];

    expect(getMigrationLogPod('ImageConversion', pods)?.metadata?.name).toBe('plan-vm-2');
  });

  it('returns undefined when pods list is empty', () => {
    expect(getMigrationLogPod('ImageConversion', [])).toBeUndefined();
  });
});
