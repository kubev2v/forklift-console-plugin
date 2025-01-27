import React, { ReactNode } from 'react';
import SectionHeading from 'src/components/headers/SectionHeading';
import { useForkliftTranslation } from 'src/utils/i18n';

import { NetworkMapModelGroupVersionKind, StorageMapModelGroupVersionKind } from '@kubev2v/types';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import {
  AlertVariant,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
} from '@patternfly/react-core';

import {
  addNetworkMapping,
  addStorageMapping,
  deleteNetworkMapping,
  deleteStorageMapping,
  PageAction,
  removeAlert,
  replaceNetworkMapping,
  replaceStorageMapping,
  setPlanTargetNamespace,
  setPlanTargetProvider,
} from '../reducer/actions';
import { CreateVmMigrationPageState, NetworkAlerts, StorageAlerts } from '../types';

import { MappingList } from './MappingList';
import { MappingListHeader } from './MappingListHeader';
import { PlansProvidersFields } from './PlansProvidersFields';
import { PlansTargetNamespaceField } from './PlansTargetNamespaceField';
import { StateAlerts } from './StateAlerts';

const buildNetworkMessages = (
  t: (key: string) => string,
): { [key in NetworkAlerts]: { title: string; body: string; blocker?: boolean } } => ({
  NET_MAP_NAME_REGENERATED: {
    title: t('Network Map name re-generated'),
    body: t('New name was generated for the Network Map due to naming conflict.'),
  },
  NETWORK_MAPPING_REGENERATED: {
    title: t('Network mappings have been re-generated'),
    body: t('All discovered networks have been mapped to the default network.'),
  },
  NETWORK_MAPPING_EMPTY: {
    title: t('Network mappings is empty'),
    body: t(
      'Network mapping is empty, make sure no mappings are required for this migration plan.',
    ),
  },
  MULTIPLE_NICS_ON_THE_SAME_NETWORK: {
    title: t('Multiple NICs on the same network'),
    body: t('VM(s) with multiple NICs on the same network were detected.'),
  },
  OVIRT_NICS_WITH_EMPTY_PROFILE: {
    title: t('NICs with empty NIC profile'),
    body: t('VM(s) with NICs that are not linked with a NIC profile were detected.'),
    blocker: true,
  },
  UNMAPPED_NETWORKS: {
    title: t('Incomplete mapping'),
    body: t('All networks detected on the selected VMs require a mapping.'),
    blocker: true,
  },
  MULTIPLE_NICS_MAPPED_TO_POD_NETWORKING: {
    title: t('Multiple NICs mapped to Pod Networking '),
    body: t('VM(s) with more than one interface mapped to Pod Networking were detected.'),
    blocker: true,
  },
});
const buildStorageMessages = (
  t: (key: string) => string,
): { [key in StorageAlerts]: { title: string; body: string; blocker?: boolean } } => ({
  STORAGE_MAPPING_REGENERATED: {
    title: t('Storage mappings have been re-generated'),
    body: t('All discovered storages have been mapped to the default storage.'),
  },
  STORAGE_MAP_NAME_REGENERATED: {
    title: t('Storage Map name re-generated'),
    body: t('New name was generated for the Storage Map due to naming conflict.'),
  },
  UNMAPPED_STORAGES: {
    title: t('Incomplete mapping'),
    body: t('All storages detected on the selected VMs require a mapping.'),
    blocker: true,
  },
  STORAGE_MAPPING_EMPTY: {
    title: t('Storage mappings is empty'),
    body: t(
      'Storage mapping is empty, make sure no mappings are required for this migration plan.',
    ),
  },
});

export type PlansCreateFormProps = {
  children?: ReactNode;
  formAlerts?: ReactNode;
  formActions?: ReactNode;
  state: CreateVmMigrationPageState;
  dispatch: (action: PageAction<unknown, unknown>) => void;
};

