import type { V1beta1ForkliftController } from '@forklift-ui/types';
import { beforeEach, describe, expect, it } from '@jest/globals';
import { mockI18n } from '@test-utils/mockI18n';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

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

const closeModal = jest.fn();

describe('SettingsEdit', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('keeps Save disabled until the form is dirty and valid', async () => {
    const user = userEvent.setup();
    render(<SettingsEdit closeModal={closeModal} controller={controller} />);

    const confirmButton = screen.getByTestId('modal-confirm-button');
    expect(confirmButton).toBeDisabled();

    const aapUrlInput = screen.getByTestId('aap-url-settings-input');
    await user.clear(aapUrlInput);
    await user.type(aapUrlInput, 'not a valid url');

    await waitFor(() => {
      expect(confirmButton).toBeDisabled();
    });
    expect(screen.getByText(/URL is invalid/)).toBeInTheDocument();

    await user.clear(aapUrlInput);
    await user.type(aapUrlInput, 'https://aap.example.com');

    await waitFor(() => {
      expect(confirmButton).toBeEnabled();
    });

    // Clearing back to the empty default leaves the form pristine → Save disabled.
    await user.clear(aapUrlInput);

    await waitFor(() => {
      expect(confirmButton).toBeDisabled();
    });
  });

  it('enables Save when clearing a pre-existing AAP URL', async () => {
    const user = userEvent.setup();
    const controllerWithUrl = {
      ...controller,
      spec: { [SettingsFields.AapUrl]: 'https://old.example.com' },
    } as unknown as V1beta1ForkliftController;

    render(<SettingsEdit closeModal={closeModal} controller={controllerWithUrl} />);

    const confirmButton = screen.getByTestId('modal-confirm-button');
    const aapUrlInput = screen.getByTestId('aap-url-settings-input');

    await user.clear(aapUrlInput);

    await waitFor(() => {
      expect(confirmButton).toBeEnabled();
    });
  });

  it('associates the AAP URL label with the input', async () => {
    render(<SettingsEdit closeModal={closeModal} controller={controller} />);

    await waitFor(() => {
      expect(screen.getByLabelText('AAP URL')).toHaveAttribute('id', SettingsFields.AapUrl);
    });
  });
});
