import React from 'react';
import type { ProviderData } from 'src/modules/Providers/utils';

import { DescriptionList } from '@patternfly/react-core';

import { SecretDetailsItem } from './components';

export const SecretsSection: React.FC<SecretsSectionProps> = (props) => {
  const { provider } = props.data;

  return (
    <DescriptionList
      isHorizontal
      columnModifier={{
        default: '2Col',
      }}
    >
      <SecretDetailsItem resource={provider} />
    </DescriptionList>
  );
};

export type SecretsSectionProps = {
  data: ProviderData;
};
