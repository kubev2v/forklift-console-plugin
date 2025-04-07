import type { FC } from 'react';
import type { ProviderData } from 'src/modules/Providers/utils/types/ProviderData';

import { DescriptionList } from '@patternfly/react-core';

import { SecretDetailsItem } from './components/SecretDetailsItem';

export const SecretsSection: FC<SecretsSectionProps> = (props) => {
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

type SecretsSectionProps = {
  data: ProviderData;
};
