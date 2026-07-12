import type { FC } from 'react';
import { DetailsItem } from 'src/components/DetailItems/DetailItem';
import { TypeDetailsItem } from 'src/providers/details/components/DetailsSection/components/TypeDetailsItem';
import { URLDetailsItem } from 'src/providers/details/components/DetailsSection/components/URLDetailsItem';
import { isHypervClusterProvider } from 'src/providers/utils/helpers/isHypervClusterProvider';
import { isHypervIscsiProvider } from 'src/providers/utils/helpers/isHypervIscsiProvider';
import { useForkliftTranslation } from 'src/utils/i18n';

import CreatedAtDetailsItem from '@components/DetailItems/CreatedAtDetailItem';
import NameDetailsItem from '@components/DetailItems/NameDetailItem';
import NamespaceDetailsItem from '@components/DetailItems/NamespaceDetailItem';
import OwnerDetailsItem from '@components/DetailItems/OwnerDetailItem';
import { DescriptionList, Label } from '@patternfly/react-core';

import type { DetailsSectionProps } from './utils/types';

const HyperVDetailsSection: FC<DetailsSectionProps> = ({ data }) => {
  const { t } = useForkliftTranslation();
  const { permissions, provider } = data;

  if (!provider || !permissions) return null;

  const isIscsi = isHypervIscsiProvider(provider);
  const isCluster = isHypervClusterProvider(provider);

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
        testId="management-type-detail-item"
        title={t('Management type')}
        content={
          <Label isCompact color={isCluster ? 'blue' : 'grey'}>
            {isCluster ? t('Failover Cluster') : t('Standalone')}
          </Label>
        }
        helpContent={t(
          'Whether this provider manages a single Hyper-V host or a Windows Failover Cluster with multiple nodes.',
        )}
        crumbs={['Provider', 'spec', 'settings', 'managementType']}
      />
      <DetailsItem
        testId="transfer-method-detail-item"
        title={t('Transfer method')}
        content={
          <Label isCompact color={isIscsi ? 'blue' : 'grey'}>
            {isIscsi ? t('iSCSI') : t('SMB')}
          </Label>
        }
        helpContent={t(
          'The method used to transfer VM disk data from the Hyper-V host. SMB uses an SMB file share. iSCSI copies disks directly over iSCSI and is typically faster.',
        )}
        crumbs={['Provider', 'spec', 'settings', 'hyperVTransferMethod']}
      />
      <URLDetailsItem
        resource={provider}
        canPatch={permissions.canPatch}
        helpContent={
          isCluster
            ? t('IP address or hostname of the cluster entry point (CNO or node)')
            : t('IP address or hostname of the Hyper-V server')
        }
      />
      <CreatedAtDetailsItem resource={provider} />
      <OwnerDetailsItem resource={provider} />
    </DescriptionList>
  );
};

export default HyperVDetailsSection;
