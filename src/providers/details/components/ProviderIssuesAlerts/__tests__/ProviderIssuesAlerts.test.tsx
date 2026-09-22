import type { V1beta1Provider } from '@forklift-ui/types';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CATEGORY_TYPES, CONDITION_STATUS } from '@utils/constants';

import ProviderIssuesAlerts from '../ProviderIssuesAlerts';

jest.mock('src/utils/i18n', (): unknown => {
  const t = (key: string, options?: { count?: number }): string => {
    if (options?.count === undefined) {
      return key;
    }
    return `${key}:${options.count}`;
  };

  return {
    ForkliftTrans: ({ children }: { children: unknown }): unknown => children,
    t,
    useForkliftTranslation: () => ({ t }),
  };
});

const providerWithWarn: V1beta1Provider = {
  metadata: { name: 'provider-1', namespace: 'openshift-mtv' },
  status: {
    conditions: [
      {
        category: CATEGORY_TYPES.WARNING,
        message: 'TLS verification skipped',
        status: CONDITION_STATUS.TRUE,
        type: 'ConnectionInsecure',
      },
    ],
  },
} as unknown as V1beta1Provider;

const providerWithCritical: V1beta1Provider = {
  metadata: { name: 'provider-1', namespace: 'openshift-mtv' },
  status: {
    conditions: [
      {
        category: CATEGORY_TYPES.CRITICAL,
        message: 'Connection failed',
        status: CONDITION_STATUS.TRUE,
        type: 'ConnectionTestFailed',
      },
    ],
  },
} as unknown as V1beta1Provider;

describe('ProviderIssuesAlerts', () => {
  it('renders warning alert for warn-only conditions and opens drawer from link', async () => {
    const user = userEvent.setup();
    const setIsDrawerOpen = jest.fn();

    render(<ProviderIssuesAlerts provider={providerWithWarn} setIsDrawerOpen={setIsDrawerOpen} />);

    expect(screen.getByTestId('provider-issues-alert')).toHaveClass('pf-m-warning');
    expect(screen.getByText('{{count}} issues impacting this provider:1')).toBeInTheDocument();
    expect(
      screen.queryByText('To troubleshoot, check the Forklift controller pod logs.'),
    ).not.toBeInTheDocument();
    await user.click(screen.getByTestId('view-all-provider-issues-button'));
    expect(setIsDrawerOpen).toHaveBeenCalledWith(true);
  });

  it('renders danger alert and troubleshooting text for critical conditions', () => {
    render(<ProviderIssuesAlerts provider={providerWithCritical} />);

    expect(screen.getByTestId('provider-issues-alert')).toHaveClass('pf-m-danger');
    expect(screen.getByText('{{count}} issues impacting this provider:1')).toBeInTheDocument();
    expect(
      screen.getByText('To troubleshoot, check the Forklift controller pod logs.'),
    ).toBeInTheDocument();
  });

  it('renders nothing when there are no elevated conditions', () => {
    const provider = {
      metadata: { name: 'provider-1', namespace: 'openshift-mtv' },
      status: { conditions: [] },
    } as unknown as V1beta1Provider;

    const { container } = render(<ProviderIssuesAlerts provider={provider} />);

    expect(container).toBeEmptyDOMElement();
  });
});
