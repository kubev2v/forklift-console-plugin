import React, { ReactNode, useState } from 'react';
import { FilterableSelect } from 'src/components';
import SectionHeading from 'src/components/headers/SectionHeading';
import { ForkliftTrans, useForkliftTranslation } from 'src/utils/i18n';

import { FormGroupWithHelpText, HelpIconPopover } from '@kubev2v/common';
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
  DescriptionListTerm,
  Form,
  FormSelect,
  FormSelectOption,
  Stack,
  StackItem,
  TextInput,
} from '@patternfly/react-core';

import { DetailsItem, getIsTarget } from '../../../utils';
import {
  addNetworkMapping,
  addStorageMapping,
  deleteNetworkMapping,
  deleteStorageMapping,
  PageAction,
  removeAlert,
  replaceNetworkMapping,
  replaceStorageMapping,
  setPlanName,
  setPlanTargetNamespace,
  setPlanTargetProvider,
} from '../reducer/actions';
import { CreateVmMigrationPageState, NetworkAlerts, StorageAlerts } from '../types';

import { EditableDescriptionItem } from './EditableDescriptionItem';
import { MappingList } from './MappingList';
import { MappingListHeader } from './MappingListHeader';
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
    underConstruction: { plan, netMap, storageMap },
    validation,
    calculatedOnce: { namespacesUsedBySelectedVms },
    existingResources: {
      providers: availableProviders,
      targetNamespaces: availableTargetNamespaces,
    },
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

  const [isNameEdited, setIsNameEdited] = useState(true);

  const networkMessages = buildNetworkMessages(t);
  const storageMessages = buildStorageMessages(t);

  const onChangePlan: (value: string, event: React.FormEvent<HTMLInputElement>) => void = (
    value,
  ) => {
    dispatch(setPlanName(value?.trim() ?? ''));
  };

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
        {isNameEdited || validation.planName === 'error' ? (
          <Form isWidthLimited>
            <FormGroupWithHelpText
              label={t('Plan name')}
              isRequired
              fieldId="planName"
              validated={validation.planName}
              helperTextInvalid={t(
                'Name is required and must be a unique within a namespace and valid Kubernetes name.',
              )}
            >
              <TextInput
                spellCheck="false"
                isRequired
                type="text"
                id="planName"
                value={plan.metadata.name}
                validated={validation.planName}
                isDisabled={flow.editingDone}
                onChange={(e, v) => onChangePlan(v, e)}
              />
            </FormGroupWithHelpText>
          </Form>
        ) : (
          <EditableDescriptionItem
            title={t('Plan name')}
            content={plan.metadata.name}
            ariaEditLabel={t('Edit plan name')}
            onEdit={() => setIsNameEdited(true)}
            isDisabled={flow.editingDone}
          />
        )}

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
        <DescriptionListGroup>
          <DescriptionListTerm>{t('Selected VMs')}</DescriptionListTerm>
          <DescriptionListDescription>
            {t('{{vmCount}} VMs selected ', { vmCount: plan.spec.vms?.length ?? 0 })}
          </DescriptionListDescription>
        </DescriptionListGroup>

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
              onChange={(e, v) => onChangeTargetProvider(v, e)}
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
                itemId: ns?.name,
                isDisabled:
                  namespacesUsedBySelectedVms.includes(ns?.name) &&
                  plan.spec.provider?.destination?.name === plan.spec.provider.source.name,
                children: ns?.name,
              }))}
              value={plan.spec.targetNamespace}
              onSelect={(value) => dispatch(setPlanTargetNamespace(value as string))}
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
