import { beforeEach, describe, expect, it } from '@jest/globals';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import './setup-provider-form-mocks';

import CreateProviderForm from '../CreateProviderForm';

import { clearAllProviderMocks } from './test-utils';

jest.mock('../fields/ProviderTypeField', () =>
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('./test-utils').mockCreateProviderTypeField('ova', 'Open Virtual Appliance'),
);

describe('CreateProviderForm - OVA Provider', () => {
  beforeEach(() => {
    clearAllProviderMocks();
  });

  it('shows OVA-specific fields after selecting OVA type', async () => {
    const user = userEvent.setup();
    render(<CreateProviderForm />);

    await user.selectOptions(screen.getByLabelText(/provider type/i), 'ova');

    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: /provider name/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/nfs shared directory/i)).toBeInTheDocument();
    });
  });

  it('hides OpenShift fields when OVA provider is selected', async () => {
    const user = userEvent.setup();
    render(<CreateProviderForm />);

    await user.selectOptions(screen.getByLabelText(/provider type/i), 'ova');

    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: /provider name/i })).toBeInTheDocument();
    });

    expect(screen.queryByRole('textbox', { name: /api endpoint url/i })).not.toBeInTheDocument();
    expect(
      screen.queryByRole('textbox', { name: /service account bearer token/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('radio', { name: /skip certificate validation/i }),
    ).not.toBeInTheDocument();
  });
});
