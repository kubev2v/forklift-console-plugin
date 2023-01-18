import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryHistory } from 'history';
import '@testing-library/jest-dom';
import { Router } from 'react-router-dom';
import { QueryClientProvider, QueryClient } from 'react-query';
import { AddEditProviderModal } from '../AddEditProviderModal';
import { MOCK_CLUSTER_PROVIDERS } from '@app/queries/mocks/providers.mock';
import { ENV } from '@app/common/constants';

const queryClient = new QueryClient();

describe('<AddEditProviderModal />', () => {
  beforeAll(() => (window.HTMLElement.prototype.scrollIntoView = jest.fn()));

  const toggleModalAndResetEdit = () => {
    return;
  };

  const history = createMemoryHistory();
  const props = {
    onClose: toggleModalAndResetEdit,
    namespace: ENV.NAMESPACE,
  };

  it('allows to cancel addition/edition of a provider', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router history={history}>
          <AddEditProviderModal {...props} providerBeingEdited={null} />
        </Router>
      </QueryClientProvider>
    );

    const cancelButton = await screen.findByRole('button', { name: /Cancel/ });
    expect(cancelButton).toBeEnabled();
  });

  // oVirt Provider

  it('allows adding a oVirt provider', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router history={history}>
          <AddEditProviderModal {...props} providerBeingEdited={null} />
        </Router>
      </QueryClientProvider>
    );

    const typeButton = await screen.findByLabelText(/provider type/i);
    await waitFor(() => {
      userEvent.click(typeButton);
    });
    const oVirtButton = await screen.findByRole('option', { name: /ovirt/i, hidden: true });
    await waitFor(() => {
      userEvent.click(oVirtButton);
    });
    const caCertField = screen.getByLabelText(/^File upload/);
    const name = screen.getByRole('textbox', { name: /Name/ });
    const hostname = screen.getByRole('textbox', {
      name: /oVirt Engine host name or IP address/i,
    });
    const username = screen.getByRole('textbox', { name: /oVirt Engine user name/i });
    const password = screen.getByLabelText(/^oVirt Engine password/);
    await waitFor(() => {
      userEvent.type(name, 'providername');
      userEvent.type(hostname, 'host.example.com');
      userEvent.type(username, 'username');
      userEvent.type(password, 'password');
      userEvent.type(caCertField, '-----BEGIN CERTIFICATE-----abc-----END CERTIFICATE-----');
    });

    const addButton = await screen.findByRole('dialog', { name: /Add provider/ });
    expect(addButton).toBeEnabled();
    const cancelButton = await screen.findByRole('button', { name: /Cancel/ });
    expect(cancelButton).toBeEnabled();
  });

  // Vsphere Provider

  it('allows adding a vsphere provider', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router history={history}>
          <AddEditProviderModal {...props} providerBeingEdited={null} />
        </Router>
      </QueryClientProvider>
    );

    const typeButton = await screen.findByLabelText(/provider type/i);
    await waitFor(() => {
      userEvent.click(typeButton);
    });

    const vsphereButton = await screen.findByRole('option', { name: /vmware/i, hidden: true });
    await waitFor(() => {
      userEvent.click(vsphereButton);
    });

    const name = screen.getByRole('textbox', { name: /Name/ });
    const hostname = screen.getByRole('textbox', {
      name: /vCenter host name or IP address/i,
    });
    const username = screen.getByRole('textbox', { name: /vCenter user name/i });
    const password = screen.getByLabelText(/^vCenter password/);

    userEvent.type(name, 'providername');
    userEvent.type(hostname, 'host.example.com');
    userEvent.type(username, 'username');
    userEvent.type(password, 'password');

    const verifyButton = await screen.findByLabelText(/verify certificate/i);
    expect(verifyButton).toBeEnabled();

    await waitFor(() => {
      userEvent.click(verifyButton);
    });

    expect(
      screen.getByText('39:5C:6A:2D:36:38:B2:52:2B:21:EA:74:11:59:89:5E:20:D5:D9:A2')
    ).toBeInTheDocument();
    const validateCertificationCheckbox = screen.getByRole('checkbox', {
      name: /validate certificate/i,
    });

    await waitFor(() => {
      userEvent.click(validateCertificationCheckbox);
    });

    expect(validateCertificationCheckbox).toBeChecked();
    const addButton = await screen.findByRole('dialog', { name: /Add provider/ });
    expect(addButton).toBeEnabled();
    const cancelButton = await screen.findByRole('button', { name: /Cancel/ });
    expect(cancelButton).toBeEnabled();
  });

  it('fails to add a vsphere provider with wrong values', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router history={history}>
          <AddEditProviderModal {...props} providerBeingEdited={null} />
        </Router>
      </QueryClientProvider>
    );

    const typeButton = await screen.findByLabelText(/provider type/i);
    await waitFor(() => {
      userEvent.click(typeButton);
    });

    const vsphereButton = await screen.findByRole('option', { name: /vmware/i, hidden: true });
    await waitFor(() => {
      userEvent.click(vsphereButton);
    });

    const name = screen.getByRole('textbox', { name: /Name/ });
    const hostname = screen.getByRole('textbox', {
      name: /vCenter host name or IP address/i,
    });
    const username = screen.getByRole('textbox', { name: /vCenter user name/i });
    const password = screen.getByLabelText(/^vCenter password/);

    await waitFor(() => {
      userEvent.type(name, 'providername');
      userEvent.type(hostname, 'hostname');
      userEvent.type(username, 'username');
      userEvent.type(password, 'password');
    });

    const addButton = await screen.findByRole('button', { name: /Add/ });
    expect(addButton).toBeDisabled();
    const cancelButton = await screen.findByRole('button', { name: /Cancel/ });
    expect(cancelButton).toBeEnabled();
  });

  it('allows editing a vsphere provider', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router history={history}>
          <AddEditProviderModal {...props} providerBeingEdited={MOCK_CLUSTER_PROVIDERS[0]} />
        </Router>
      </QueryClientProvider>
    );

    const editButton = await screen.findByRole('dialog', { name: /Edit provider/ });
    expect(editButton).not.toHaveAttribute('disabled');
    const cancelButton = await screen.findByRole('button', { name: /Cancel/ });
    expect(cancelButton).toBeEnabled();
  });

  // OpenShift Provider

  it('allows to add an openshift provider', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router history={history}>
          <AddEditProviderModal {...props} providerBeingEdited={null} />
        </Router>
      </QueryClientProvider>
    );

    const typeButton = await screen.findByLabelText(/provider type/i);
    await waitFor(() => {
      userEvent.click(typeButton);
    });

    const openshiftButton = await screen.findByRole('option', { name: /kubevirt/i, hidden: true });
    await waitFor(() => {
      userEvent.click(openshiftButton);
    });

    const name = screen.getByRole('textbox', { name: /name/i });
    const url = screen.getByRole('textbox', { name: /url/i });
    const saToken = screen.getByLabelText(/^Service account token/);

    await waitFor(() => {
      userEvent.type(name, 'providername');
      userEvent.type(url, 'http://host.example.com');
      userEvent.type(saToken, 'saToken');
    });

    const addButton = await screen.findByRole('dialog', { name: /Add provider/ });
    expect(addButton).toBeEnabled();
    const cancelButton = await screen.findByRole('button', { name: /Cancel/ });
    expect(cancelButton).toBeEnabled();
  });

  it('fails to add an openshift provider with wrong values', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router history={history}>
          <AddEditProviderModal {...props} providerBeingEdited={null} />
        </Router>
      </QueryClientProvider>
    );

    const typeButton = await screen.findByLabelText(/provider type/i);
    await waitFor(() => {
      userEvent.click(typeButton);
    });

    const openshiftButton = await screen.findByRole('option', { name: /kubevirt/i, hidden: true });
    await waitFor(() => {
      userEvent.click(openshiftButton);
    });

    const name = screen.getByRole('textbox', { name: /name/i });
    const url = screen.getByRole('textbox', { name: /url/i });
    const saToken = screen.getByLabelText(/^Service account token/);

    await waitFor(() => {
      userEvent.type(name, 'providername');
      userEvent.type(url, 'host');
      userEvent.type(saToken, 'saToken');
    });

    const addButton = screen.getByRole('button', { name: /Add/ });
    expect(addButton).toBeDisabled();
    const cancelButton = await screen.findByRole('button', { name: /Cancel/ });
    expect(cancelButton).toBeEnabled();
  });

  it('allows editing an openshift provider', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router history={history}>
          <AddEditProviderModal {...props} providerBeingEdited={MOCK_CLUSTER_PROVIDERS[4]} />
        </Router>
      </QueryClientProvider>
    );

    const editButton = await screen.findByRole('dialog', { name: /Edit provider/ });
    expect(editButton).toBeEnabled();
    const cancelButton = await screen.findByRole('button', { name: /Cancel/ });
    expect(cancelButton).toBeEnabled();
  });
});
