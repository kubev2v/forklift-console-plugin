import { type FC, useState } from 'react';
import type { InventoryNetwork } from 'src/modules/Providers/hooks/useNetworks';
import type { InventoryStorage } from 'src/modules/Providers/hooks/useStorages';

import type {
  OpenShiftNetworkAttachmentDefinition,
  OpenShiftStorageClass,
  V1beta1NetworkMap,
  V1beta1Plan,
  V1beta1StorageMap,
} from '@kubev2v/types';

import { usePlanMappingsHandlers } from '../hooks/usePlanMappingsHandlers';
import { getLabeledAndAvailableMappings } from '../utils/getLabeledAndAvailableMappings';
import { patchPlanMappingsData } from '../utils/utils';

import PlanMappingEditButton from './PlanMappingEditButton/PlanMappingEditButton';
import PlanMappingsActionsBar from './PlanMappingsActionsBar/PlanMappingsActionsBar';
import PlanMappingsEditMode from './PlanMappingsEditMode';
import PlanMappingsViewMode from './PlanMappingsViewMode';

type PlanMappingsSectionProps = {
  plan: V1beta1Plan;
  planNetworkMaps: V1beta1NetworkMap;
  planStorageMaps: V1beta1StorageMap;
  setAlertMessage: (message: string) => void;
  sourceNetworks: InventoryNetwork[];
  sourceStorages: InventoryStorage[];
  targetNetworks: OpenShiftNetworkAttachmentDefinition[];
  targetStorages: OpenShiftStorageClass[];
};

const PlanMappingsSection: FC<PlanMappingsSectionProps> = ({
  plan,
  planNetworkMaps,
  planStorageMaps,
  setAlertMessage,
  sourceNetworks,
  sourceStorages,
  targetNetworks,
  targetStorages,
}) => {
  const {
    canAddNetwork,
    canAddStorage,
    dataChanged,
    editMode,
    onAddNetwork,
    onAddStorage,
    onDeleteNetwork,
    onDeleteStorage,
    onReplaceNetwork,
    onReplaceStorage,
    reset,
    setEditMode,
    updatedNetwork,
    updatedStorage,
  } = usePlanMappingsHandlers({
    planNetworkMaps,
    planStorageMaps,
    sourceNetworks,
    sourceStorages,
    targetNetworks,
    targetStorages,
  });
  const [isLoading, setIsLoading] = useState(false);

  const onUpdate = async () => {
    setIsLoading(true);
    try {
      await patchPlanMappingsData({
        planNetworkMaps,
        planStorageMaps,
        updatedNetwork,
        updatedStorage,
      });

      reset(true);
    } catch (err) {
      setAlertMessage(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  const mappings = getLabeledAndAvailableMappings({
    plan,
    sourceNetworks,
    sourceStorages,
    targetNetworks,
    targetStorages,
    updatedNetwork,
    updatedStorage,
  });

  const { labeledNetworkMappings, labeledStorageMappings } = mappings;

  return editMode ? (
    <>
      <PlanMappingsActionsBar
        dataChanged={dataChanged}
        isLoading={isLoading}
        onUpdate={onUpdate}
        reset={reset}
      />
      <PlanMappingsEditMode
        plan={plan}
        onAddNetwork={onAddNetwork}
        onDeleteNetwork={onDeleteNetwork}
        onReplaceNetwork={onReplaceNetwork}
        onAddStorage={onAddStorage}
        onDeleteStorage={onDeleteStorage}
        onReplaceStorage={onReplaceStorage}
        disableAddNetwork={!canAddNetwork}
        disableAddStorage={!canAddStorage}
        {...mappings}
      />
    </>
  ) : (
    <>
      <PlanMappingEditButton
        onEdit={() => {
          setEditMode(true);
        }}
        plan={plan}
      />
      <PlanMappingsViewMode
        plan={plan}
        labeledNetworkMappings={labeledNetworkMappings}
        labeledStorageMappings={labeledStorageMappings}
      />
    </>
  );
};

export default PlanMappingsSection;
