import type { FC } from 'react';

import { render, screen } from '@testing-library/react';

import { useVddkBuildImage } from '../useVddkBuildImage';

jest.mock('@openshift-console/dynamic-plugin-sdk', (): object => ({
  useActiveNamespace: (): string[] => ['ns'],
}));
jest.mock('@utils/hooks/useK8sWatchResource', (): object => ({
  useK8sWatchResource: (): object[] => [{ metadata: { name: 'previous-build' }, status: {} }],
}));
jest.mock('../../utils/utils', (): object => ({
  getVddkImageBuildResponse: (): object => ({ body: 'previous-image', isBuildSucceeded: true }),
}));

const BuildStatus: FC<{ buildName: string }> = ({ buildName }) => {
  const result = useVddkBuildImage(buildName);
  return <span>{result?.body ?? 'No completed image'}</span>;
};

describe('useVddkBuildImage', () => {
  it('ignores a successful result from the previous archive build', () => {
    const { rerender } = render(<BuildStatus buildName="previous-build" />);
    expect(screen.getByText('previous-image')).toBeInTheDocument();

    rerender(<BuildStatus buildName="new-build" />);
    expect(screen.getByText('No completed image')).toBeInTheDocument();
  });
});
