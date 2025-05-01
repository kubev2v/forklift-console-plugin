import { useEffect, useMemo } from 'react';
import { useWatch } from 'react-hook-form';
import { useOpenShiftNetworks, useSourceNetworks } from 'src/modules/Providers/hooks/useNetworks';

import WizardStepContainer from '@components/common/WizardStepContainer';
import { Alert, AlertVariant, Stack } from '@patternfly/react-core';
import { Namespace } from '@utils/constants';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import { planStepNames, PlanWizardStepId } from '../../constants';
import { useCreatePlanFormContext } from '../../hooks';
import { GeneralFormFieldId } from '../general-information/constants';
import { VmFormFieldId } from '../virtual-machines/constants';

import { defaultNetMapping, NetworkMapFieldId } from './constants';
import NetworkMapFieldTable from './NetworkMapFieldTable';
import { getSourceNetworkLabels } from './utils';

const NetworkMapStep = () => {
  const { t } = useForkliftTranslation();
  const { control, getFieldState, setValue } = useCreatePlanFormContext();
  const { error: networkMapError } = getFieldState(NetworkMapFieldId.NetworkMap);
  const [targetProject, sourceProvider, targetProvider, vms, networkMap] = useWatch({
    control,
    name: [
      GeneralFormFieldId.TargetProject,
      GeneralFormFieldId.SourceProvider,
      GeneralFormFieldId.TargetProvider,
      VmFormFieldId.Vms,
      NetworkMapFieldId.NetworkMap,
    ],
  });

  const [availableSourceNetworks, sourceNetworksLoading, sourceNetworksError] =
    useSourceNetworks(sourceProvider);
  const [availableTargetNetworks, targetNetworksLoading, targetNetworksError] =
    useOpenShiftNetworks(targetProvider);
  const isNetMapEmpty = isEmpty(networkMap);
  const isLoading = sourceNetworksLoading || targetNetworksLoading;

  const { other: otherSourceLabels, used: usedSourceLabels } = getSourceNetworkLabels(
    sourceProvider,
    availableSourceNetworks,
    Object.values(vms ?? {}),
  );

  // When the network map is empty, default to source network values used by VMs,
  // otherwise set empty inputs for the field array to force an empty field table row.
  useEffect(() => {
    if (!isLoading && isNetMapEmpty) {
      if (isEmpty(usedSourceLabels)) {
        setValue(NetworkMapFieldId.NetworkMap, [defaultNetMapping]);
        return;
      }

      setValue(
        NetworkMapFieldId.NetworkMap,
        usedSourceLabels.map((label) => ({
          [NetworkMapFieldId.SourceNetwork]: label,
          [NetworkMapFieldId.TargetNetwork]: defaultNetMapping[NetworkMapFieldId.TargetNetwork],
        })),
      );
    }
  }, [isLoading, isNetMapEmpty, usedSourceLabels, setValue]);

  const targetNetworks = useMemo(
    () =>
      availableTargetNetworks.reduce(
        (acc: Record<string, string>, network) => {
          if (
            network.namespace === targetProject ||
            (network.namespace as Namespace) === Namespace.Default
          ) {
            acc[network.uid] = `${network.namespace}/${network.name}`;
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

        {isEmpty(usedSourceLabels) && !sourceNetworksLoading && (
          <Alert
            variant={AlertVariant.warning}
            isInline
            title={t('No source networks are available for the selected VMs.')}
          />
        )}

        <NetworkMapFieldTable
          targetNetworks={targetNetworks}
          usedSourceLabels={usedSourceLabels}
          otherSourceLabels={otherSourceLabels}
          isLoading={isLoading}
          loadError={sourceNetworksError ?? targetNetworksError}
        />
      </Stack>
    </WizardStepContainer>
  );
};

export default NetworkMapStep;
