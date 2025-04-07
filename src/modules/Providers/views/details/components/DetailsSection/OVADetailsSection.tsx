import type { FC } from 'react';
import { DetailsItem } from 'src/modules/Providers/utils/components/DetailsPage/DetailItem';
import { useForkliftTranslation } from 'src/utils/i18n';

import { DescriptionList } from '@patternfly/react-core';

import { CreatedAtDetailsItem } from './components/CreatedAtDetailsItem';
import { NameDetailsItem } from './components/NamDetailsItem';
import { NamespaceDetailsItem } from './components/NamespaceDetailsItem';
import { OwnerDetailsItem } from './components/OwnerDetailsItem';
import { TypeDetailsItem } from './components/TypeDetailsItem';
import { URLDetailsItem } from './components/URLDetailsItem';
import type { DetailsSectionProps } from './DetailsSection';

export const OVADetailsSection: FC<DetailsSectionProps> = ({ data }) => {
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
