import { type FC, useMemo } from 'react';
import { useWatch } from 'react-hook-form';

import ExpandableReviewSection from '@components/ExpandableReviewSection/ExpandableReviewSection';
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Stack,
  useWizardContext,
} from '@patternfly/react-core';
import { Table, TableVariant, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import { planStepNames, PlanWizardStepId } from '../../constants';
import { useCreatePlanFormContext } from '../../hooks/useCreatePlanFormContext';
import { defaultNetMapping, NetworkMapFieldId, NetworkMapType } from '../network-map/constants';

const NetworkMapReviewSectionInner: FC = () => {
  const { t } = useForkliftTranslation();
  const { control } = useCreatePlanFormContext();

  const [netMapType, networkMap, existingNetMap, netMapName] = useWatch({
    control,
    name: [
      NetworkMapFieldId.NetworkMapType,
      NetworkMapFieldId.NetworkMap,
      NetworkMapFieldId.ExistingNetworkMap,
      NetworkMapFieldId.NetworkMapName,
    ],
  });

  const noMappingsSelected = useMemo(() => {
    return (
      isEmpty(networkMap) ||
      (networkMap.length === 1 &&
        JSON.stringify(networkMap[0]) === JSON.stringify(defaultNetMapping))
    );
  }, [networkMap]);

  const networkMapTable = useMemo(() => {
    if (!networkMap) return null;

    return (
      <Table aria-label="Network map review table" variant={TableVariant.compact}>
        <Thead>
          <Tr>
            <Th width={50}>{t('Source network')}</Th>
            <Th width={50}>{t('Target network')}</Th>
          </Tr>
        </Thead>

        <Tbody>
          {networkMap.map((mapping) => {
            // Only render rows that have both source and target network names
            if (
              mapping[NetworkMapFieldId.SourceNetwork].name &&
              mapping[NetworkMapFieldId.TargetNetwork].name
            ) {
              return (
                <Tr key={mapping[NetworkMapFieldId.SourceNetwork].name}>
                  <Td dataLabel={NetworkMapFieldId.SourceNetwork}>
                    {mapping[NetworkMapFieldId.SourceNetwork].name}
                  </Td>
                  <Td dataLabel={NetworkMapFieldId.TargetNetwork}>
                    {mapping[NetworkMapFieldId.TargetNetwork].name}
                  </Td>
                </Tr>
              );
            }

            return null;
          })}
        </Tbody>
      </Table>
    );
  }, [networkMap, t]);

  if (netMapType === NetworkMapType.Existing) {
    return (
      <DescriptionList isHorizontal horizontalTermWidthModifier={{ default: '18ch' }}>
        <DescriptionListGroup>
          <DescriptionListTerm>{t('Network map')}</DescriptionListTerm>
          <DescriptionListDescription>{existingNetMap?.metadata?.name}</DescriptionListDescription>
        </DescriptionListGroup>
      </DescriptionList>
    );
  }

  if (noMappingsSelected) {
    return <>{t('No network mappings selected')}</>;
  }

  if (netMapName) {
    return (
      <Stack hasGutter>
        <DescriptionList isHorizontal horizontalTermWidthModifier={{ default: '18ch' }}>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Network map name')}</DescriptionListTerm>
            <DescriptionListDescription>{netMapName}</DescriptionListDescription>
          </DescriptionListGroup>
        </DescriptionList>

        {networkMapTable}
      </Stack>
    );
  }

  return networkMapTable;
};

const NetworkMapReviewSection: FC = () => {
  const { goToStepById } = useWizardContext();

  return (
    <ExpandableReviewSection
      title={planStepNames[PlanWizardStepId.NetworkMap]}
      onEditClick={() => {
        goToStepById(PlanWizardStepId.NetworkMap);
      }}
    >
      <NetworkMapReviewSectionInner />
    </ExpandableReviewSection>
  );
};

export default NetworkMapReviewSection;
