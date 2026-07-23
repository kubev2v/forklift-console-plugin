import type { FC } from 'react';
import { DetailsItem } from 'src/components/DetailItems/DetailItem';
import { TypeDetailsItem } from 'src/providers/details/components/DetailsSection/components/TypeDetailsItem';
import { URLDetailsItem } from 'src/providers/details/components/DetailsSection/components/URLDetailsItem';
import { useForkliftTranslation } from 'src/utils/i18n';

import CreatedAtDetailsItem from '@components/DetailItems/CreatedAtDetailItem';
import NameDetailsItem from '@components/DetailItems/NameDetailItem';
import NamespaceDetailsItem from '@components/DetailItems/NamespaceDetailItem';
import OwnerDetailsItem from '@components/DetailItems/OwnerDetailItem';
import { DescriptionList, Label } from '@patternfly/react-core';

import type { DetailsSectionProps } from './utils/types';

const NutanixDetailsSection: FC<DetailsSectionProps> = ({ data }) => {
  const { t } = useForkliftTranslation();
  const { permissions, provider } = data;

  if (!provider || !permissions) return null;

  const prismType = provider?.spec?.settings?.prismType;
  const isCentral = prismType === 'central';

  return (
    <DescriptionList
      columnModifier={{
        default: '2Col',
      }}
    >
      <TypeDetailsItem resource={provider} />
      <NameDetailsItem resource={provider} />
      <NamespaceDetailsItem resource={provider} />
      <DetailsItem
        testId="prism-type-detail-item"
        title={t('Prism endpoint type')}
        content={
          <Label isCompact color={isCentral ? 'blue' : 'grey'}>
            {isCentral ? t('Prism Central') : t('Prism Element')}
          </Label>
        }
        helpContent={t(
          'Whether this provider connects to Prism Central (multi-cluster management) or directly to a Prism Element (single cluster).',
        )}
        crumbs={['Provider', 'spec', 'settings', 'prismType']}
      />
      <URLDetailsItem
        resource={provider}
        canPatch={permissions.canPatch}
        helpContent={t('URL of the Nutanix Prism endpoint.')}
      />
      <CreatedAtDetailsItem resource={provider} />
      <OwnerDetailsItem resource={provider} />
    </DescriptionList>
  );
};

export default NutanixDetailsSection;
