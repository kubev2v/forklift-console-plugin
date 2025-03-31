import React from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import { DescriptionList } from '@patternfly/react-core';

import { DetailsItem } from '../../../../utils';

import {
  CreatedAtDetailsItem,
  NameDetailsItem,
  NamespaceDetailsItem,
  OwnerDetailsItem,
  TypeDetailsItem,
  URLDetailsItem,
} from './components';
import type { DetailsSectionProps } from './DetailsSection';

export const OVADetailsSection: React.FC<DetailsSectionProps> = ({ data }) => {
  const { t } = useForkliftTranslation();

  const { provider } = data;

  return (
    <DescriptionList
      columnModifier={{
        default: '2Col',
      }}
    >
      <TypeDetailsItem resource={provider} />

      <DetailsItem title={''} content={''} />

      <NameDetailsItem resource={provider} />

      <NamespaceDetailsItem resource={provider} />

      <CreatedAtDetailsItem resource={provider} />

      <URLDetailsItem
        resource={provider}
        canPatch={false}
        helpContent={t(
          `URL of the NFS file share that serves the OVA., for example, 10.10.0.10:/ova`,
        )}
      />

      <OwnerDetailsItem resource={provider} />
    </DescriptionList>
  );
};