export const PlansCreateForm = ({
  children,
  state,
  dispatch,
  formAlerts,
  formActions,
}: PlansCreateFormProps) => {
  const { t } = useForkliftTranslation();

  const {
    underConstruction: { netMap, storageMap },
    calculatedPerNamespace: {
      targetNetworks,
      targetStorages,
      sourceNetworks,
      sourceStorages,
      networkMappings,
      storageMappings,
    },
    flow,
    alerts,
  } = state;

  const networkMessages = buildNetworkMessages(t);
  const storageMessages = buildStorageMessages(t);

  const onChangeTargetProvider: (
    value: string,
    event: React.FormEvent<HTMLSelectElement>,
  ) => void = (value) => {
    dispatch(setPlanTargetProvider(value));
  };

  const onChangeTargetNamespace: (value: string) => void = (value) => {
    dispatch(setPlanTargetNamespace(value));
  };

  return (
    <>
      {children}
      <DescriptionList
        className="forklift-create-provider-edit-section"
        columnModifier={{
          default: '1Col',
        }}
      >
        <PlansProvidersFields onChangeTargetProvider={onChangeTargetProvider} state={state} />

        <PlansTargetNamespaceField
          onChangeTargetNamespace={onChangeTargetNamespace}
          state={state}
        />

        <SectionHeading
          text={t('Network mappings')}
          className="forklift--create-vm-migration-plan--section-header"
        >
          <ResourceLink
            groupVersionKind={NetworkMapModelGroupVersionKind}
            namespace={netMap.metadata?.namespace}
            name={netMap.metadata?.name}
            className="forklift-page-resource-link-in-description-item"
            linkTo={false}
          />
        </SectionHeading>

        <DescriptionListGroup>
          <MappingListHeader
            sourceHeading={t('Source network')}
            destinationHeading={t('Target network')}
          />
          <DescriptionListDescription className="forklift-page-mapping-list">
            <StateAlerts
              variant={AlertVariant.danger}
              messages={Array.from(alerts.networkMappings.errors).map((key) => ({
                key,
                ...networkMessages[key],
              }))}
              onClose={(key) => dispatch(removeAlert(key as NetworkAlerts))}
            />
            <StateAlerts
              variant={AlertVariant.warning}
              messages={Array.from(alerts.networkMappings.warnings).map((key) => ({
                key,
                ...networkMessages[key],
              }))}
              onClose={(key) => dispatch(removeAlert(key as NetworkAlerts))}
            />
            <MappingList
              addMapping={() => dispatch(addNetworkMapping())}
              replaceMapping={({ current, next }) =>
                dispatch(replaceNetworkMapping({ current, next }))
              }
              deleteMapping={(current) => dispatch(deleteNetworkMapping({ ...current }))}
              availableDestinations={targetNetworks}
              sources={sourceNetworks}
              mappings={networkMappings}
              generalSourcesLabel={t('Other networks present on the source provider ')}
              usedSourcesLabel={t('Networks used by the selected VMs')}
              noSourcesLabel={t('No networks in this category')}
              isDisabled={flow.editingDone}
            />
          </DescriptionListDescription>
        </DescriptionListGroup>

        <SectionHeading
          text={t('Storage mappings')}
          className="forklift--create-vm-migration-plan--section-header"
        >
          <ResourceLink
            groupVersionKind={StorageMapModelGroupVersionKind}
            namespace={storageMap.metadata?.namespace}
            name={storageMap.metadata?.name}
            className="forklift-page-resource-link-in-description-item"
            linkTo={false}
          />
        </SectionHeading>

        <DescriptionListGroup>
          <MappingListHeader
            sourceHeading={t('Source storage')}
            destinationHeading={t('Target storage')}
          />
          <DescriptionListDescription className="forklift-page-mapping-list">
            <StateAlerts
              variant={AlertVariant.danger}
              messages={Array.from(alerts.storageMappings.errors).map((key) => ({
                key,
                ...storageMessages[key],
              }))}
              onClose={(key) => dispatch(removeAlert(key as StorageAlerts))}
            />
            <StateAlerts
              variant={AlertVariant.warning}
              messages={Array.from(alerts.storageMappings.warnings).map((key) => ({
                key,
                ...storageMessages[key],
              }))}
              onClose={(key) => dispatch(removeAlert(key as StorageAlerts))}
            />
            <MappingList
              addMapping={() => dispatch(addStorageMapping())}
              replaceMapping={({ current, next }) =>
                dispatch(replaceStorageMapping({ current, next }))
              }
              deleteMapping={(current) => dispatch(deleteStorageMapping({ ...current }))}
              availableDestinations={targetStorages}
              sources={sourceStorages}
              mappings={storageMappings}
              generalSourcesLabel={t('Other storages present on the source provider ')}
              usedSourcesLabel={t('Storages used by the selected VMs')}
              noSourcesLabel={t('No storages in this category')}
              isDisabled={flow.editingDone}
            />
          </DescriptionListDescription>
        </DescriptionListGroup>
      </DescriptionList>
      {formAlerts}
      <div className="forklift--create-vm-migration-plan--form-actions">{formActions}</div>
    </>
  );
};
