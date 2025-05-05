import type { FC } from 'react';
import { ModalHOC } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';
import type { ProviderData } from 'src/modules/Providers/utils/types/ProviderData';

import { DescriptionList } from '@patternfly/react-core';

import { SecretDetailsItem } from './SecretDetailsItem';

type SecretsSectionProps = {
  data: ProviderData;
};

const SecretsSection: FC<SecretsSectionProps> = ({ data }) => {
  const { provider } = data;

  return (
    <ModalHOC>
      <DescriptionList>
        <SecretDetailsItem resource={provider} />
      </DescriptionList>
    </ModalHOC>
  );
};

export default SecretsSection;
