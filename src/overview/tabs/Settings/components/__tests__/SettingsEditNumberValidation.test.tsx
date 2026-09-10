import type { V1beta1ForkliftController } from '@forklift-ui/types';
import { beforeEach, describe, expect, it } from '@jest/globals';
import { mockI18n } from '@test-utils/mockI18n';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { defaultValuesMap } from '../../utils/constants';
import { SettingsFields } from '../../utils/types';
import SettingsEdit from '../SettingsEdit';

mockI18n();

const mockK8sPatch = jest.fn().mockResolvedValue({});
jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  getGroupVersionKindForModel: jest.fn(),
  k8sPatch: jest.fn((...args: unknown[]) => mockK8sPatch(...args)),
  useK8sWatchResource: jest.fn(() => [[], true, undefined]),
}));

jest.mock('@utils/crds/common/selectors', () => ({
  getName: jest.fn(() => 'forklift-controller'),
  getNamespace: jest.fn(() => 'openshift-mtv'),
}));

const controller = {
  metadata: { name: 'forklift-controller', namespace: 'openshift-mtv' },
  spec: {},
} as unknown as V1beta1ForkliftController;

const closeOverlay = jest.fn();

/**
 * Schedule the updateValid() resolve after the RFH call updateValid()
 * in-order to prevent a race condition and validating current input
 * instead of the initial input set upon mount
 */
const flushMountValidation = async (): Promise<void> => {
  await act(async () => {
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 0);
    });
  });
};

describe('SettingsEditNumberValidation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows validation error when maxVMInFlight is set below 1', async () => {
    const user = userEvent.setup();
    render(<SettingsEdit closeOverlay={closeOverlay} controller={controller} />);
    await flushMountValidation();
    const confirmButton = screen.getByTestId('modal-confirm-button');
    const MaxVMInFlight = within(screen.getByTestId('max-vm-inflight-input')).getByRole(
      'spinbutton',
    );
    await user.clear(MaxVMInFlight);
    await user.type(MaxVMInFlight, '0');
    await waitFor(() => {
      expect(screen.getByText(/Not a valid input/)).toBeInTheDocument();
      expect(confirmButton).toBeDisabled();
    });
  });

  it('shows validation error when at least one of the fields are set to non-integer values and reverts to default upon blur', async () => {
    const user = userEvent.setup();
    render(<SettingsEdit closeOverlay={closeOverlay} controller={controller} />);
    await flushMountValidation();
    const confirmButton = screen.getByTestId('modal-confirm-button');
    const [MaxVMInFlight, EditVirtV2vMemsize, EditVirtV2vSmp, EditAapTimeout] = [
      within(screen.getByTestId('max-vm-inflight-input')).getByRole('spinbutton'),
      within(screen.getByTestId('settings-virt-v2v-memsize-input')).getByRole('spinbutton'),
      within(screen.getByTestId('settings-virt-v2v-smp-input')).getByRole('spinbutton'),
      within(screen.getByTestId('settings-aap-timeout-input')).getByRole('spinbutton'),
    ];
    const fields = [MaxVMInFlight, EditVirtV2vMemsize, EditVirtV2vSmp, EditAapTimeout];
    for (const field of fields) {
      await user.clear(field);
      await user.type(field, '1.5');
      await waitFor(() => {
        expect(screen.getByText(/Not a valid input/)).toBeInTheDocument();
        expect(confirmButton).toBeDisabled();
      });
    }
  });

  it('reverts back to default from an invalid value upon blur', async () => {
    const user = userEvent.setup();
    render(<SettingsEdit closeOverlay={closeOverlay} controller={controller} />);
    await flushMountValidation();
    const confirmButton = screen.getByTestId('modal-confirm-button');
    const [MaxVMInFlight, EditVirtV2vMemsize, EditVirtV2vSmp, EditAapTimeout] = [
      within(screen.getByTestId('max-vm-inflight-input')).getByRole('spinbutton'),
      within(screen.getByTestId('settings-virt-v2v-memsize-input')).getByRole('spinbutton'),
      within(screen.getByTestId('settings-virt-v2v-smp-input')).getByRole('spinbutton'),
      within(screen.getByTestId('settings-aap-timeout-input')).getByRole('spinbutton'),
    ];
    const fields: [HTMLElement, SettingsFields][] = [
      [MaxVMInFlight, SettingsFields.MaxVMInFlight],
      [EditVirtV2vMemsize, SettingsFields.VirtV2vMemsize],
      [EditVirtV2vSmp, SettingsFields.VirtV2vSmp],
      [EditAapTimeout, SettingsFields.AapTimeout],
    ];
    for (const [field, key] of fields) {
      await user.clear(field);
      await user.type(field, '1.5');
      await waitFor(() => {
        expect(screen.getByText(/Not a valid input/)).toBeInTheDocument();
        expect(confirmButton).toBeDisabled();
      });
      await user.click(document.body);
      expect(screen.queryByText(/Not a valid input/)).not.toBeInTheDocument();
      expect(field).toHaveValue(Number(defaultValuesMap[key]));
    }
  });
  it('reverts back to default from an invalid value upon blur', async () => {
    const user = userEvent.setup();
    render(<SettingsEdit closeOverlay={closeOverlay} controller={controller} />);
    await flushMountValidation();
    const [MaxVMInFlight, EditVirtV2vMemsize, EditVirtV2vSmp, EditAapTimeout] = [
      within(screen.getByTestId('max-vm-inflight-input')).getByRole('spinbutton'),
      within(screen.getByTestId('settings-virt-v2v-memsize-input')).getByRole('spinbutton'),
      within(screen.getByTestId('settings-virt-v2v-smp-input')).getByRole('spinbutton'),
      within(screen.getByTestId('settings-aap-timeout-input')).getByRole('spinbutton'),
    ];
    const fields: [HTMLElement, SettingsFields][] = [
      [MaxVMInFlight, SettingsFields.MaxVMInFlight],
      [EditVirtV2vMemsize, SettingsFields.VirtV2vMemsize],
      [EditVirtV2vSmp, SettingsFields.VirtV2vSmp],
      [EditAapTimeout, SettingsFields.AapTimeout],
    ];
    for (const [field, key] of fields) {
      await user.clear(field);
      await user.type(field, String(Number(defaultValuesMap[key])));
      await waitFor(() => {
        expect(screen.queryByText(/Not a valid input/)).not.toBeInTheDocument();
      });
    }
  });
});
