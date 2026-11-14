import type { V1beta1Provider } from '@forklift-ui/types';
import { describe, expect, it } from '@jest/globals';
import { mockI18n } from '@test-utils/mockI18n';
import { renderWithForm } from '@test-utils/renderWithForm';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NetworkMapFieldId } from '@utils/crds/maps/types';
import { PROVIDER_TYPES } from '@utils/providers/constants';
import { ProviderStatus } from '@utils/types';

import TargetProviderField from '../TargetProviderField';

mockI18n();

const createProvider = (
  name: string,
  type: string,
  phase: ProviderStatus = ProviderStatus.Ready,
): V1beta1Provider => ({
  apiVersion: 'forklift.konveyor.io/v1beta1',
  kind: 'Provider',
  metadata: { name, namespace: 'test-namespace' },
  spec: { secret: { name: `${name}-secret`, namespace: 'test-namespace' }, type },
  status: { phase },
});

const mockProviders: V1beta1Provider[] = [
  createProvider('openshift-ready', PROVIDER_TYPES.openshift),
  createProvider('openshift-host', PROVIDER_TYPES.openshift),
  createProvider('nutanix-ready', PROVIDER_TYPES.nutanix),
  createProvider('vsphere-ready', PROVIDER_TYPES.vsphere),
  createProvider('ovirt-ready', PROVIDER_TYPES.ovirt),
  createProvider('openshift-not-ready', PROVIDER_TYPES.openshift, ProviderStatus.Staging),
];

jest.mock('@utils/hooks/useK8sWatchResource', () => ({
  useK8sWatchResource: (initResource: { isList?: boolean } | null): unknown[] =>
    initResource?.isList ? [mockProviders, true, null] : [[], true, null],
}));

jest.mock('@utils/analytics/hooks/useForkliftAnalytics', () => ({
  useForkliftAnalytics: (): { trackEvent: jest.Mock } => ({ trackEvent: jest.fn() }),
}));

const openTargetProviderSelect = async (): Promise<HTMLElement> => {
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: 'Select menu toggle' }));
  return screen.getByRole('listbox');
};

describe('TargetProviderField', () => {
  it('lists only Ready OpenShift providers as target candidates', async () => {
    renderWithForm(<TargetProviderField />, {
      defaultValues: { [NetworkMapFieldId.Project]: 'test-namespace' },
    });

    const listbox = await openTargetProviderSelect();
    const optionNames = within(listbox)
      .getAllByRole('option')
      .map((option) => option.textContent);

    expect(optionNames).toEqual(['openshift-ready', 'openshift-host']);
  });
});
