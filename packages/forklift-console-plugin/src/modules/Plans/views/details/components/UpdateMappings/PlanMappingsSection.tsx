import React, { useState } from 'react';
import { isPlanEditable } from 'src/modules/Plans/utils';
import { patchPlanMappingsData } from 'src/modules/Plans/utils';
import { InventoryNetwork } from 'src/modules/Providers/hooks/useNetworks';
import { InventoryStorage } from 'src/modules/Providers/hooks/useStorages';
import { useForkliftTranslation } from 'src/utils/i18n';

import { universalComparator } from '@kubev2v/common';
import {
  NetworkMapModelGroupVersionKind,
  OpenShiftNetworkAttachmentDefinition,
  OpenShiftStorageClass,
  StorageMapModelGroupVersionKind,
  V1beta1NetworkMap,
  V1beta1NetworkMapSpecMap,
  V1beta1Plan,
  V1beta1StorageMap,
  V1beta1StorageMapSpecMap,
} from '@kubev2v/types';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import {
  Alert,
  Button,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Divider,
  Drawer,
  Flex,
  FlexItem,
  HelperText,
  HelperTextItem,
} from '@patternfly/react-core';
import Pencil from '@patternfly/react-icons/dist/esm/icons/pencil-alt-icon';

import {
  canDeleteAndPatchPlanHooks,
  hasSomeCompleteRunningVMs,
  mapSourceNetworksIdsToLabels,
  mapSourceStoragesIdsToLabels,
  mapTargetNetworksIdsToLabels,
  mapTargetStoragesLabelsToIds,
  POD_NETWORK,
} from '../../utils';
import { Mapping, MappingList } from '..';

import { PlanMappingsSectionState } from './types';

/**
 * Represents the state (edit/view) of the Plan mappings section.
 *
 * @typedef {Object} MappingsSectionFieldsState
 * @property {boolean} edit - Determines whether the MappingsSectionFields is currently being edited.
 * @property {boolean} dataChanged - Determines whether the MappingsSectionFields's data has changed.
 * @property {ReactNode} alertMessage - The message to display when a validation error occurs.
 * @property {V1beta1NetworkMapSpecMap[]} updatedNetwork - The new version of the Plan Network Maps being edited.
 * @property {V1beta1StorageMapSpecMap[]} updatedStorage - The new version of the Plan Storage Maps being edited.
 */

type PlanMappingsSectionProps = {
  plan: V1beta1Plan;
  planNetworkMaps: V1beta1NetworkMap;
  planStorageMaps: V1beta1StorageMap;
  sourceNetworks: InventoryNetwork[];
  targetNetworks: OpenShiftNetworkAttachmentDefinition[];
  sourceStorages: InventoryStorage[];
  targetStorages: OpenShiftStorageClass[];
  planMappingsState?: PlanMappingsSectionState;
  planMappingsDispatch?: React.Dispatch<{
    type: string;
    payload?;
  }>;
};

