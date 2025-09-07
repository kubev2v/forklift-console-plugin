import type { FC } from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import {
  NetworkMapModelGroupVersionKind,
  StorageMapModelGroupVersionKind,
  type V1beta1Plan,
} from '@kubev2v/types';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Split,
  SplitItem,
} from '@patternfly/react-core';
import {
  getPlanNetworkMapName,
  getPlanNetworkMapNamespace,
  getPlanStorageMapName,
  getPlanStorageMapNamespace,
} from '@utils/crds/plans/selectors';

import type { Mapping } from '../utils/types';

import MappingList from './MappingList';

type PlanMappingsViewModeProps = {
  plan: V1beta1Plan;
  labeledNetworkMappings: Mapping[];
  labeledStorageMappings: Mapping[];
};
const PlanMappingsViewMode: FC<PlanMappingsViewModeProps> = ({
  labeledNetworkMappings,
  labeledStorageMappings,
  plan,
}) => {
  const { t } = useForkliftTranslation();

  return (
    <>
      <DescriptionList columnModifier={{ default: '1Col' }}>
        <DescriptionListGroup data-testid="network-mappings-section">
          <DescriptionListTerm>
            <Split hasGutter>
              <SplitItem>{t('Network map:')}</SplitItem>
              <SplitItem>
                <ResourceLink
                  groupVersionKind={NetworkMapModelGroupVersionKind}
                  name={getPlanNetworkMapName(plan)}
                  namespace={getPlanNetworkMapNamespace(plan)}
                  inline
                />
              </SplitItem>
            </Split>
          </DescriptionListTerm>
          <DescriptionListDescription>
            <MappingList
              mappings={labeledNetworkMappings}
              generalSourcesLabel={t('Other networks present on the source provider ')}
              noSourcesLabel={t('No networks in this category')}
              isEditable={false}
              testId="network-mappings-list"
            />
          </DescriptionListDescription>
        </DescriptionListGroup>
        <DescriptionListGroup data-testid="storage-mappings-section">
          <DescriptionListTerm>
            <Split hasGutter>
              <SplitItem>{t('Storage map:')}</SplitItem>
              <SplitItem>
                <ResourceLink
                  groupVersionKind={StorageMapModelGroupVersionKind}
                  name={getPlanStorageMapName(plan)}
                  namespace={getPlanStorageMapNamespace(plan)}
                  inline
                />
              </SplitItem>
            </Split>
          </DescriptionListTerm>
          <DescriptionListDescription>
            <MappingList
              mappings={labeledStorageMappings}
              generalSourcesLabel={t('Other storages present on the source provider ')}
              noSourcesLabel={t('No storages in this category')}
              isEditable={false}
              testId="storage-mappings-list"
            />
          </DescriptionListDescription>
        </DescriptionListGroup>
      </DescriptionList>
    </>
  );
};

export default PlanMappingsViewMode;
