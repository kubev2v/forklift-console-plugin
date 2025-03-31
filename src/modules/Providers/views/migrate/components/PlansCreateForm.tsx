import React, { type ReactNode } from 'react';
import { FilterableSelect } from 'src/components';
import { FormGroupWithHelpText } from 'src/components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import { HelpIconPopover } from 'src/components/common/HelpIconPopover/HelpIconPopover';
import SectionHeading from 'src/components/headers/SectionHeading';
import { ForkliftTrans, useForkliftTranslation } from 'src/utils/i18n';

import {
  NetworkMapModelGroupVersionKind,
  ProviderModelGroupVersionKind,
  StorageMapModelGroupVersionKind,
} from '@kubev2v/types';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import {
  AlertVariant,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  Form,
  FormSelect,
  FormSelectOption,
  Stack,
  StackItem,
} from '@patternfly/react-core';

import { DetailsItem, getIsTarget } from '../../../utils';
import {
  addNetworkMapping,
  addStorageMapping,
  deleteNetworkMapping,
  deleteStorageMapping,
  type PageAction,
  removeAlert,
  replaceNetworkMapping,
  replaceStorageMapping,
  setPlanTargetNamespace,
  setPlanTargetProvider,
} from '../reducer/actions';
import type { CreateVmMigrationPageState, NetworkAlerts, StorageAlerts } from '../types';

import { MappingList } from './MappingList';
import { MappingListHeader } from './MappingListHeader';
import { StateAlerts } from './StateAlerts';