export const PlanMappingsSection: React.FC<PlanMappingsSectionProps> = ({
  plan,
  planNetworkMaps,
  planStorageMaps,
  sourceNetworks,
  targetNetworks,
  sourceStorages,
  targetStorages,
  planMappingsState: state,
  planMappingsDispatch: dispatch,
}) => {
  const { t } = useForkliftTranslation();

  const [isLoading, setIsLoading] = useState(false);
  const [isAddNetworkMapAvailable, setIsAddNetworkMapAvailable] = useState(true);
  const [isAddStorageMapAvailable, setIsAddStorageMapAvailable] = useState(true);

  // Toggles between view and edit modes
  function onToggleEdit() {
    dispatch({ type: 'TOGGLE_EDIT' });
  }

  // Handle user clicking "cancel"
  function onCancel() {
    // clear changes and return to view mode
    setIsAddNetworkMapAvailable(true);
    setIsAddStorageMapAvailable(true);
    dispatch({ type: 'SET_CANCEL' });
    dispatch({ type: 'TOGGLE_EDIT' });
  }

  const onAddNetworkMapping = () => {
    const nextSourceNetworksIndex = sourceNetworks.findIndex(
      (sourceNet) =>
        state.updatedNetwork.length == 0 ||
        !state.updatedNetwork.find((updatedNet) => sourceNet.id === updatedNet.source.id),
    );
    const newNetworkMap = createReplacedNetworkMap(nextSourceNetworksIndex);
    const newState: V1beta1NetworkMapSpecMap[] = [...state.updatedNetwork];

    setIsAddNetworkMapAvailable(true);

    // If there is no more network maps to use, set the 'Add mappings' button as disabled, otherwise add the map entity
    newNetworkMap
      ? newState.push({ source: newNetworkMap.source, destination: newNetworkMap.destination })
      : setIsAddNetworkMapAvailable(false);

    return {
      type: 'ADD_NETWORK_MAPPING',
      payload: { newState },
    };
  };

  const onAddStorageMapping = () => {
    const nextSourceStoragesIndex = sourceStorages.findIndex(
      (sourceStorage) =>
        state.updatedStorage.length == 0 ||
        !state.updatedStorage.find(
          (updatedStorage) => sourceStorage.id === updatedStorage.source.id,
        ),
    );

    const newStorageMap = createReplacedStorageMap(nextSourceStoragesIndex, 0);
    const newState: V1beta1StorageMapSpecMap[] = [...state.updatedStorage];

    setIsAddStorageMapAvailable(true);

    // If there is no more storage maps to use, set the 'Add mappings' button as disabled, otherwise add the map entity
    newStorageMap
      ? newState.push({ source: newStorageMap.source, destination: newStorageMap.destination })
      : setIsAddStorageMapAvailable(false);

    return {
      type: 'ADD_STORAGE_MAPPING',
      payload: { newState },
    };
  };

  const onDeleteNetworkMapping = ({ source, destination }: Mapping) => {
    const newState = state.updatedNetwork.filter(
      (obj) =>
        (mapSourceNetworksIdsToLabels(sourceNetworks)[obj.source.id] !== source &&
          !(obj.source.type === 'pod' && source.includes('Pod'))) ||
        (mapTargetNetworksIdsToLabels(targetNetworks, plan)[obj.destination.type] ??
          obj.destination?.name ??
          'Not available') !== destination,
    );

    setIsAddNetworkMapAvailable(true);

    return {
      type: 'DELETE_NETWORK_MAPPING',
      payload: { newState },
    };
  };

  const onDeleteStorageMapping = ({ source, destination }: Mapping) => {
    const newState = state.updatedStorage.filter(
      (obj) =>
        mapSourceStoragesIdsToLabels(sourceStorages)[obj.source.id] != source ||
        (mapTargetStoragesLabelsToIds(targetStorages, plan)[obj.destination.storageClass]
          ? obj.destination.storageClass
          : 'Not available') != destination,
    );

    setIsAddStorageMapAvailable(true);

    return {
      type: 'DELETE_STORAGE_MAPPING',
      payload: { newState },
    };
  };

  const onReplaceNetworkMapping = ({ current, next }) => {
    const replacedIndex = state.updatedNetwork.findIndex(
      (obj) =>
        (mapSourceNetworksIdsToLabels(sourceNetworks)[obj.source.id] == current.source ||
          (obj.source.type === 'pod' && current.source.includes('Pod'))) &&
        (mapTargetNetworksIdsToLabels(targetNetworks, plan)[obj.destination.type] ??
          obj.destination?.name ??
          'Not available') == current.destination,
    );

    const nextSourceIndex = sourceNetworks.findIndex(
      (obj) =>
        (obj.providerType === 'ovirt' && ovirtFindObj(obj, next.source)) ||
        (obj.providerType === 'vsphere' && vsphereFindObj(obj, next.source)) ||
        (obj.providerType === 'openstack' && openstackFindObj(obj, next.source)) ||
        (obj.providerType === 'openshift' &&
          openshiftFindObj(obj as OpenShiftNetworkAttachmentDefinition, next.source)) ||
        (obj.providerType === 'ova' && ovaFindObj(obj, next.source)),
    );

    const nextTargetIndex = targetNetworks.findIndex(
      (obj) =>
        obj.providerType === 'openshift' &&
        openshiftFindObj(obj as OpenShiftNetworkAttachmentDefinition, next.destination),
    );
    const newState = [...state.updatedNetwork];

    if (replacedIndex >= 0 && nextSourceIndex >= 0) {
      const replacedNetworkMap = createReplacedNetworkMap(
        nextSourceIndex,
        nextTargetIndex,
        next.destination,
      );
      newState.splice(replacedIndex, 1, replacedNetworkMap);
    }

    return {
      type: 'REPLACE_NETWORK_MAPPING',
      payload: { newState },
    };
  };

  const onReplaceStorageMapping = ({ current, next }) => {
    const replacedIndex = state.updatedStorage.findIndex(
      (obj) =>
        mapSourceStoragesIdsToLabels(sourceStorages)[obj.source.id] == current.source &&
        (mapTargetStoragesLabelsToIds(targetStorages, plan)[obj.destination.storageClass]
          ? obj.destination.storageClass
          : 'Not available') == current.destination,
    );

    const nextSourceIndex = sourceStorages.findIndex(
      (obj) =>
        (obj.providerType === 'ovirt' && ovirtFindObj(obj, next.source)) ||
        (obj.providerType === 'vsphere' && vsphereFindObj(obj, next.source)) ||
        (obj.providerType === 'openstack' && openstackFindObj(obj, next.source)) ||
        (obj.providerType === 'openshift' &&
          openshiftFindObj(obj as OpenShiftStorageClass, next.source)),
    );

    const nextTargetIndex = targetStorages.findIndex(
      (obj) =>
        obj.providerType === 'openshift' &&
        openshiftFindObj(obj as OpenShiftNetworkAttachmentDefinition, next.destination),
    );
    const newState = [...state.updatedStorage];

    if (replacedIndex >= 0 && nextSourceIndex >= 0 && nextTargetIndex >= 0) {
      const replacedStorageMap = createReplacedStorageMap(nextSourceIndex, nextTargetIndex);
      newState.splice(replacedIndex, 1, replacedStorageMap);
    }

    return {
      type: 'REPLACE_STORAGE_MAPPING',
      payload: { newState },
    };
  };

  // Handle user clicking "Update Mappings"
  async function onUpdate() {
    setIsLoading(true);

    try {
      await patchPlanMappingsData(
        planNetworkMaps,
        planStorageMaps,
        state.updatedNetwork,
        state.updatedStorage,
      );

      planNetworkMaps.spec.map = [...state.updatedNetwork];
      planStorageMaps.spec.map = [...state.updatedStorage];

      // clear changes and return to view mode
      dispatch({ type: 'SET_CANCEL' });
      dispatch({ type: 'TOGGLE_EDIT' });

      setIsLoading(false);
      setIsAddNetworkMapAvailable(true);
      setIsAddStorageMapAvailable(true);
    } catch (err) {
      dispatch({
        type: 'SET_ALERT_MESSAGE',
        payload: err.message || err.toString(),
      });

      setIsLoading(false);
      return;
    }
  }

  const ovirtFindObj = (obj, nextName: string) => {
    return obj.path === nextName || obj.name === nextName;
  };

  const vsphereFindObj = (obj, nextName: string) => {
    return obj.path === nextName || obj.name === nextName;
  };

  const openstackFindObj = (obj, nextName: string) => {
    return obj.path === nextName || obj.name === nextName;
  };

  const openshiftFindObj = (
    obj: OpenShiftNetworkAttachmentDefinition | OpenShiftStorageClass,
    nextName: string,
  ) => {
    return `${obj.namespace}/${obj.name}` === nextName || obj.name === nextName;
  };

  const ovaFindObj = (obj, nextName: string) => {
    return obj.path === nextName || obj.name === nextName;
  };

  const createReplacedNetworkMap = (
    nextSourceIndex: number,
    nextTargetIndex = -1,
    targetName: string = POD_NETWORK,
  ): V1beta1NetworkMapSpecMap => {
    if (nextSourceIndex < 0) return null;

    return {
      destination: {
        name:
          nextTargetIndex < 0 && targetName === POD_NETWORK
            ? 'pod'
            : targetNetworks[nextTargetIndex].name,
        namespace:
          nextTargetIndex < 0 && targetName === POD_NETWORK
            ? ''
            : targetNetworks[nextTargetIndex].namespace,
        type: nextTargetIndex < 0 && targetName === POD_NETWORK ? 'pod' : 'multus',
      },
      source:
        sourceNetworks[nextSourceIndex].id === 'pod'
          ? { type: 'pod' }
          : {
              id: sourceNetworks[nextSourceIndex].id,
              name: sourceNetworks[nextSourceIndex].name,
              type: sourceNetworks[nextSourceIndex].providerType,
            },
    };
  };

  const createReplacedStorageMap = (
    nextSourceIndex: number,
    nextTargetIndex: number,
  ): V1beta1StorageMapSpecMap => {
    if (nextSourceIndex < 0) return null;

    return {
      destination: {
        storageClass: targetStorages[nextTargetIndex].name,
      },
      source: {
        id: sourceStorages[nextSourceIndex].id,
        name: sourceStorages[nextSourceIndex].name,
        type: sourceStorages[nextSourceIndex].providerType,
      },
    };
  };

  const labeledSelectedNetworkMaps: Mapping[] = state.updatedNetwork?.map((obj) => ({
    source: mapSourceNetworksIdsToLabels(sourceNetworks)[obj.source.id || obj.source?.type],
    destination:
      mapTargetNetworksIdsToLabels(targetNetworks, plan)[obj.destination.type] ??
      obj.destination?.name ??
      'Not available',
  }));

  const labeledSelectedStorageMaps: Mapping[] = state.updatedStorage?.map((obj) => ({
    source: mapSourceStoragesIdsToLabels(sourceStorages)[obj.source.id] || obj.source?.name,
    destination: mapTargetStoragesLabelsToIds(targetStorages, plan)[obj.destination.storageClass]
      ? obj.destination.storageClass
      : 'Not available',
  }));

  const nonSelectedSourceNetworks = sourceNetworks.filter(
    (sourceNet) =>
      state.updatedNetwork.length == 0 ||
      !state.updatedNetwork.find((updatedNet) => sourceNet.id === updatedNet.source.id),
  );

  const labeledAvailableSourceNetworks = [
    ...Object.values(mapSourceNetworksIdsToLabels(nonSelectedSourceNetworks)).sort((a, b) =>
      universalComparator(a, b, 'en'),
    ),
  ];

  const labeledAvailableTargetNetworks = [
    ...Object.values(mapTargetNetworksIdsToLabels(targetNetworks, plan)).sort((a, b) =>
      universalComparator(a, b, 'en'),
    ),
  ];

  const nonSelectedSourceStorages = sourceStorages.filter(
    (sourceStorage) =>
      state.updatedStorage.length == 0 ||
      !state.updatedStorage.find((updatedStorage) => sourceStorage.id === updatedStorage.source.id),
  );

  const labeledAvailableSourceStorages = [
    ...Object.values(mapSourceStoragesIdsToLabels(nonSelectedSourceStorages)).sort((a, b) =>
      universalComparator(a, b, 'en'),
    ),
  ];

  const labeledAvailableTargetStorages = [
    ...Object.keys(mapTargetStoragesLabelsToIds(targetStorages, plan)).sort((a, b) =>
      universalComparator(a, b, 'en'),
    ),
  ];

  const PlanMappingsSectionEditMode: React.FC = () => {
    const { t } = useForkliftTranslation();
    return (
      <>
        <Drawer>
          <DescriptionList
            className="forklift-page-plan-details-section"
            columnModifier={{
              default: '1Col',
            }}
          >
            <DescriptionListGroup>
              <DescriptionListTerm>
                <span className="forklift-page-plan-mapping">
                  {t('Network map:')}
                  <ResourceLink
                    groupVersionKind={NetworkMapModelGroupVersionKind}
                    name={plan.spec.map.network.name}
                    namespace={plan.spec.map.network.namespace}
                    className="forklift-page-plan-resource-link-in-description-item"
                  />
                </span>
              </DescriptionListTerm>
              <DescriptionListDescription className="forklift-page-plan-mapping-list">
                <MappingList
                  mappings={labeledSelectedNetworkMaps}
                  availableSources={labeledAvailableSourceNetworks}
                  availableDestinations={labeledAvailableTargetNetworks}
                  deleteMapping={(current) => dispatch(onDeleteNetworkMapping({ ...current }))}
                  addMapping={() => dispatch(onAddNetworkMapping())}
                  replaceMapping={({ current, next }) =>
                    dispatch(onReplaceNetworkMapping({ current, next }))
                  }
                  generalSourcesLabel={t('Other networks present on the source provider ')}
                  noSourcesLabel={t('No networks in this category')}
                  isDisabled={!isAddNetworkMapAvailable}
                />
              </DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>
                <span className="forklift-page-plan-mapping">
                  {t('Storage map:')}
                  <ResourceLink
                    groupVersionKind={StorageMapModelGroupVersionKind}
                    namespace={plan.spec.map.storage.namespace}
                    name={plan.spec.map.storage.name}
                    className="forklift-page-plan-resource-link-in-description-item"
                  />
                </span>
              </DescriptionListTerm>
              <DescriptionListDescription className="forklift-page-plan-mapping-list">
                <MappingList
                  mappings={labeledSelectedStorageMaps}
                  availableSources={labeledAvailableSourceStorages}
                  availableDestinations={labeledAvailableTargetStorages}
                  deleteMapping={(current) => dispatch(onDeleteStorageMapping({ ...current }))}
                  addMapping={() => dispatch(onAddStorageMapping())}
                  replaceMapping={({ current, next }) =>
                    dispatch(onReplaceStorageMapping({ current, next }))
                  }
                  generalSourcesLabel={t('Other storages present on the source provider ')}
                  noSourcesLabel={t('No storages in this category')}
                  isDisabled={!isAddStorageMapAvailable}
                />
              </DescriptionListDescription>
            </DescriptionListGroup>
          </DescriptionList>
        </Drawer>
      </>
    );
  };

  const PlanMappingsSectionViewMode: React.FC = () => {
    const { t } = useForkliftTranslation();
    const DisableEditMappings = hasSomeCompleteRunningVMs(plan) || !isPlanEditable(plan);

    return (
      <>
        <Drawer>
          {canDeleteAndPatchPlanHooks(plan) && (
            <FlexItem>
              <Button
                variant="secondary"
                icon={<Pencil />}
                onClick={onToggleEdit}
                isDisabled={DisableEditMappings}
              >
                {t('Edit mappings')}
              </Button>
              {DisableEditMappings ? (
                <HelperText className="forklift-section-plan-helper-text">
                  <HelperTextItem variant="indeterminate">
                    {t(
                      'The edit mappings button is disabled if the plan started running and at least one virtual machine was migrated successfully or when the plan status does not enable editing.',
                    )}
                  </HelperTextItem>
                </HelperText>
              ) : null}
            </FlexItem>
          )}
          <DescriptionList
            className="forklift-page-plan-details-section"
            columnModifier={{
              default: '1Col',
            }}
          >
            <DescriptionListGroup>
              <DescriptionListTerm>
                <span className="forklift-page-plan-mapping">
                  {t('Network map:')}
                  <ResourceLink
                    groupVersionKind={NetworkMapModelGroupVersionKind}
                    name={plan.spec.map.network.name}
                    namespace={plan.spec.map.network.namespace}
                    className="forklift-page-plan-resource-link-in-description-item"
                  />
                </span>
              </DescriptionListTerm>
              <DescriptionListDescription className="forklift-page-plan-mapping-list">
                <MappingList
                  mappings={labeledSelectedNetworkMaps}
                  generalSourcesLabel={t('Other networks present on the source provider ')}
                  noSourcesLabel={t('No networks in this category')}
                  isEditable={false}
                />
              </DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>
                <span className="forklift-page-plan-mapping">
                  {t('Storage map:')}
                  <ResourceLink
                    groupVersionKind={StorageMapModelGroupVersionKind}
                    namespace={plan.spec.map.storage.namespace}
                    name={plan.spec.map.storage.name}
                    className="forklift-page-plan-resource-link-in-description-item"
                  />
                </span>
              </DescriptionListTerm>
              <DescriptionListDescription className="forklift-page-plan-mapping-list">
                <MappingList
                  mappings={labeledSelectedStorageMaps}
                  generalSourcesLabel={t('Other storages present on the source provider ')}
                  noSourcesLabel={t('No storages in this category')}
                  isEditable={false}
                />
              </DescriptionListDescription>
            </DescriptionListGroup>
          </DescriptionList>
        </Drawer>
      </>
    );
  };

  return state.edit ? (
    // Edit mode
    <>
      <Flex>
        <FlexItem>
          <Button
            variant="primary"
            onClick={onUpdate}
            isDisabled={!state.dataChanged}
            isLoading={isLoading}
          >
            {t('Update mappings')}
          </Button>
        </FlexItem>
        <FlexItem>
          <Button variant="secondary" onClick={onCancel}>
            {t('Cancel')}
          </Button>
        </FlexItem>
      </Flex>
      <HelperText className="forklift-section-plan-helper-text">
        <HelperTextItem variant="indeterminate">
          {t(
            'Click the update mappings button to save your changes, button is disabled until a change is detected.',
          )}
        </HelperTextItem>
      </HelperText>
      <Divider />
      {state.alertMessage ? (
        <>
          <Alert
            className="co-alert forklift-alert--margin-top"
            isInline
            variant="danger"
            title={t('Error')}
          >
            {state.alertMessage?.toString()}
          </Alert>
        </>
      ) : null}
      <PlanMappingsSectionEditMode />
    </>
  ) : (
    // View mode
    <>
      <PlanMappingsSectionViewMode />
    </>
  );
};
