import React from 'react';

import type { V1beta1Provider } from '@kubev2v/types';

export const ProviderCardContent: React.FC<ProviderCardContentProps> = ({
  provider,
  typeLabel,
}) => {
  return (
    <ul className="forklift-create-card--list">
      <li>
        <strong>Name:</strong> {provider.metadata.name}
      </li>
      <li>
        <strong>Namespace:</strong> {provider.metadata.namespace}
      </li>
      {typeLabel && (
        <li>
          <strong>Type:</strong> {typeLabel}
        </li>
      )}
      <li>
        <strong>Phase:</strong> {provider.status.phase}
      </li>
    </ul>
  );
};

export type ProviderCardContentProps = {
  provider: V1beta1Provider;
  typeLabel?: string;
};
