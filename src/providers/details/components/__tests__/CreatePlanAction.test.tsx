import type { V1beta1Provider } from '@forklift-ui/types';
import { beforeEach, describe, expect, it } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import CreatePlanAction from '../CreatePlanAction';

const mockNavigate = jest.fn();
const mockUseClusterIsAwsPlatform = jest.fn();

jest.mock('react-router-dom-v5-compat', () => ({
  ...jest.requireActual('react-router-dom-v5-compat'),
  useNavigate: () => mockNavigate,
}));

jest.mock('@utils/hooks/useClusterIsAwsPlatform', () => ({
  useClusterIsAwsPlatform: () => mockUseClusterIsAwsPlatform(),
}));

jest.mock('@utils/analytics/hooks/useForkliftAnalytics', () => ({
  useForkliftAnalytics: () => ({ trackEvent: jest.fn() }),
}));

jest.mock('src/utils/hooks/useGetDeleteAndEditAccessReview', () => ({
  __esModule: true,
  default: () => ({ canCreate: true }),
}));

jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  useAccessReview: () => [true, false],
}));

const createProvider = (type: string): V1beta1Provider => ({
  apiVersion: 'forklift.konveyor.io/v1beta1',
  kind: 'Provider',
  metadata: { name: 'test-provider', namespace: 'test-ns' },
  spec: { secret: { name: 'secret', namespace: 'test-ns' }, type },
});

describe('CreatePlanAction', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the button for a non-EC2 provider', () => {
    mockUseClusterIsAwsPlatform.mockReturnValue(false);

    render(<CreatePlanAction namespace="test-ns" provider={createProvider('vsphere')} />);

    expect(screen.getByRole('button', { name: 'Create migration plan' })).toBeVisible();
  });

  it('should render the button for an EC2 provider on an AWS cluster', () => {
    mockUseClusterIsAwsPlatform.mockReturnValue(true);

    render(<CreatePlanAction namespace="test-ns" provider={createProvider('ec2')} />);

    expect(screen.getByRole('button', { name: 'Create migration plan' })).toBeVisible();
  });

  it('should hide the button for an EC2 provider on a non-AWS cluster', () => {
    mockUseClusterIsAwsPlatform.mockReturnValue(false);

    const { container } = render(
      <CreatePlanAction namespace="test-ns" provider={createProvider('ec2')} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('should navigate to plan creation on click', async () => {
    const user = userEvent.setup();
    mockUseClusterIsAwsPlatform.mockReturnValue(true);

    render(<CreatePlanAction namespace="test-ns" provider={createProvider('ec2')} />);

    await user.click(screen.getByRole('button', { name: 'Create migration plan' }));

    expect(mockNavigate).toHaveBeenCalledWith(
      expect.stringContaining('sourceProvider=test-provider'),
    );
  });
});
