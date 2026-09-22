import { render } from '@testing-library/react';

import { useProvider } from '../../../hooks/useProvider';
import useProviderIssuesAlerts from '../../../hooks/useProviderIssuesAlerts';
import ProviderIssuesPanel from '../ProviderIssuesPanel';

jest.mock('../../../hooks/useProvider', () => ({
  useProvider: jest.fn(),
}));

jest.mock('../../../hooks/useProviderIssuesAlerts', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('src/utils/i18n', (): unknown => ({
  t: (key: string) => key,
}));

const mockUseProvider = useProvider as jest.Mock;
const mockUseProviderIssuesAlerts = useProviderIssuesAlerts as jest.Mock;

describe('ProviderIssuesPanel', () => {
  beforeEach(() => {
    mockUseProvider.mockReturnValue({
      loaded: true,
      loadError: null,
      provider: {},
    });
  });

  it('closes drawer when elevated conditions are no longer present after load', () => {
    const setShowProviderIssuesPanel = jest.fn();
    mockUseProviderIssuesAlerts.mockReturnValue({
      elevatedConditions: [],
      hasCriticalElevatedConditions: false,
      showElevatedConditions: false,
    });

    render(
      <ProviderIssuesPanel
        name="provider-1"
        namespace="openshift-mtv"
        setShowProviderIssuesPanel={setShowProviderIssuesPanel}
        showProviderIssuesPanel={true}
      />,
    );

    expect(setShowProviderIssuesPanel).toHaveBeenCalledWith(false);
  });
});
