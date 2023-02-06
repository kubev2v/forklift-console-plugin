import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryHistory } from 'history';
import '@testing-library/jest-dom';
import { Router } from 'react-router-dom';
import { QueryClientProvider, QueryClient } from 'react-query';
const queryClient = new QueryClient();

import { SourceProvidersTable } from '../SourceProvidersTable';
import {
  MOCK_CLUSTER_PROVIDERS,
  MOCK_INVENTORY_PROVIDERS,
} from 'legacy/src/queries/mocks/providers.mock';
import { correlateProviders } from '../../helpers';

describe('<SourceProvidersTable />', () => {
  const history = createMemoryHistory();
  const props = {
    providers: correlateProviders(
      MOCK_CLUSTER_PROVIDERS,
      MOCK_INVENTORY_PROVIDERS.vsphere,
      'vsphere'
    ),
  };

  it('renders vsphere table', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router history={history}>
          <SourceProvidersTable {...props} providerType="vsphere" />
        </Router>
      </QueryClientProvider>
    );

    expect(screen.getByRole('grid', { name: /VMware providers table/ })).toBeInTheDocument();
    expect(
      screen.getByRole('row', {
        name: /vcenter-1 https:\/\/vcenter.v2v.bos.redhat.com\/sdk 2 2 41 8 3 Ready/,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('row', {
        name: /vcenter-2 https:\/\/vcenter.v2v.bos.redhat.com\/sdk 2 2 41 8 3 Critical/,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('row', {
        name: /vcenter-3 https:\/\/vcenter.v2v.bos.redhat.com\/sdk 2 2 41 8 3 Loading... Pending/,
      })
    ).toBeInTheDocument();
  });

  it('renders Hosts links', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router history={history}>
          <SourceProvidersTable {...props} providerType="vsphere" />
        </Router>
      </QueryClientProvider>
    );

    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(1); // NOTE: no link for non-ready vcenter-2 or vcenter-3 providers
    expect(links[0]).toHaveAttribute('href', '/providers/vsphere/vcenter-1');
  });

  it('renders status condition', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router history={history}>
          <SourceProvidersTable {...props} providerType="vsphere" />
        </Router>
      </QueryClientProvider>
    );

    userEvent.click(screen.getByRole('button', { name: /Critical/ }));

    await waitFor(() => {
      expect(screen.getByText('The provider is not responding.')).toBeInTheDocument();
    });
  });

  it('renders action menu', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router history={history}>
          <SourceProvidersTable {...props} providerType="vsphere" />
        </Router>
      </QueryClientProvider>
    );

    userEvent.click(screen.getAllByRole('button', { name: /Actions/ })[0]);

    await waitFor(() => {
      const dropdownEdit = screen.getByRole('menuitem', { name: /Edit/ });
      const actionEdit = screen.getByText(/Edit/);

      expect(dropdownEdit).toHaveTextContent('Edit');
      expect(dropdownEdit).toContainElement(actionEdit);

      const dropdownRemove = screen.getByRole('menuitem', { name: /Remove/ });
      const actionRemove = screen.getByText(/Remove/);

      expect(dropdownRemove).toHaveTextContent('Remove');
      expect(dropdownRemove).toContainElement(actionRemove);
    });
  });
});
