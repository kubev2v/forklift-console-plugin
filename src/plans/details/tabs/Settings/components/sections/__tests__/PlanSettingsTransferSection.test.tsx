import type { ReactElement } from 'react';

import { describe, expect, it } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import type { PlanSettingsVisibility } from '../../../hooks/usePlanSettingsVisibility';
import PlanSettingsTransferSection from '../PlanSettingsTransferSection';

jest.mock(
  '../../../../Details/components/SettingsSection/components/OffloadPopulatorPriorityClass/OffloadPopulatorPriorityClassDetailsItem',
  () => ({
    __esModule: true,
    default: ({ shouldRender }: { shouldRender?: boolean }): ReactElement | null =>
      shouldRender ? <div data-testid="offload-populator-priority-class-detail-item" /> : null,
  }),
);

jest.mock(
  '../../../../Details/components/SettingsSection/components/PlanTransferNetwork/TransferNetworkDetailsItem',
  () => ({ __esModule: true, default: (): null => null }),
);

jest.mock(
  '../../../../Details/components/SettingsSection/components/PreserveStaticIPs/PreserveStaticIPsDetailsItem',
  () => ({ __esModule: true, default: (): null => null }),
);

const buildVisibility = (overrides: Partial<PlanSettingsVisibility>): PlanSettingsVisibility => ({
  canPatch: true,
  isCopyOffloadEnabled: true,
  isOvirt: false,
  isProviderLoaded: true,
  isTransferNetworkVisible: true,
  isVddkInitImageNotSet: false,
  isVsphere: true,
  plan: { metadata: { name: 'plan' }, spec: {} } as never,
  providerLoadError: null,
  ...overrides,
});

describe('PlanSettingsTransferSection', () => {
  it('shows the offload populator priority class row for vSphere with copy offload enabled', () => {
    render(<PlanSettingsTransferSection visibility={buildVisibility({})} />);

    expect(screen.getByTestId('offload-populator-priority-class-detail-item')).toBeInTheDocument();
  });

  it('shows the row when copy offload is disabled but a value is set', () => {
    render(
      <PlanSettingsTransferSection
        visibility={buildVisibility({
          isCopyOffloadEnabled: false,
          plan: {
            metadata: { name: 'plan' },
            spec: { offloadPopulatorPriorityClassName: 'high-priority' },
          } as never,
        })}
      />,
    );

    expect(screen.getByTestId('offload-populator-priority-class-detail-item')).toBeInTheDocument();
  });

  it('hides the row when copy offload is disabled', () => {
    render(
      <PlanSettingsTransferSection visibility={buildVisibility({ isCopyOffloadEnabled: false })} />,
    );

    expect(
      screen.queryByTestId('offload-populator-priority-class-detail-item'),
    ).not.toBeInTheDocument();
  });

  it('hides the row for non-vSphere plans', () => {
    render(<PlanSettingsTransferSection visibility={buildVisibility({ isVsphere: false })} />);

    expect(
      screen.queryByTestId('offload-populator-priority-class-detail-item'),
    ).not.toBeInTheDocument();
  });
});
