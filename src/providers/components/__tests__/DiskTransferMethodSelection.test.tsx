import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { VddkSetupMode } from '../../utils/constants';
import DiskTransferMethodSelection from '../DiskTransferMethodSelection';

jest.mock('src/utils/i18n', (): unknown => ({
  t: (key: string): string => key,
  useForkliftTranslation: (): { t: (key: string) => string } => ({
    t: (key: string): string => key,
  }),
}));
jest.mock('@components/VddkUploader/VddkUploader', (): unknown => ({
  __esModule: true,
  default: (): React.ReactElement => <div>Archive uploader</div>,
}));
jest.mock('../SkipVddkAlert', (): unknown => ({
  __esModule: true,
  default: (): React.ReactElement => <div>Skip warning</div>,
}));

const defaultProps = {
  aioEnabled: false,
  isCopyApplianceEnabled: true,
  method: VddkSetupMode.CopyAppliance,
  onAioChange: jest.fn(),
  onMethodChange: jest.fn(),
  onVddkImageChange: jest.fn(),
  vddkImage: '',
};

describe('DiskTransferMethodSelection', () => {
  beforeEach(() => jest.clearAllMocks());

  it('shows sourcing appliance only when the feature is enabled', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<DiskTransferMethodSelection {...defaultProps} />);

    expect(screen.getByText('Configure the sourcing appliance in the next step.')).toBeVisible();
    expect(screen.getAllByText('Disk transfer method')).toHaveLength(1);
    expect(screen.getByRole('radiogroup', { name: 'Disk transfer method' })).toBeInTheDocument();
    expect(screen.queryByTestId('vddk-aio-optimization-checkbox')).not.toBeInTheDocument();
    await user.click(screen.getByTestId('disk-transfer-method-toggle'));
    expect(screen.getByRole('option', { name: 'Use a sourcing appliance' })).toBeInTheDocument();

    rerender(
      <DiskTransferMethodSelection
        {...defaultProps}
        isCopyApplianceEnabled={false}
        method={VddkSetupMode.Manual}
      />,
    );
    expect(
      screen.queryByRole('option', { name: 'Use a sourcing appliance' }),
    ).not.toBeInTheDocument();
  });

  it('keeps VDDK AIO available only for image methods', () => {
    const { rerender } = render(
      <DiskTransferMethodSelection {...defaultProps} method={VddkSetupMode.Manual} />,
    );
    expect(screen.getByTestId('vddk-aio-optimization-checkbox')).toBeVisible();

    rerender(<DiskTransferMethodSelection {...defaultProps} method={VddkSetupMode.Upload} />);
    expect(screen.getByTestId('vddk-aio-optimization-checkbox')).toBeVisible();

    rerender(<DiskTransferMethodSelection {...defaultProps} method={VddkSetupMode.Skip} />);
    expect(screen.queryByTestId('vddk-aio-optimization-checkbox')).not.toBeInTheDocument();
  });

  it('hides the next-step alert only when requested by the edit modal', () => {
    render(<DiskTransferMethodSelection {...defaultProps} showCopyApplianceAlert={false} />);

    expect(
      screen.queryByText('Configure the sourcing appliance in the next step.'),
    ).not.toBeInTheDocument();
    expect(screen.getAllByText('Disk transfer method')).toHaveLength(1);
  });
});
