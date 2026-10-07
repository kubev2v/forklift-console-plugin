import type { FC } from 'react';
import { DetailsItem } from 'src/components/DetailItems/DetailItem';

import { useOverlay } from '@openshift-console/dynamic-plugin-sdk';
import { isEmpty } from '@utils/helpers';

import type { ProviderDetailsItemProps } from './utils/types';
import {
  COPY_APPLIANCE_SETTING_CRUMBS,
  COPY_APPLIANCE_SETTING_GETTERS,
  type CopyApplianceSettingField,
} from './copyAppliancePlacementConfig';
import EditCopyAppliancePlacement from './EditCopyAppliancePlacement';
import { useCopyAppliancePlacementLabels } from './useCopyAppliancePlacementLabels';

type CopyApplianceSettingDetailsItemProps = ProviderDetailsItemProps & {
  field: CopyApplianceSettingField;
};

const CopyApplianceSettingDetailsItem: FC<CopyApplianceSettingDetailsItemProps> = ({
  canPatch,
  field,
  resource: provider,
}) => {
  const launchOverlay = useOverlay();
  const labels = useCopyAppliancePlacementLabels();
  const value = COPY_APPLIANCE_SETTING_GETTERS[field](provider);
  const testIds: Record<CopyApplianceSettingField, string> = {
    datastore: 'copy-appliance-datastore-detail-item',
    folder: 'copy-appliance-folder-detail-item',
    network: 'copy-appliance-network-detail-item',
    resourcePool: 'copy-appliance-resource-pool-detail-item',
  };

  return (
    <DetailsItem
      canEdit={canPatch}
      content={isEmpty(value) ? <span className="text-muted">-</span> : value}
      crumbs={COPY_APPLIANCE_SETTING_CRUMBS[field]}
      helpContent={labels[field].help}
      onEdit={() => {
        launchOverlay(EditCopyAppliancePlacement, {
          field,
          provider,
        });
      }}
      testId={testIds[field]}
      title={labels[field].label}
    />
  );
};

export default CopyApplianceSettingDetailsItem;
