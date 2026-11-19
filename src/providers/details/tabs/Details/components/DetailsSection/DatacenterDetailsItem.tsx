import type { FC } from 'react';
import { DetailsItem } from 'src/components/DetailItems/DetailItem';
import { isVSphereEsxiProvider } from 'src/providers/utils/vsphere/datacenter';
import { getVSphereDatacenter } from 'src/utils/crds/common/selectors';
import { useForkliftTranslation } from 'src/utils/i18n';

import { useOverlay } from '@openshift-console/dynamic-plugin-sdk';
import { isEmpty } from '@utils/helpers';

import type { ProviderDetailsItemProps } from './utils/types';
import EditVsphereDatacenterModal, {
  type EditVsphereDatacenterModalProps,
} from './EditVsphereDatacenterModal';

const DatacenterDetailsItem: FC<ProviderDetailsItemProps> = ({
  canPatch,
  helpContent,
  resource: provider,
}) => {
  const { t } = useForkliftTranslation();
  const launchOverlay = useOverlay();

  if (isVSphereEsxiProvider(provider)) {
    return null;
  }

  const datacenter = getVSphereDatacenter(provider);

  return (
    <DetailsItem
      canEdit={canPatch}
      content={
        isEmpty(datacenter) ? (
          <span className="text-muted">{t('All datacenters')}</span>
        ) : (
          datacenter
        )
      }
      crumbs={['Provider', 'spec', 'settings', 'datacenter']}
      helpContent={
        helpContent ??
        t(
          'Restricts provider inventory to a single vCenter datacenter. Leave empty to use all datacenters.',
        )
      }
      onEdit={() => {
        launchOverlay<EditVsphereDatacenterModalProps>(EditVsphereDatacenterModal, {
          resource: provider,
        });
      }}
      testId="datacenter-detail-item"
      title={t('Datacenter')}
    />
  );
};

export default DatacenterDetailsItem;
