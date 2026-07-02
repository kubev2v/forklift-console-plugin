import { type FC, useEffect, useMemo } from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { networkMapFieldLabels } from 'src/networkMaps/utils/constants';
import { getNetworkMapFieldId } from 'src/networkMaps/utils/getNetworkMapFieldId';
import { NetworkMapFieldId } from 'src/networkMaps/utils/types';
import { defaultNetMapping, ignoreNetMapping } from 'src/plans/create/steps/network-map/constants';
import { validateNetworkMap } from 'src/plans/create/steps/network-map/utils';
import type { MappingValue } from 'src/plans/create/types';
import { hasPodNetworkMappings } from 'src/plans/create/utils/hasMultiplePodNetworkMappings';

import FieldBuilderTable from '@components/FieldBuilderTable/FieldBuilderTable';
import MultiNicInfoAlert from '@components/mappings/network-mappings/MultiNicInfoAlert';
import TargetNetworkField from '@components/mappings/network-mappings/TargetNetworkField';
import { getMultiNicSourceNetworks } from '@components/mappings/network-mappings/utils/getMultiNicSourceNetworks';
import type { OVirtNicProfile, ProviderVirtualMachine } from '@forklift-ui/types';
import { Stack } from '@patternfly/react-core';
import { NetworkMapFieldId } from '@utils/crds/maps/types';
import { useForkliftTranslation } from '@utils/i18n';

import type { PlanNetworkEditFormValues } from '../utils/types';

import SourceNetworkField from './SourceNetworkField';

type PlanNetworkMapFieldsTableProps = {
  oVirtNicProfiles: OVirtNicProfile[];
  usedSourceNetworks: MappingValue[];
  otherSourceNetworks: MappingValue[];
  vms: Record<string, ProviderVirtualMachine>;
  isLoading: boolean;
  targetNetworks: Record<string, MappingValue>;
  loadError: Error | null;
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

  const networkMappings = useWatch({
    control,
    name: NetworkMapFieldId.NetworkMap,
  });

  const {
    append,
    fields: networkMappingFields,
    remove,
  } = useFieldArray({
    control,
    name: NetworkMapFieldId.NetworkMap,
    rules: {
      validate: (values) => {
        return validateNetworkMap({
          oVirtNicProfiles,
          usedSourceNetworks,
          values,
          vms,
        });
      },
    },
  });

  useEffect(() => {
    setTimeout(async () => {
      await trigger();
    }, 0);
  }, [trigger]);

  const vmsList = useMemo(() => Object.values(vms), [vms]);
  const networkNames = useMemo(
    () =>
      new Map(
        [...usedSourceNetworks, ...otherSourceNetworks]
          .filter((net) => net.id)
          .map((net) => [net.id!, net.name]),
      ),
    [usedSourceNetworks, otherSourceNetworks],
  );
  const multiNicNetworkIds = useMemo(() => {
    const multiNicMap = getMultiNicSourceNetworks(vmsList, oVirtNicProfiles);
    return new Set(multiNicMap.keys());
  }, [vmsList, oVirtNicProfiles]);

  return (
    <Stack hasGutter>
      <MultiNicInfoAlert
        vms={vmsList}
        oVirtNicProfiles={oVirtNicProfiles}
        networkNames={networkNames}
      />
      <FieldBuilderTable
        headers={[
          {
            label: networkMapFieldLabels[NetworkMapFieldId.SourceNetwork],
            width: 45,
          },
          {
            label: networkMapFieldLabels[NetworkMapFieldId.TargetNetwork],
            width: 45,
          },
        ]}
        fieldRows={networkMappingFields.map((field, index) => ({
          ...field,
          inputs: [
            <SourceNetworkField
              fieldId={getNetworkMapFieldId(NetworkMapFieldId.SourceNetwork, index)}
              key={getNetworkMapFieldId(NetworkMapFieldId.SourceNetwork, index)}
              usedSourceNetworks={usedSourceNetworks}
              otherSourceNetworks={otherSourceNetworks}
            />,
            <TargetNetworkField
              fieldId={getNetworkMapFieldId(NetworkMapFieldId.TargetNetwork, index)}
              key={getNetworkMapFieldId(NetworkMapFieldId.TargetNetwork, index)}
              targetNetworks={targetNetworks}
              showIgnoreNetworkOption
              hideNonNadTargets={multiNicNetworkIds.has(field.sourceNetwork?.id ?? '')}
            />,
          ],
        }))}
        addButton={{
          isDisabled: isLoading || Boolean(loadError),
          label: t('Add mapping'),
          onClick: async () => {
            append({
              [NetworkMapFieldId.SourceNetwork]: defaultNetMapping[NetworkMapFieldId.SourceNetwork],
              [NetworkMapFieldId.TargetNetwork]: hasPodNetworkMappings(networkMappings)
                ? ignoreNetMapping[NetworkMapFieldId.TargetNetwork]
                : defaultNetMapping[NetworkMapFieldId.TargetNetwork],
            });

            await trigger();
          },
        }}
        removeButton={{
          isDisabled: () => networkMappingFields.length <= 1,
          onClick: (index) => {
            if (networkMappingFields.length > 1) {
              remove(index);
            }
          },
          tooltip: (index) => {
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
