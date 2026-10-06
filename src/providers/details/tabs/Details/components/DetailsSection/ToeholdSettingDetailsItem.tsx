import type { FC } from 'react';
import { DetailsItem } from 'src/components/DetailItems/DetailItem';

import { useOverlay } from '@openshift-console/dynamic-plugin-sdk';
import { Label } from '@patternfly/react-core';
import { PF_LABEL_STATUS } from '@utils/constants';
import {
  getCopyApplianceResourcePool,
  getToeholdDatastore,
  getToeholdFolder,
  getToeholdNetwork,
} from '@utils/crds/common/selectors';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import type { ProviderDetailsItemProps } from './utils/types';
import EditToeholdPlacement, { type EditToeholdPlacementProps } from './EditToeholdPlacement';
import type { ToeholdSettingField } from './onUpdateToeholdPlacement';

type ToeholdSettingDetailsItemProps = ProviderDetailsItemProps & {
  field: ToeholdSettingField;
};

const getters = {
  datastore: getToeholdDatastore,
  folder: getToeholdFolder,
  network: getToeholdNetwork,
  resourcePool: getCopyApplianceResourcePool,
} as const;

const crumbs: Record<ToeholdSettingField, string[]> = {
  datastore: ['Provider', 'spec', 'settings', 'toeholdDatastore'],
  folder: ['Provider', 'spec', 'settings', 'toeholdFolder'],
  network: ['Provider', 'spec', 'settings', 'toeholdNetwork'],
  resourcePool: ['Provider', 'spec', 'settings', 'copyApplianceResourcePool'],
};

const ToeholdSettingDetailsItem: FC<ToeholdSettingDetailsItemProps> = ({
  canPatch,
  field,
  resource: provider,
}) => {
  const { t } = useForkliftTranslation();
  const launchOverlay = useOverlay();
  const value = getters[field](provider);

  const labels: Record<ToeholdSettingField, { help: string; testId: string; title: string }> = {
    datastore: {
      help: t('Datastore used to store the toehold template disk.'),
      testId: 'toehold-datastore-detail-item',
      title: t('Datastore'),
    },
    folder: {
      help: t('Inventory folder path for the toehold template VM.'),
      testId: 'toehold-folder-detail-item',
      title: t('Folder'),
    },
    network: {
      help: t('Network attached to the toehold template VM.'),
      testId: 'toehold-network-detail-item',
      title: t('Network'),
    },
    resourcePool: {
      help: t('Resource pool for copy appliance clones.'),
      testId: 'toehold-resource-pool-detail-item',
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
        launchOverlay<EditToeholdPlacementProps>(EditToeholdPlacement, { field, provider });
      }}
      testId={testId}
      title={title}
    />
  );
};

export default ToeholdSettingDetailsItem;
