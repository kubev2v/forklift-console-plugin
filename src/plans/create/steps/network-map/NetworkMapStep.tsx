import { useEffect, useMemo } from 'react';
import { useWatch } from 'react-hook-form';

import WizardStepContainer from '@components/common/WizardStepContainer';
import { Alert, AlertVariant, Stack } from '@patternfly/react-core';
import { Namespace } from '@utils/constants';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import { planStepNames, PlanWizardStepId } from '../../constants';
import { useCreatePlanFormContext, useCreatePlanWizardContext } from '../../hooks';
import type { MappingValue } from '../../types';
import { GeneralFormFieldId } from '../general-information/constants';
import { VmFormFieldId } from '../virtual-machines/constants';

import { defaultNetMapping, NetworkMapFieldId } from './constants';
import NetworkMapFieldTable from './NetworkMapFieldTable';
import { getSourceNetworkValues } from './utils';

const NetworkMapStep = () => {
  const { t } = useForkliftTranslation();
  const { control, getFieldState, setValue } = useCreatePlanFormContext();
  const { network } = useCreatePlanWizardContext();
  const { error: networkMapError } = getFieldState(NetworkMapFieldId.NetworkMap);
  const [targetProject, sourceProvider, vms, networkMap] = useWatch({
    control,
    name: [
      GeneralFormFieldId.TargetProject,
      GeneralFormFieldId.SourceProvider,
      VmFormFieldId.Vms,
      NetworkMapFieldId.NetworkMap,
    ],
  });

  const [availableSourceNetworks, sourceNetworksLoading, sourceNetworksError] = network.sources;
  const [availableTargetNetworks, targetNetworksLoading, targetNetworksError] = network.targets;
  const isNetMapEmpty = isEmpty(networkMap);
  const isLoading = sourceNetworksLoading || targetNetworksLoading;

  const { other: otherSourceNetworks, used: usedSourceNetworks } = getSourceNetworkValues(
    sourceProvider,
    availableSourceNetworks,
    Object.values(vms),
  );

  // When the network map is empty, default to source network values used by VMs,
  // otherwise set empty inputs for the field array to force an empty field table row.
  useEffect(() => {
    if (!isLoading && isNetMapEmpty) {
      if (isEmpty(usedSourceNetworks)) {
        setValue(NetworkMapFieldId.NetworkMap, [defaultNetMapping]);
        return;
      }

      setValue(
        NetworkMapFieldId.NetworkMap,
        usedSourceNetworks.map((sourceNetwork) => ({
          [NetworkMapFieldId.SourceNetwork]: sourceNetwork,
          [NetworkMapFieldId.TargetNetwork]: defaultNetMapping[NetworkMapFieldId.TargetNetwork],
        })),
      );
    }
  }, [isLoading, isNetMapEmpty, setValue, usedSourceNetworks]);

  const targetNetworkMap = useMemo(
    () =>
      availableTargetNetworks.reduce(
        (acc: Record<string, MappingValue>, targetNetwork) => {
          if (
            targetNetwork.namespace === targetProject ||
            (targetNetwork.namespace as Namespace) === Namespace.Default
          ) {
            acc[targetNetwork.uid] = {
              id: targetNetwork.id,
              name: `${targetNetwork.namespace}/${targetNetwork.name}`,
            };
          }

          return acc;
        },
        { podNetwork: defaultNetMapping[NetworkMapFieldId.TargetNetwork] },
      ),
    [availableTargetNetworks, targetProject],
  );

  return (
    <WizardStepContainer title={planStepNames[PlanWizardStepId.NetworkMap]}>
      <Stack hasGutter>
        {networkMapError?.root && (
          <Alert variant={AlertVariant.danger} isInline title={networkMapError.root.message} />
        )}

        {isEmpty(usedSourceNetworks) && !sourceNetworksLoading && (
          <Alert
            variant={AlertVariant.warning}
            isInline
            title={t('No source networks are available for the selected VMs.')}
          />
        )}

        <NetworkMapFieldTable
          targetNetworks={targetNetworkMap}
          usedSourceNetworks={usedSourceNetworks}
          otherSourceNetworks={otherSourceNetworks}
          isLoading={isLoading}
          loadError={sourceNetworksError ?? targetNetworksError}
        />
      </Stack>
    </WizardStepContainer>
  );
};

export default NetworkMapStep;
