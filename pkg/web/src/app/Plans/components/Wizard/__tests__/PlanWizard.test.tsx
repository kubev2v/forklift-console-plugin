import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryHistory } from 'history';
import '@testing-library/jest-dom';
import { RouteComponentProps, Router } from 'react-router-dom';
import { QueryClientProvider, QueryClient } from 'react-query';
import { PlanWizard } from '../PlanWizard';
import { ENV, PATH_PREFIX } from '@app/common/constants';

const queryClient = new QueryClient();

const routeProps: RouteComponentProps<{ ns: string }> = {
  match: {
    params: { ns: ENV.NAMESPACE },
    isExact: true,
    path: '',
    url: '',
  },
  history: createMemoryHistory(),
  location: {
    hash: '',
    pathname: '',
    search: '',
    state: '',
  },
};

describe('<AddEditProviderModal />', () => {
  const history = createMemoryHistory();

  it('allows to cancel a plan wizard', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router history={history}>
          <PlanWizard {...routeProps} />
        </Router>
      </QueryClientProvider>
    );

    const cancelButton = await screen.findByRole('button', { name: /Cancel/ });
    expect(cancelButton).toBeEnabled();
  });

  it('allows to create a plan', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router history={history}>
          <PlanWizard {...routeProps} />
        </Router>
      </QueryClientProvider>
    );

    const name = await screen.findByRole('textbox', { name: /plan name/i });
    const description = await screen.findByRole('textbox', { name: /plan description/i });
    const providers = await screen.findAllByLabelText(/select a provider/i);
    const namespace = await screen.findByPlaceholderText('Select a namespace');

    expect(namespace).toBeDisabled();

    userEvent.type(name, 'planname');
    userEvent.type(description, 'plan description');

    await waitFor(() => {
      userEvent.click(providers[0]);
    });

    await screen.findByRole('option', {
      name: /vcenter-1/i,
      hidden: true,
    });

    userEvent.click(providers[1]);
    await screen.findByRole('option', {
      name: /ocpv-1/i,
      hidden: true,
    });

    expect(namespace).toHaveAttribute('disabled', '');

    await waitFor(() => {
      userEvent.click(namespace);
    });

    userEvent.type(namespace, 'openshift-migration');

    const nextButton = await screen.findByRole('button', { name: /Next/ });
    expect(nextButton).toHaveAttribute('disabled', '');
    const cancelButton = await screen.findByRole('button', { name: /Cancel/ });
    expect(cancelButton).toBeEnabled();

    await waitFor(() => {
      userEvent.click(nextButton);
    });

    // TODO: Continue to VMs selection
  });

  it('allows to edit a plan', async () => {
    const history = createMemoryHistory();
    history.push(`${PATH_PREFIX}/plans/plantest-02/edit`);
    render(
      <QueryClientProvider client={queryClient}>
        <Router history={history}>
          <PlanWizard {...routeProps} />
        </Router>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByRole('navigation', { name: /Breadcrumb/ })).toHaveTextContent(
        'Migration plans'
      );
      expect(screen.getByRole('navigation', { name: /Breadcrumb/ })).toHaveTextContent(
        'plantest-02'
      );
      expect(screen.getByRole('navigation', { name: /Breadcrumb/ })).toHaveTextContent('Edit');
      expect(screen.getByRole('link', { name: /Migration plans/ })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /Edit migration plan/ })).toBeInTheDocument();

      expect(screen.getByRole('heading', { name: /General settings/ })).toBeInTheDocument();
      expect(screen.getByText(/plantest-02/i)).toBeInTheDocument();
      expect(screen.getByText(/my 2nd plan/i)).toBeInTheDocument();
      expect(screen.getByText(/vcenter-1/i)).toBeInTheDocument();
      expect(screen.getByText(/ocpv-1/i)).toBeInTheDocument();
    });

    const nextButton = await screen.findByRole('button', { name: /Next/ });
    expect(nextButton).toBeEnabled();
    await waitFor(() => {
      userEvent.click(nextButton);
    });

    expect(screen.getByRole('heading', { name: /Filter by VM location/ })).toBeInTheDocument();
    const v2vDC = await screen.findByRole('button', { name: /V2V-DC/ });
    await waitFor(() => {
      userEvent.click(v2vDC);
    });
    expect(screen.getByRole('checkbox', { name: /Select Cluster V2V_Cluster/ })).toBeChecked();
    expect(nextButton).toBeEnabled();
    await waitFor(() => {
      userEvent.click(nextButton);
    });

    expect(screen.getByRole('heading', { name: /Select VMs/ })).toBeInTheDocument();
    await waitFor(() => expect(screen.getByLabelText('VMware VMs table')).toBeInTheDocument());
    expect(screen.getByRole('checkbox', { name: /Select row 0/ })).toBeChecked();
    expect(nextButton).toBeEnabled();
    await waitFor(() => {
      userEvent.click(nextButton);
    });

    expect(screen.getByRole('heading', { name: /Network mapping/ })).toBeInTheDocument();
    expect(screen.getByText(/vmware-network-1/i)).toBeInTheDocument();
    const networkTarget = screen.getByRole('textbox', { name: /select target.../i });
    expect(networkTarget).toHaveValue('openshift-migration / ocp-network-1');
    expect(screen.getByRole('checkbox', { name: /save mapping checkbox/ })).not.toBeChecked();
    await waitFor(() => expect(nextButton).toBeEnabled());
    await waitFor(() => {
      userEvent.click(nextButton);
    });

    expect(screen.getByRole('heading', { name: /Storage mapping/ })).toBeInTheDocument();
    expect(screen.getByText(/vmware-datastore-1/i)).toBeInTheDocument();
    const storageTarget = screen.getByRole('textbox', { name: /select target.../i });
    expect(storageTarget).toHaveValue('large');
    expect(screen.getByRole('checkbox', { name: /save mapping checkbox/ })).not.toBeChecked();
    await waitFor(() => expect(nextButton).toBeEnabled());
    await waitFor(() => {
      userEvent.click(nextButton);
    });

    expect(screen.getByRole('heading', { name: /Migration type/ })).toBeInTheDocument();
    expect(screen.getByLabelText(/Cold migration/)).toHaveAttribute('checked');
    await waitFor(() => expect(nextButton).toBeEnabled());
    await waitFor(() => {
      userEvent.click(nextButton);
    });

    expect(
      screen.getByRole('heading', { name: /Add hooks to the plan \(optional\)/ })
    ).toBeInTheDocument();
    await waitFor(() => expect(nextButton).toBeEnabled());
    await waitFor(() => {
      userEvent.click(nextButton);
    });

    // Review step
    expect(screen.getByRole('heading', { name: /Review the migration plan/ })).toBeInTheDocument();
    expect(screen.getByText(/my 2nd plan/i)).toBeInTheDocument();
    expect(screen.getByText(/vcenter-1/i)).toBeInTheDocument();
    expect(screen.getByText(/ocpv-1/i)).toBeInTheDocument();
    expect(screen.getByText(/openshift-migration$/i)).toBeInTheDocument();
    expect(screen.getByText(/ocp-network-2/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /1/i })).toBeEnabled();
    expect(networkTarget).toHaveValue('openshift-migration / ocp-network-1');
    expect(storageTarget).toHaveValue('large');

    expect(screen.getByRole('button', { name: /Finish/i })).toBeEnabled();
  });
});
