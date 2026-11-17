import type { FC } from 'react';
import { TypeDetailsItem } from 'src/providers/details/components/DetailsSection/components/TypeDetailsItem';
import { useForkliftTranslation } from 'src/utils/i18n';

import CreatedAtDetailsItem from '@components/DetailItems/CreatedAtDetailItem';
import { DetailsItem } from '@components/DetailItems/DetailItem';
import NameDetailsItem from '@components/DetailItems/NameDetailItem';
import NamespaceDetailsItem from '@components/DetailItems/NamespaceDetailItem';
import OwnerDetailsItem from '@components/DetailItems/OwnerDetailItem';
import { DescriptionList } from '@patternfly/react-core';

import type { DetailsSectionProps } from './utils/types';

const AzureDetailsSection: FC<DetailsSectionProps> = ({ data }) => {
  const { t } = useForkliftTranslation();
  const { permissions, provider } = data;

  if (!provider || !permissions) {
    return null;
  }

  const settings = provider.spec?.settings ?? {};

  return (
    <DescriptionList
      columnModifier={{
        default: '2Col',
      }}
    >
      <TypeDetailsItem resource={provider} />
      <NameDetailsItem resource={provider} />
      <NamespaceDetailsItem resource={provider} />
      {settings.snapshotResourceGroup && (
        <DetailsItem
          content={settings.snapshotResourceGroup}
          title={t('Snapshot resource group')}
        />
      )}
      {settings.snapshotSku && (
        <DetailsItem content={settings.snapshotSku} title={t('Snapshot SKU')} />
      )}
      {settings.targetRegion && (
        <DetailsItem content={settings.targetRegion} title={t('Target region')} />
      )}
      {settings.volumeSnapshotClassName && (
        <DetailsItem
          content={settings.volumeSnapshotClassName}
          title={t('VolumeSnapshotClass name')}
        />
      )}
      <CreatedAtDetailsItem resource={provider} />
      <OwnerDetailsItem resource={provider} />
    </DescriptionList>
  );
};

export default AzureDetailsSection;
