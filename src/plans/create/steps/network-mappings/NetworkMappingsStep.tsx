import { useEffect, useMemo } from 'react';
import { useWatch } from 'react-hook-form';
import { useOpenShiftNetworks, useSourceNetworks } from 'src/modules/Providers/hooks/useNetworks';

import WizardStepContainer from '@components/common/WizardStepContainer';
import { Alert, AlertVariant, Stack } from '@patternfly/react-core';
import { Namespace } from '@utils/constants';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import { useCreatePlanFormContext } from '../../hooks';
import { GeneralFormFieldId } from '../general-information/constants';
import { VmFormFieldId } from '../virtual-machines/constants';

import { defaultNetMapping, NetworkMapFieldId } from './constants';
import NetworkMapFieldTable from './NetworkMapFieldTable';
import { getSourceNetworkLabels } from './utils';

const NetworkMappingsStep = () => {
  const { t } = useForkliftTranslation();
  const { control, getFieldState, setValue } = useCreatePlanFormContext();
  const { error: netMappingsError } = getFieldState(NetworkMapFieldId.NetworkMappings);
  const [targetProject, sourceProvider, targetProvider, vms, netMappings] = useWatch({
    control,
    name: [
      GeneralFormFieldId.TargetProject,
      GeneralFormFieldId.SourceProvider,
      GeneralFormFieldId.TargetProvider,
      VmFormFieldId.Vms,
      NetworkMapFieldId.NetworkMappings,
    ],
  });
  const isNetMappingsEmpty = isEmpty(netMappings);

  const [availableSourceNetworks, sourceNetworksLoading, sourceNetworksError] =
    useSourceNetworks(sourceProvider);
  const [availableTargetNetworks, targetNetworksLoading, targetNetworksError] =
    useOpenShiftNetworks(targetProvider);

  const { other: otherSourceLabels, used: usedSourceLabels } = getSourceNetworkLabels(
    sourceProvider,
    availableSourceNetworks,
    Object.values(vms),
  );

  // When the network mappings are empty, default to source network values used by VMs,
  // otherwise set empty inputs for the field array to force an empty field table row.
  useEffect(() => {
    if (!sourceNetworksLoading && isNetMappingsEmpty) {
      if (isEmpty(usedSourceLabels)) {
        setValue(NetworkMapFieldId.NetworkMappings, [defaultNetMapping]);
        return;
      }

      setValue(
        NetworkMapFieldId.NetworkMappings,
        usedSourceLabels.map((label) => ({
          [NetworkMapFieldId.SourceNetwork]: label,
          [NetworkMapFieldId.TargetNetwork]: defaultNetMapping[NetworkMapFieldId.TargetNetwork],
        })),
      );
    }
  }, [sourceNetworksLoading, isNetMappingsEmpty, usedSourceLabels, setValue]);

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
    <WizardStepContainer title={t('Network mappings')}>
      <Stack hasGutter>
        {netMappingsError?.root && (
          <Alert variant={AlertVariant.danger} isInline title={netMappingsError.root.message} />
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
          isLoading={sourceNetworksLoading || targetNetworksLoading}
          loadError={sourceNetworksError ?? targetNetworksError}
        />
      </Stack>
    </WizardStepContainer>
  );
};

export default NetworkMappingsStep;
