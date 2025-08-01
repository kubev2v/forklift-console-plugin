import { type FC, useMemo } from 'react';
import { Controller, useWatch } from 'react-hook-form';

import { FormGroupWithHelpText } from '@components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import { HelpIconPopover } from '@components/common/HelpIconPopover/HelpIconPopover';
import { Alert, AlertVariant, Stack, StackItem, TextInput } from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import { useCreatePlanFormContext } from '../../hooks/useCreatePlanFormContext';
import { useCreatePlanWizardContext } from '../../hooks/useCreatePlanWizardContext';
import { useInitializeMappings } from '../../hooks/useInitializeMappings';
import { GeneralFormFieldId } from '../general-information/constants';
import { VmFormFieldId } from '../virtual-machines/constants';

import {
  defaultNetMapping,
  netMapFieldLabels,
  NetworkMapFieldId,
  type NetworkMapping,
} from './constants';
import NetworkMapFieldTable from './NetworkMapFieldTable';
import { filterTargetNetworksByProject, getSourceNetworkValues } from './utils';

const NewNetworkMapFields: FC = () => {
  const { t } = useForkliftTranslation();
  const { control, getFieldState } = useCreatePlanFormContext();
  const { network } = useCreatePlanWizardContext();
  const [targetProject, vms, networkMap] = useWatch({
    control,
    name: [GeneralFormFieldId.TargetProject, VmFormFieldId.Vms, NetworkMapFieldId.NetworkMap],
  });

  const [availableSourceNetworks, sourceNetworksLoading, sourceNetworksError] = network.sources;
  const [availableTargetNetworks, targetNetworksLoading, targetNetworksError] = network.targets;
  const [oVirtNicProfiles, oVirtNicProfilesLoading, oVirtNicProfilesError] =
    network.oVirtNicProfiles;
  const isLoading = sourceNetworksLoading || targetNetworksLoading || oVirtNicProfilesLoading;
  const { error } = getFieldState(NetworkMapFieldId.NetworkMap);

  const { other: otherSourceNetworks, used: usedSourceNetworks } = getSourceNetworkValues(
    availableSourceNetworks,
    Object.values(vms),
    oVirtNicProfiles,
  );

  const targetNetworkMap = useMemo(
    () => filterTargetNetworksByProject(availableTargetNetworks, targetProject),
    [availableTargetNetworks, targetProject],
  );

  useInitializeMappings<NetworkMapping>({
    currentMap: networkMap,
    defaultTarget: defaultNetMapping[NetworkMapFieldId.TargetNetwork],
    fieldIds: {
      mapField: NetworkMapFieldId.NetworkMap,
      sourceField: NetworkMapFieldId.SourceNetwork,
      targetField: NetworkMapFieldId.TargetNetwork,
    },
    isLoading,
    usedSources: usedSourceNetworks,
  });

  return (
    <Stack hasGutter className="pf-v5-u-ml-lg">
      {error?.root && <Alert variant={AlertVariant.danger} isInline title={error.root.message} />}

      {isEmpty(usedSourceNetworks) && !sourceNetworksLoading && (
        <Alert
          variant={AlertVariant.warning}
          isInline
          title={t('No source networks are available for the selected VMs.')}
        />
      )}

      <NetworkMapFieldTable
        networkMap={networkMap}
        vms={vms}
        oVirtNicProfiles={oVirtNicProfiles}
        targetNetworks={targetNetworkMap}
        usedSourceNetworks={usedSourceNetworks}
        otherSourceNetworks={otherSourceNetworks}
        isLoading={isLoading}
        loadError={sourceNetworksError ?? targetNetworksError ?? oVirtNicProfilesError}
      />

      <FormGroupWithHelpText
        label={netMapFieldLabels[NetworkMapFieldId.NetworkMapName]}
        helperText={t("Provide a name now, or we'll generate one when the map is created.")}
        labelIcon={
          <HelpIconPopover>
            <Stack hasGutter>
              <StackItem>
                {t(
                  'Your selected network mappings will automatically save as a network map when your plan is created.',
                )}
              </StackItem>
              <StackItem>
                {t(
                  "Provide a name now, or we'll generate one when the map is created. You can find your network maps under the Network maps page.",
                )}
              </StackItem>
            </Stack>
          </HelpIconPopover>
        }
      >
        <Controller
          name={NetworkMapFieldId.NetworkMapName}
          control={control}
          render={({ field }) => <TextInput {...field} />}
        />
      </FormGroupWithHelpText>
    </Stack>
  );
};

export default NewNetworkMapFields;
