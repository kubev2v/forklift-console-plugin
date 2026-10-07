import { type FC, useEffect, useMemo } from 'react';
import { Controller, useWatch } from 'react-hook-form';

import { FormGroupWithHelpText } from '@components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import { HelpIconPopover } from '@components/common/HelpIconPopover/HelpIconPopover';
import { getMultiNicSourceNetworks } from '@components/mappings/network-mappings/utils/getMultiNicSourceNetworks';
import type { ProviderVirtualMachine as TypesProviderVirtualMachine } from '@forklift-ui/types';
import { Alert, AlertVariant, Stack, StackItem, TextInput } from '@patternfly/react-core';
import { POD } from '@utils/constants';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';
import { isDefaultNetworkTarget } from '@utils/mappings/constants';
import {
  netMapFieldLabels,
  NetworkMapFieldId,
  type NetworkMapping,
} from '@utils/mappings/networkMap';
import type { MappingValue } from '@utils/types';

import { useCreatePlanFormContext } from '../../hooks/useCreatePlanFormContext';
import { useCreatePlanWizardContext } from '../../hooks/useCreatePlanWizardContext';
import { useInitializeMappings } from '../../hooks/useInitializeMappings';
import { GeneralFormFieldId } from '../general-information/constants';
import { VmFormFieldId } from '../virtual-machines/constants';

import NetworkMapFieldTable from './NetworkMapFieldTable';
import { filterTargetNetworksByProject, getSourceNetworkValues } from './utils';

const NewNetworkMapFields: FC = () => {
  const { t } = useForkliftTranslation();
  const defaultNetworkLabel = t('Default network');
  const defaultTarget = useMemo(
    (): MappingValue => ({ id: POD, name: defaultNetworkLabel }),
    [defaultNetworkLabel],
  );
  const { control, getFieldState, setValue } = useCreatePlanFormContext();
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
    defaultNetworkLabel,
  );

  const targetNetworkMap = useMemo(
    () =>
      filterTargetNetworksByProject(availableTargetNetworks, targetProject, defaultNetworkLabel),
    [availableTargetNetworks, defaultNetworkLabel, targetProject],
  );

  useInitializeMappings<NetworkMapping>({
    currentMap: networkMap,
    defaultTarget,
    fieldIds: {
      mapField: NetworkMapFieldId.NetworkMap,
      sourceField: NetworkMapFieldId.SourceNetwork,
      targetField: NetworkMapFieldId.TargetNetwork,
    },
    isLoading,
    usedSources: usedSourceNetworks,
  });

  useEffect(() => {
    if (isLoading || !networkMap?.length) {
      return;
    }

    const vmsList = Object.values(vms) as TypesProviderVirtualMachine[];
    const multiNicIds = getMultiNicSourceNetworks(vmsList, oVirtNicProfiles);
    if (multiNicIds.size === 0) {
      return;
    }

    let updated = false;
    const updatedMap = networkMap.map((mapping) => {
      const sourceId = mapping[NetworkMapFieldId.SourceNetwork]?.id ?? '';

      if (
        multiNicIds.has(sourceId) &&
        isDefaultNetworkTarget(mapping[NetworkMapFieldId.TargetNetwork])
      ) {
        updated = true;
        return { ...mapping, [NetworkMapFieldId.TargetNetwork]: { name: '' } };
      }
      return mapping;
    });

    if (updated) {
      setValue(NetworkMapFieldId.NetworkMap, updatedMap, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }, [isLoading, networkMap, oVirtNicProfiles, setValue, vms]);

  return (
    <Stack className="pf-v6-u-ml-lg" hasGutter>
      {error?.root && <Alert isInline title={error.root.message} variant={AlertVariant.danger} />}

      {isEmpty(availableSourceNetworks) && !sourceNetworksLoading && (
        <Alert
          isInline
          title={t('No source networks are available for the selected VMs.')}
          variant={AlertVariant.warning}
        />
      )}

      <NetworkMapFieldTable
        isLoading={isLoading}
        loadError={sourceNetworksError ?? targetNetworksError ?? oVirtNicProfilesError}
        networkMap={networkMap}
        otherSourceNetworks={otherSourceNetworks}
        oVirtNicProfiles={oVirtNicProfiles}
        targetNetworks={targetNetworkMap}
        usedSourceNetworks={usedSourceNetworks}
        vms={vms}
      />

      <FormGroupWithHelpText
        helperText={t("Provide a name now, or we'll generate one when the map is created.")}
        label={netMapFieldLabels[NetworkMapFieldId.NetworkMapName]}
        labelHelp={
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
          control={control}
          name={NetworkMapFieldId.NetworkMapName}
          render={({ field }) => <TextInput {...field} />}
        />
      </FormGroupWithHelpText>
    </Stack>
  );
};

export default NewNetworkMapFields;
