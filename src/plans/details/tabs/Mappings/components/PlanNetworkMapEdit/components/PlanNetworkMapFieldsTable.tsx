import { type FC, useEffect } from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import NetworkIPModeRow from 'src/components/networkIPMode/NetworkIPModeRow';
import { networkMapFieldLabels } from 'src/networkMaps/utils/constants';
import { getNetworkMapFieldId } from 'src/networkMaps/utils/getNetworkMapFieldId';
import { validateNetworkMap } from 'src/plans/create/steps/network-map/utils';
import { hasPodNetworkMappings } from 'src/plans/create/utils/hasMultiplePodNetworkMappings';

import FieldBuilderTable from '@components/FieldBuilderTable/FieldBuilderTable';
import MultiNicInfoAlert from '@components/mappings/network-mappings/MultiNicInfoAlert';
import TargetNetworkField from '@components/mappings/network-mappings/TargetNetworkField';
import type { OVirtNicProfile, ProviderVirtualMachine } from '@forklift-ui/types';
import { Stack } from '@patternfly/react-core';
import { NetworkMapFieldId } from '@utils/crds/maps/types';
import { useForkliftTranslation } from '@utils/i18n';
import { getDefaultNetMapping, ignoreNetMapping } from '@utils/mappings/networkMap';
import type { MappingValue } from '@utils/types';

import type { PlanNetworkEditFormValues } from '../utils/types';

import { getPlanNetworkMapDerived } from './planNetworkMapDerived';
import SourceNetworkField from './SourceNetworkField';

type PlanNetworkMapFieldsTableProps = {
  isLoading: boolean;
  loadError: Error | null;
  otherSourceNetworks: MappingValue[];
  oVirtNicProfiles: OVirtNicProfile[];
  targetNetworks: Record<string, MappingValue>;
  usedSourceNetworks: MappingValue[];
  vms: Record<string, ProviderVirtualMachine>;
};

const PlanNetworkMapFieldsTable: FC<PlanNetworkMapFieldsTableProps> = ({
  isLoading,
  loadError,
  otherSourceNetworks,
  oVirtNicProfiles,
  targetNetworks,
  usedSourceNetworks,
  vms,
}) => {
  const { t } = useForkliftTranslation();
  const { control, trigger } = useFormContext<PlanNetworkEditFormValues>();
  const networkMappings = useWatch({ control, name: NetworkMapFieldId.NetworkMap });
  const {
    append,
    fields: networkMappingFields,
    remove,
  } = useFieldArray({
    control,
    name: NetworkMapFieldId.NetworkMap,
    rules: {
      validate: (values) =>
        validateNetworkMap({ oVirtNicProfiles, usedSourceNetworks, values, vms }),
    },
  });

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      trigger().catch(() => undefined);
    }, 0);
    return (): void => {
      clearTimeout(timeoutId);
    };
  }, [trigger]);

  const { multiNicNetworkIds, networkNames, vmsList } = getPlanNetworkMapDerived({
    otherSourceNetworks,
    oVirtNicProfiles,
    usedSourceNetworks,
    vms,
  });

  return (
    <Stack hasGutter>
      <MultiNicInfoAlert
        networkNames={networkNames}
        oVirtNicProfiles={oVirtNicProfiles}
        vms={vmsList}
      />
      <FieldBuilderTable
        addButton={{
          isDisabled: isLoading || Boolean(loadError),
          label: t('Add mapping'),
          onClick: async () => {
            const defaultMapping = getDefaultNetMapping();
            append({
              [NetworkMapFieldId.SourceNetwork]: defaultMapping[NetworkMapFieldId.SourceNetwork],
              [NetworkMapFieldId.TargetNetwork]: hasPodNetworkMappings(networkMappings)
                ? ignoreNetMapping[NetworkMapFieldId.TargetNetwork]
                : defaultMapping[NetworkMapFieldId.TargetNetwork],
            });
            await trigger();
          },
        }}
        fieldRows={networkMappingFields.map((field, index) => ({
          ...field,
          additionalOptions: (
            <NetworkIPModeRow
              index={index}
              targetNetworkFieldId={getNetworkMapFieldId(NetworkMapFieldId.TargetNetwork, index)}
            />
          ),
          inputs: [
            <SourceNetworkField
              fieldId={getNetworkMapFieldId(NetworkMapFieldId.SourceNetwork, index)}
              key={getNetworkMapFieldId(NetworkMapFieldId.SourceNetwork, index)}
              otherSourceNetworks={otherSourceNetworks}
              usedSourceNetworks={usedSourceNetworks}
            />,
            <TargetNetworkField
              fieldId={getNetworkMapFieldId(NetworkMapFieldId.TargetNetwork, index)}
              hideNonNadTargets={multiNicNetworkIds.has(field.sourceNetwork?.id ?? '')}
              key={getNetworkMapFieldId(NetworkMapFieldId.TargetNetwork, index)}
              showIgnoreNetworkOption
              targetNetworks={targetNetworks}
            />,
          ],
        }))}
        headers={[
          { label: networkMapFieldLabels[NetworkMapFieldId.SourceNetwork], width: 40 },
          { label: networkMapFieldLabels[NetworkMapFieldId.TargetNetwork], width: 40 },
        ]}
        removeButton={{
          isDisabled: () => networkMappingFields.length <= 1,
          onClick: (index) => {
            if (networkMappingFields.length > 1) {
              remove(index);
            }
          },
          tooltip: (_index) => {
            if (networkMappingFields.length <= 1) {
              return t('At least one network mapping must be provided.');
            }
            return undefined;
          },
        }}
      />
    </Stack>
  );
};

export default PlanNetworkMapFieldsTable;
