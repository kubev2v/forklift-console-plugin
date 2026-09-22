import type { V1beta1Provider } from '@forklift-ui/types';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CATEGORY_TYPES, CONDITION_STATUS } from '@utils/constants';

import ProviderIssuesAlerts from '../ProviderIssuesAlerts';

jest.mock('src/utils/i18n', (): unknown => ({
  ForkliftTrans: ({ children }: { children: unknown }): unknown => children,
  t: (key: string) => key,
  useForkliftTranslation: () => ({ t: (key: string) => key }),
}));

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

describe('ProviderIssuesAlerts', () => {
  it('renders danger alert and opens drawer from link', async () => {
    const user = userEvent.setup();
    const setIsDrawerOpen = jest.fn();

    render(<ProviderIssuesAlerts provider={providerWithWarn} setIsDrawerOpen={setIsDrawerOpen} />);

    expect(screen.getByTestId('provider-issues-alert')).toBeInTheDocument();
    await user.click(screen.getByTestId('view-all-provider-issues-button'));
    expect(setIsDrawerOpen).toHaveBeenCalledWith(true);
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