const buildNetworkMessages = (
  t: (key: string) => string,
): Record<NetworkAlerts, { title: string; body: string; blocker?: boolean }> => ({
  MULTIPLE_NICS_MAPPED_TO_POD_NETWORKING: {
    blocker: true,
    body: t('VM(s) with more than one interface mapped to Pod Networking were detected.'),
    title: t('Multiple NICs mapped to Pod Networking '),
  },
  MULTIPLE_NICS_ON_THE_SAME_NETWORK: {
    body: t('VM(s) with multiple NICs on the same network were detected.'),
    title: t('Multiple NICs on the same network'),
  },
  NET_MAP_NAME_REGENERATED: {
    body: t('New name was generated for the Network Map due to naming conflict.'),
    title: t('Network Map name re-generated'),
  },
  NETWORK_MAPPING_EMPTY: {
    body: t(
      'Network mapping is empty, make sure no mappings are required for this migration plan.',
    ),
    title: t('Network mappings is empty'),
  },
  NETWORK_MAPPING_REGENERATED: {
    body: t('All discovered networks have been mapped to the default network.'),
    title: t('Network mappings have been re-generated'),
  },
  OVIRT_NICS_WITH_EMPTY_PROFILE: {
    blocker: true,
    body: t('VM(s) with NICs that are not linked with a NIC profile were detected.'),
    title: t('NICs with empty NIC profile'),
  },
  UNMAPPED_NETWORKS: {
    blocker: true,
    body: t('All networks detected on the selected VMs require a mapping.'),
    title: t('Incomplete mapping'),
  },
});
const buildStorageMessages = (
  t: (key: string) => string,
): Record<StorageAlerts, { title: string; body: string; blocker?: boolean }> => ({
  STORAGE_MAP_NAME_REGENERATED: {
    body: t('New name was generated for the Storage Map due to naming conflict.'),
    title: t('Storage Map name re-generated'),
  },
  STORAGE_MAPPING_EMPTY: {
    body: t(
      'Storage mapping is empty, make sure no mappings are required for this migration plan.',
    ),
    title: t('Storage mappings is empty'),
  },
  STORAGE_MAPPING_REGENERATED: {
    body: t('All discovered storages have been mapped to the default storage.'),
    title: t('Storage mappings have been re-generated'),
  },
  UNMAPPED_STORAGES: {
    blocker: true,
    body: t('All storages detected on the selected VMs require a mapping.'),
    title: t('Incomplete mapping'),
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
  dispatch,
  formActions,
  formAlerts,
  state,
}: PlansCreateFormProps) => {
  const { t } = useForkliftTranslation();

  const {
    alerts,
    calculatedOnce: { namespacesUsedBySelectedVms },
    calculatedPerNamespace: {
      networkMappings,
      sourceNetworks,
      sourceStorages,
      storageMappings,
      targetNetworks,
      targetStorages,
    },
    existingResources: {
      providers: availableProviders,
      targetNamespaces: availableTargetNamespaces,
    },
    flow,
    underConstruction: { netMap, plan, storageMap },
    validation,
  } = state;

  const networkMessages = buildNetworkMessages(t);
  const storageMessages = buildStorageMessages(t);

  const onChangeTargetProvider: (
    value: string,
    event: React.FormEvent<HTMLSelectElement>,
  ) => void = (value) => {
    dispatch(setPlanTargetProvider(value));
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
        <SectionHeading
          text={t('Source provider')}
          className="forklift--create-vm-migration-plan--section-header"
        />

        <DetailsItem
          title={t('Source provider')}
          content={
            <ResourceLink
              name={plan.spec.provider?.source?.name}
              namespace={plan.spec.provider?.source?.namespace}
              groupVersionKind={ProviderModelGroupVersionKind}
            />
          }
        />

        <SectionHeading
          text={t('Target provider')}
          className="forklift--create-vm-migration-plan--section-header"
        />

        <Form isWidthLimited>
          <FormGroupWithHelpText
            label={t('Target provider')}
            isRequired
            fieldId="targetProvider"
            validated={validation.targetProvider}
            helperTextInvalid={
              availableProviders.filter(getIsTarget).length === 0
                ? t('No provider is available')
                : t('The chosen provider is no longer available.')
            }
          >
            <FormSelect
              value={plan.spec.provider?.destination?.name}
              onChange={(e, v) => {
                onChangeTargetProvider(v, e);
              }}
              id="targetProvider"
              isDisabled={flow.editingDone}
            >
              {[
                <FormSelectOption
                  key="placeholder"
                  value={''}
                  label={t('Select a provider')}
                  isPlaceholder
                  isDisabled
                />,
                ...availableProviders
                  .filter(getIsTarget)
                  .map((provider, index) => (
                    <FormSelectOption
                      key={provider?.metadata?.name || index}
                      value={provider?.metadata?.name}
                      label={provider?.metadata?.name ?? provider?.metadata?.uid ?? String(index)}
                    />
                  )),
              ]}
            </FormSelect>
          </FormGroupWithHelpText>
        </Form>

        <Form isWidthLimited>
          <FormGroupWithHelpText
            label={t('Target namespace')}
            isRequired
            id="targetNamespace"
            validated={validation.targetNamespace}
            placeholder={t('Select a namespace')}
            labelIcon={
              <HelpIconPopover header={t('Target namespace')}>
                <Stack hasGutter>
                  <StackItem>
                    <ForkliftTrans>
                      Namespaces, also known as projects, separate resources within clusters.
                    </ForkliftTrans>
                  </StackItem>

                  <StackItem>
                    <ForkliftTrans>
                      The target namespace is the namespace within your selected target provider
                      that your virtual machines will be migrated to. This is different from the
                      namespace that your migration plan will be created in and where your provider
                      was created.
                    </ForkliftTrans>
                  </StackItem>
                </Stack>
              </HelpIconPopover>
            }
          >
            <FilterableSelect
              selectOptions={availableTargetNamespaces.map((ns) => ({
                children: ns?.name,
                isDisabled:
                  namespacesUsedBySelectedVms.includes(ns?.name) &&
                  plan.spec.provider?.destination?.name === plan.spec.provider.source.name,
                itemId: ns?.name,
              }))}
              value={plan.spec.targetNamespace}
              onSelect={(value) => {
                dispatch(setPlanTargetNamespace(value as string));
              }}
              isDisabled={flow.editingDone}
              isScrollable
              canCreate
              createNewOptionLabel={t('Create new namespace:')}
            />
          </FormGroupWithHelpText>
        </Form>

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
              onClose={(key) => {
                dispatch(removeAlert(key as NetworkAlerts));
              }}
            />
            <StateAlerts
              variant={AlertVariant.warning}
              messages={Array.from(alerts.networkMappings.warnings).map((key) => ({
                key,
                ...networkMessages[key],
              }))}
              onClose={(key) => {
                dispatch(removeAlert(key as NetworkAlerts));
              }}
            />
            <MappingList
              addMapping={() => {
                dispatch(addNetworkMapping());
              }}
              replaceMapping={({ current, next }) => {
                dispatch(replaceNetworkMapping({ current, next }));
              }}
              deleteMapping={(current) => {
                dispatch(deleteNetworkMapping({ ...current }));
              }}
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
              onClose={(key) => {
                dispatch(removeAlert(key as StorageAlerts));
              }}
            />
            <StateAlerts
              variant={AlertVariant.warning}
              messages={Array.from(alerts.storageMappings.warnings).map((key) => ({
                key,
                ...storageMessages[key],
              }))}
              onClose={(key) => {
                dispatch(removeAlert(key as StorageAlerts));
              }}
            />
            <MappingList
              addMapping={() => {
                dispatch(addStorageMapping());
              }}
              replaceMapping={({ current, next }) => {
                dispatch(replaceStorageMapping({ current, next }));
              }}
              deleteMapping={(current) => {
                dispatch(deleteStorageMapping({ ...current }));
              }}
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
