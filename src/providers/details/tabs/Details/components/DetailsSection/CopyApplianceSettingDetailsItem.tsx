import type { FC } from 'react';
import { DetailsItem } from 'src/components/DetailItems/DetailItem';

import { useOverlay } from '@openshift-console/dynamic-plugin-sdk';
import { Label } from '@patternfly/react-core';
import { PF_LABEL_STATUS } from '@utils/constants';
import {
  getCopyApplianceDatastore,
  getCopyApplianceFolder,
  getCopyApplianceNetwork,
  getCopyApplianceResourcePool,
} from '@utils/crds/common/selectors';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import type { ProviderDetailsItemProps } from './utils/types';
import EditCopyAppliancePlacement, {
  type EditCopyAppliancePlacementProps,
} from './EditCopyAppliancePlacement';
import type { CopyApplianceSettingField } from './onUpdateCopyAppliancePlacement';

type CopyApplianceSettingDetailsItemProps = ProviderDetailsItemProps & {
  field: CopyApplianceSettingField;
};

const getters = {
  datastore: getCopyApplianceDatastore,
  folder: getCopyApplianceFolder,
  network: getCopyApplianceNetwork,
  resourcePool: getCopyApplianceResourcePool,
} as const;

const crumbs: Record<CopyApplianceSettingField, string[]> = {
  datastore: ['Provider', 'spec', 'settings', 'copyApplianceDatastore'],
  folder: ['Provider', 'spec', 'settings', 'copyApplianceFolder'],
  network: ['Provider', 'spec', 'settings', 'copyApplianceNetwork'],
  resourcePool: ['Provider', 'spec', 'settings', 'copyApplianceResourcePool'],
};

const CopyApplianceSettingDetailsItem: FC<CopyApplianceSettingDetailsItemProps> = ({
  canPatch,
  field,
  resource: provider,
}) => {
  const { t } = useForkliftTranslation();
  const launchOverlay = useOverlay();
  const value = getters[field](provider);

  const labels: Record<CopyApplianceSettingField, { help: string; testId: string; title: string }> =
    {
      datastore: {
        help: t('Datastore used to store the copy appliance template disk.'),
        testId: 'copy-appliance-datastore-detail-item',
        title: t('Datastore'),
      },
      folder: {
        help: t('Inventory folder path for the copy appliance template VM.'),
        testId: 'copy-appliance-folder-detail-item',
        title: t('Folder'),
      },
      network: {
        help: t('Network attached to the copy appliance template VM.'),
        testId: 'copy-appliance-network-detail-item',
        title: t('Network'),
      },
      resourcePool: {
        help: t('Resource pool for copy appliance clones.'),
        testId: 'copy-appliance-resource-pool-detail-item',
        title: t('Resource pool'),
      },
    };

  const { help, testId, title } = labels[field];

  return (
    <DetailsItem
      canEdit={canPatch}
      content={
        isEmpty(value) ? (
          <Label isCompact status={PF_LABEL_STATUS.WARNING}>
            {t('Empty')}
          </Label>
        ) : (
          value
        )
      }
      crumbs={crumbs[field]}
      helpContent={help}
      onEdit={() => {
        launchOverlay<EditCopyAppliancePlacementProps>(EditCopyAppliancePlacement, {
          field,
          provider,
        });
      }}
      testId={testId}
      title={title}
    />
  );
};

export default CopyApplianceSettingDetailsItem;
