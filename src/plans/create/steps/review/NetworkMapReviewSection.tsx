import type { FC } from 'react';
import { useWatch } from 'react-hook-form';

import ExpandableReviewSection from '@components/ExpandableReviewSection/ExpandableReviewSection';
import { useWizardContext } from '@patternfly/react-core';
import { Table, TableVariant, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import { planStepNames, PlanWizardStepId } from '../../constants';
import { useCreatePlanFormContext } from '../../hooks/useCreatePlanFormContext';
import { defaultNetMapping, NetworkMapFieldId } from '../network-map/constants';

const NetworkMapReviewSection: FC = () => {
  const { t } = useForkliftTranslation();
  const { goToStepById } = useWizardContext();
  const { control } = useCreatePlanFormContext();
  const networkMap = useWatch({ control, name: NetworkMapFieldId.NetworkMap });
  const noMappingsSelected =
    isEmpty(networkMap) ||
    (networkMap.length === 1 &&
      JSON.stringify(networkMap[0]) === JSON.stringify(defaultNetMapping));

  return (
    <ExpandableReviewSection
      title={planStepNames[PlanWizardStepId.NetworkMap]}
      onEditClick={() => {
        goToStepById(PlanWizardStepId.NetworkMap);
      }}
    >
      {noMappingsSelected ? (
        t('No network mappings selected')
      ) : (
        <Table aria-label="Network map review table" variant={TableVariant.compact}>
          <Thead>
            <Tr>
              <Th width={50}>{t('Source network')}</Th>
              <Th width={50}>{t('Target network')}</Th>
            </Tr>
          </Thead>
          <Tbody>
            {networkMap.map((mapping) => {
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
      )}
    </ExpandableReviewSection>
  );
};

export default NetworkMapReviewSection;
