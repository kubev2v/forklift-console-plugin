import type { FC } from 'react';
import { storageMapFieldLabels } from 'src/storageMaps/utils/constants';
import { getPluginLabel, getVendorProductLabel } from 'src/storageMaps/utils/labelHelpers';
import { OffloadPlugin } from 'src/storageMaps/utils/types';

import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { Td, Tr } from '@patternfly/react-table';
import { EMPTY_MSG } from '@utils/constants';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';
import type { StorageMapping } from '@utils/storage/types';

import { CreatePlanStorageMapFieldId } from '../storage-map/constants';

type OffloadDetailsRowProps = {
  index: number;
  mapping: StorageMapping;
};

const OffloadDetailsRow: FC<OffloadDetailsRowProps> = ({ index, mapping }) => {
  const { t } = useForkliftTranslation();
  const dedicatedHosts = mapping[CreatePlanStorageMapFieldId.DedicatedMigrationHosts];
  const offloadPlugin = mapping[CreatePlanStorageMapFieldId.OffloadPlugin];
  const showDedicatedHosts = offloadPlugin === OffloadPlugin.VSphereXcopyConfig;

  return (
    <Tr isExpanded>
      <Td />
      <Td colSpan={3} data-testid={`review-offload-details-${index}`}>
        <Stack className="pf-v6-u-pt-md pf-v6-u-pb-md" hasGutter>
          <StackItem>
            <DescriptionList isCompact isHorizontal>
              <DescriptionListGroup>
                <DescriptionListTerm>
                  {storageMapFieldLabels[CreatePlanStorageMapFieldId.OffloadPlugin]}
                </DescriptionListTerm>
                <DescriptionListDescription data-testid={`review-offload-plugin-${index}`}>
                  {offloadPlugin ? getPluginLabel(offloadPlugin) : EMPTY_MSG}
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>
                  {storageMapFieldLabels[CreatePlanStorageMapFieldId.StorageSecret]}
                </DescriptionListTerm>
                <DescriptionListDescription data-testid={`review-storage-secret-${index}`}>
                  {mapping[CreatePlanStorageMapFieldId.StorageSecret] ?? EMPTY_MSG}
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>
                  {storageMapFieldLabels[CreatePlanStorageMapFieldId.StorageProduct]}
                </DescriptionListTerm>
                <DescriptionListDescription data-testid={`review-storage-product-${index}`}>
                  {mapping[CreatePlanStorageMapFieldId.StorageProduct]
                    ? getVendorProductLabel(
                        mapping[CreatePlanStorageMapFieldId.StorageProduct] ?? '',
                      )
                    : EMPTY_MSG}
                </DescriptionListDescription>
              </DescriptionListGroup>
              {showDedicatedHosts && (
                <DescriptionListGroup>
                  <DescriptionListTerm>
                    {storageMapFieldLabels[CreatePlanStorageMapFieldId.DedicatedMigrationHosts]}
                  </DescriptionListTerm>
                  <DescriptionListDescription
                    data-testid={`review-dedicated-migration-hosts-${index}`}
                  >
                    {isEmpty(dedicatedHosts) ? t('All hosts') : (dedicatedHosts ?? []).join(', ')}
                  </DescriptionListDescription>
                </DescriptionListGroup>
              )}
            </DescriptionList>
          </StackItem>
        </Stack>
      </Td>
    </Tr>
  );
};

export default OffloadDetailsRow;
