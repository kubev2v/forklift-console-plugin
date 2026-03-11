import { describe, expect, it } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import LightspeedMcpWarning from '../LightspeedMcpWarning';

describe('LightspeedMcpWarning', () => {
  it('renders a warning alert with the expected message and link', () => {
    render(<LightspeedMcpWarning />);

    expect(screen.getByText('AI assistant not connected to Lightspeed')).toBeInTheDocument();
    expect(
      screen.getByText(
        'OpenShift Lightspeed was installed after the Migration Toolkit for Virtualization. Reinstall or update the MTV operator to connect the AI assistant to Lightspeed.',
      ),
    ).toBeInTheDocument();

    const link = screen.getByRole('link', { name: 'Go to Installed Operators' });

    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute(
      'href',
      '/k8s/ns/openshift-mtv/operators.coreos.com~v1alpha1~ClusterServiceVersion',
    );
  });
});
