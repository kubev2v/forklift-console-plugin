import React, { useState } from 'react';
import StandardPage from 'src/components/page/StandardPage';
import { useForkliftTranslation } from 'src/utils/i18n';
import { isProviderLocalOpenshift } from 'src/utils/resources';

import { EnumFilter, SearchableGroupedEnumFilter } from '@kubev2v/common';
import {
  NetworkMapModelGroupVersionKind,
  ProviderModelGroupVersionKind,
  StorageMapModelGroupVersionKind,
} from '@kubev2v/types';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import {
  AlertVariant,
  Button,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Drawer,
  DrawerActions,
  DrawerCloseButton,
  DrawerContent,
  DrawerContentBody,
  DrawerHead,
  DrawerPanelContent,
  Form,
  FormGroup,
  FormSelect,
  FormSelectOption,
  TextInput,
} from '@patternfly/react-core';

import { DetailsItem, getIsTarget } from '../../../utils';
import { concernsMatcher, featuresMatcher, VmData } from '../../details';
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
});

export const PlansCreateForm = ({
  children,
  state: {
    underConstruction: { plan, netMap, storageMap },
    validation,
    receivedAsParams: { selectedVms },
    calculatedOnce: {
      vmFieldsFactory: [vmFieldsFactory, RowMapper],
      namespacesUsedBySelectedVms,
    },
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
  },
  dispatch,
}: {
  children?;
  state: CreateVmMigrationPageState;
  dispatch: (action: PageAction<unknown, unknown>) => void;
}) => {
  const { t } = useForkliftTranslation();
  const vmFields = vmFieldsFactory(t);
  const [isNameEdited, setIsNameEdited] = useState(false);
  const [isTargetProviderEdited, setIsTargetProviderEdited] = useState(false);
  const [isTargetNamespaceEdited, setIsTargetNamespaceEdited] = useState(false);

  const [isVmDetails, setIsVmDetails] = useState(false);
  const networkMessages = buildNetworkMessages(t);
  const storageMessages = buildStorageMessages(t);
  return (
    <Drawer isExpanded={isVmDetails}>
      <DrawerContent
        panelContent={
          <DrawerPanelContent widths={{ default: 'width_75' }}>
            <DrawerHead>
              <DrawerActions>
                <DrawerCloseButton onClick={() => setIsVmDetails(false)} />
              </DrawerActions>
            </DrawerHead>
            <StandardPage<VmData>
              title={t('Selected VMs')}
              dataSource={[selectedVms, true, false]}
              fieldsMetadata={vmFields}
              RowMapper={RowMapper}
              namespace={plan.spec.provider?.source?.namespace}
              extraSupportedFilters={{
                concerns: SearchableGroupedEnumFilter,
                features: EnumFilter,
              }}
              extraSupportedMatchers={[concernsMatcher, featuresMatcher]}
            />
          </DrawerPanelContent>
        }
      >
        <DrawerContentBody>
          {children}
          <DescriptionList
            className="forklift-create-provider-edit-section"
            columnModifier={{
              default: '1Col',
            }}
          >
            {isNameEdited || validation.planName === 'error' ? (
              <Form isWidthLimited>
                <FormGroup
                  label={t('Plan name')}
                  isRequired
                  fieldId="planName"
                  validated={validation.planName}
                  helperTextInvalid={t(
                    "Error: Name is required and must be a unique within a namespace and valid Kubernetes name (i.e., must contain no more than 253 characters, consists of lower case alphanumeric characters , '-' or '.' and starts and ends with an alphanumeric character).",
                  )}
                >
                  <TextInput
                    isRequired
                    type="text"
                    id="planName"
                    value={plan.metadata.name}
                    validated={validation.planName}
                    isDisabled={flow.editingDone}
                    onChange={(value) => dispatch(setPlanName(value?.trim() ?? ''))}
                  />
                </FormGroup>
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
                <Button onClick={() => setIsVmDetails(!isVmDetails)} variant="link" isInline>
                  {t('{{vmCount}} VMs selected ', { vmCount: plan.spec.vms?.length ?? 0 })}
                </Button>
              </DescriptionListDescription>
            </DescriptionListGroup>

            {isTargetProviderEdited ||
            validation.targetProvider === 'error' ||
            !plan.spec.provider?.destination ? (
              <Form isWidthLimited>
                <FormGroup
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
                    onChange={(value) => dispatch(setPlanTargetProvider(value))}
                    validated={validation.targetProvider}
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
                            label={
                              provider?.metadata?.name ?? provider?.metadata?.uid ?? String(index)
                            }
                          />
                        )),
                    ]}
                  </FormSelect>
                </FormGroup>
              </Form>
            ) : (
              <EditableDescriptionItem
                title={t('Target provider')}
                content={
                  <ResourceLink
                    name={plan.spec.provider?.destination?.name}
                    namespace={plan.spec.provider?.destination?.namespace}
                    groupVersionKind={ProviderModelGroupVersionKind}
                  />
                }
                ariaEditLabel={t('Edit target provider')}
                onEdit={() => setIsTargetProviderEdited(true)}
                isDisabled={flow.editingDone}
              />
            )}
            {isTargetNamespaceEdited ||
            validation.targetNamespace === 'error' ||
            !plan.spec.targetNamespace ? (
              <Form isWidthLimited>
                <FormGroup
                  label={t('Target namespace')}
                  isRequired
                  id="targetNamespace"
                  validated={validation.targetNamespace}
                >
                  <FormSelect
                    value={plan.spec.targetNamespace}
                    onChange={(value) => dispatch(setPlanTargetNamespace(value))}
                    validated={validation.targetNamespace}
                    id="targetNamespace"
                    isDisabled={flow.editingDone}
                  >
                    {[
                      <FormSelectOption
                        key="placeholder"
                        value={''}
                        label={t('Select a namespace')}
                        isPlaceholder
                        isDisabled
                      />,
                      ...availableTargetNamespaces.map((ns, index) => (
                        <FormSelectOption
                          key={ns?.name || index}
                          value={ns?.name}
                          label={ns?.name ?? String(index)}
                          isDisabled={namespacesUsedBySelectedVms.includes(ns?.name)}
                        />
                      )),
                    ]}
                  </FormSelect>
                </FormGroup>
              </Form>
            ) : (
              <EditableDescriptionItem
                title={t('Target namespace')}
                content={
                  <ResourceLink
                    name={plan.spec.targetNamespace}
                    namespace=""
                    groupVersionKind={{ kind: 'Namespace', version: 'v1', group: '' }}
                    linkTo={isProviderLocalOpenshift(
                      availableProviders.find(
                        (p) => p?.metadata?.name === plan.spec.provider?.destination?.name,
                      ),
                    )}
                  />
                }
                ariaEditLabel={t('Edit target namespace')}
                onEdit={() => setIsTargetNamespaceEdited(true)}
                isDisabled={flow.editingDone}
              />
            )}
            <DescriptionListGroup>
              <DescriptionListTerm>
                <span className="forklift-page-editable-description-item">
                  {t('Network map:')}
                  <ResourceLink
                    groupVersionKind={NetworkMapModelGroupVersionKind}
                    namespace={netMap.metadata?.namespace}
                    name={netMap.metadata?.name}
                    className="forklift-page-resource-link-in-description-item"
                    linkTo={false}
                  />
                </span>
              </DescriptionListTerm>
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
            <DescriptionListGroup>
              <DescriptionListTerm>
                <span className="forklift-page-editable-description-item">
                  {t('Storage map:')}
                  <ResourceLink
                    groupVersionKind={StorageMapModelGroupVersionKind}
                    namespace={storageMap.metadata?.namespace}
                    name={storageMap.metadata?.name}
                    className="forklift-page-resource-link-in-description-item"
                    linkTo={false}
                  />
                </span>
              </DescriptionListTerm>
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
        </DrawerContentBody>
      </DrawerContent>
    </Drawer>
  );
};
