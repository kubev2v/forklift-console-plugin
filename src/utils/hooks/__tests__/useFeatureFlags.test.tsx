import type { FC } from 'react';

import { beforeEach, describe, expect, it } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { FEATURE_NAMES } from '@utils/constants';

import { useFeatureFlags } from '../useFeatureFlags';

const mockUseK8sWatchResource = jest.fn();

jest.mock('@utils/hooks/useK8sWatchResource', () => ({
  useK8sWatchResource: (...args: unknown[]): unknown => mockUseK8sWatchResource(...args),
}));

const FeatureFlagProbe: FC<{ featureName: string }> = ({ featureName }) => {
  const { isFeatureEnabled } = useFeatureFlags();

  return <span data-testid="feature-flag">{String(isFeatureEnabled(featureName))}</span>;
};

const expectFeatureFlag = (featureName: string, enabled: boolean): void => {
  render(<FeatureFlagProbe featureName={featureName} />);
  expect(screen.getByTestId('feature-flag')).toHaveTextContent(String(enabled));
};

describe('useFeatureFlags', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('uses the enabled default when copy appliance is absent from the controller spec', () => {
    mockUseK8sWatchResource.mockReturnValue([[{ spec: {} }], true, null]);

    expectFeatureFlag(FEATURE_NAMES.COPY_APPLIANCE, true);
  });

  it.each([
    { description: 'boolean false', value: false },
    { description: 'string false', value: 'false' },
  ])('honors an explicit $description for copy appliance', ({ value }) => {
    mockUseK8sWatchResource.mockReturnValue([
      [{ spec: { [FEATURE_NAMES.COPY_APPLIANCE]: value } }],
      true,
      null,
    ]);

    expectFeatureFlag(FEATURE_NAMES.COPY_APPLIANCE, false);
  });

  it.each([
    { description: 'boolean true', value: true },
    { description: 'string true', value: 'true' },
  ])('enables copy appliance for an explicit $description', ({ value }) => {
    mockUseK8sWatchResource.mockReturnValue([
      [{ spec: { [FEATURE_NAMES.COPY_APPLIANCE]: value } }],
      true,
      null,
    ]);

    expectFeatureFlag(FEATURE_NAMES.COPY_APPLIANCE, true);
  });

  it('disables a flag with no configured default when absent from the controller spec', () => {
    mockUseK8sWatchResource.mockReturnValue([[{ spec: {} }], true, null]);

    expectFeatureFlag(FEATURE_NAMES.OCP_LIVE_MIGRATION, false);
  });

  it('keeps copy appliance disabled while the controller is loading', () => {
    mockUseK8sWatchResource.mockReturnValue([[{ spec: {} }], false, null]);

    expectFeatureFlag(FEATURE_NAMES.COPY_APPLIANCE, false);
  });

  it('keeps copy appliance disabled when the controller watch errors', () => {
    mockUseK8sWatchResource.mockReturnValue([[{ spec: {} }], true, new Error('Forbidden')]);

    expectFeatureFlag(FEATURE_NAMES.COPY_APPLIANCE, false);
  });

  it('keeps copy appliance disabled when no controller exists', () => {
    mockUseK8sWatchResource.mockReturnValue([[], true, null]);

    expectFeatureFlag(FEATURE_NAMES.COPY_APPLIANCE, false);
  });
});
