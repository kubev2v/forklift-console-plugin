import { beforeEach, describe, expect, it } from '@jest/globals';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import './setup-provider-form-mocks';

import CreateProviderForm from '../CreateProviderForm';

import { clearAllProviderMocks, mockCreateProviderTypeField } from './test-utils';

jest.mock('../fields/ProviderTypeField', () => {
  const { mockCreateProviderTypeField: createMock } = jest.requireActual('./test-utils');
  return createMock('vsphere', 'VMware vSphere');
});

describe('CreateProviderForm - vSphere Provider', () => {
  beforeEach(() => {
    clearAllProviderMocks();
    // Static import kept so knip sees the helper; factory uses requireActual (jest hoist).
    expect(mockCreateProviderTypeField).toEqual(expect.any(Function));
  });

  it('shows vSphere-specific fields after selecting vSphere type', async () => {
    const user = userEvent.setup();
    render(<CreateProviderForm />);

    await user.selectOptions(screen.getByLabelText(/provider type/i), 'vsphere');

    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: /provider name/i })).toBeInTheDocument();
      expect(screen.getByRole('radiogroup', { name: /vsphere endpoint/i })).toBeInTheDocument();
      expect(screen.getByTestId('vsphere-url-input')).toBeInTheDocument();
      expect(screen.getByRole('radiogroup', { name: 'Disk transfer method' })).toBeInTheDocument();
      expect(
        screen.getByRole('radio', { name: /skip certificate validation/i }),
      ).toBeInTheDocument();
    });

    expect(screen.queryByTestId('vsphere-username-input')).not.toBeInTheDocument();
    expect(screen.queryByTestId('vsphere-password-input')).not.toBeInTheDocument();
    expect(screen.getByRole('form', { name: 'Provider details' })).toHaveClass('pf-v6-c-form');
  });

  it('shows credentials fields when URL is provided', async () => {
    const user = userEvent.setup();
    render(<CreateProviderForm />);

    await user.selectOptions(screen.getByLabelText(/provider type/i), 'vsphere');

    await waitFor(() => {
      expect(screen.getByTestId('vsphere-url-input')).toBeInTheDocument();
    });

    const urlInput = screen.getByTestId('vsphere-url-input');
    await user.type(urlInput, 'https://vcenter.example.com/sdk');

    await waitFor(() => {
      expect(screen.getByTestId('vsphere-username-input')).toBeInTheDocument();
      expect(screen.getByTestId('vsphere-password-input')).toBeInTheDocument();
    });
  });

  it('shows vCenter endpoint option by default', async () => {
    const user = userEvent.setup();
    render(<CreateProviderForm />);

    await user.selectOptions(screen.getByLabelText(/provider type/i), 'vsphere');

    await waitFor(() => {
      const vcenterRadio = screen.getByTestId('vsphere-endpoint-vcenter-radio');
      expect(vcenterRadio).toBeChecked();
    });
  });

  it('selects the configure disk transfer method option by default', async () => {
    const user = userEvent.setup();
    render(<CreateProviderForm />);

    await user.selectOptions(screen.getByLabelText(/provider type/i), 'vsphere');

    await waitFor(() => {
      const configureRadio = screen.getByTestId('disk-transfer-configure-radio');
      expect(configureRadio).toBeChecked();
    });
    expect(screen.getByTestId('vddk-setup-skip-radio')).not.toBeChecked();
    expect(screen.getByTestId('disk-transfer-configure-radio')).toHaveAccessibleName(
      'Configure disk transfer method',
    );
    expect(screen.getByTestId('disk-transfer-method-toggle')).toBeInTheDocument();
  });

  it('shows one required image error below the image field only after interaction', async () => {
    const user = userEvent.setup();
    render(<CreateProviderForm />);

    await user.selectOptions(screen.getByLabelText(/provider type/i), 'vsphere');
    expect(screen.queryByText('VDDK image is required')).not.toBeInTheDocument();

    const imageInput = screen.getByTestId('vsphere-vddk-image-input');
    await user.type(imageInput, 'quay.io/vddk:latest');
    await user.clear(imageInput);

    await waitFor(() => {
      expect(screen.getAllByText('VDDK image is required')).toHaveLength(1);
    });
    expect(screen.getByTestId('vsphere-vddk-image-helper-error')).toHaveTextContent(
      'VDDK image is required',
    );

    await user.type(imageInput, 'quay.io/vddk:latest');
    await waitFor(() => {
      expect(screen.queryByText('VDDK image is required')).not.toBeInTheDocument();
    });
  });

  it('hides other provider fields when vSphere provider is selected', async () => {
    const user = userEvent.setup();
    render(<CreateProviderForm />);

    await user.selectOptions(screen.getByLabelText(/provider type/i), 'vsphere');

    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: /provider name/i })).toBeInTheDocument();
    });

    expect(
      screen.queryByRole('textbox', { name: /service account bearer token/i }),
    ).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/nfs shared directory/i)).not.toBeInTheDocument();
    expect(screen.queryByTestId('openstack-url-input')).not.toBeInTheDocument();
    expect(screen.queryByTestId('ovirt-url-input')).not.toBeInTheDocument();
  });
});
