import { describe, expect, it } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import LUKSSecretSelect from '../LUKSSecretSelect';

const mockUseK8sWatchResource = jest.fn();
jest.mock('@utils/hooks/useK8sWatchResource', () => ({
  useK8sWatchResource: jest.fn((...args: unknown[]) => mockUseK8sWatchResource(...args)),
}));

const onSelect = jest.fn();

describe('LUKSSecretSelect', () => {
  it('renders placeholder when Opaque secrets exist', () => {
    mockUseK8sWatchResource.mockReturnValue([
      [
        { metadata: { name: 'opaque-secret' }, type: 'Opaque' },
        { metadata: { name: 'tls-secret' }, type: 'kubernetes.io/tls' },
      ],
      true,
      null,
    ]);

    render(<LUKSSecretSelect id="test" namespace="test-ns" onSelect={onSelect} value="" />);

    expect(screen.getByPlaceholderText('Select a secret')).toBeInTheDocument();
  });

  it('includes secrets with missing type (K8s default Opaque) in options', async () => {
    const user = userEvent.setup();
    mockUseK8sWatchResource.mockReturnValue([
      [{ metadata: { name: 'default-type-secret' } }],
      true,
      null,
    ]);

    render(<LUKSSecretSelect id="test" namespace="test-ns" onSelect={onSelect} value="" />);

    await user.click(screen.getByRole('combobox'));

    expect(screen.getByRole('option', { name: 'default-type-secret' })).toBeInTheDocument();
  });

  it('renders no-options message when no Opaque secrets exist', () => {
    mockUseK8sWatchResource.mockReturnValue([
      [{ metadata: { name: 'tls-secret' }, type: 'kubernetes.io/tls' }],
      true,
      null,
    ]);

    render(<LUKSSecretSelect id="test" namespace="test-ns" onSelect={onSelect} value="" />);

    expect(screen.getByPlaceholderText('Select a secret')).toBeInTheDocument();
  });

  it('renders no-options message when secrets list is empty', () => {
    mockUseK8sWatchResource.mockReturnValue([[], true, null]);

    render(<LUKSSecretSelect id="test" namespace="test-ns" onSelect={onSelect} value="" />);

    expect(screen.getByPlaceholderText('Select a secret')).toBeInTheDocument();
  });

  it('displays selected value', () => {
    mockUseK8sWatchResource.mockReturnValue([
      [{ metadata: { name: 'my-secret' }, type: 'Opaque' }],
      true,
      null,
    ]);

    render(
      <LUKSSecretSelect id="test" namespace="test-ns" onSelect={onSelect} value="my-secret" />,
    );

    expect(screen.getByDisplayValue('my-secret')).toBeInTheDocument();
  });
});
