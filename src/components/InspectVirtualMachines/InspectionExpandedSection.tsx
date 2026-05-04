import { type FC, useMemo } from 'react';

import { ExpandableSection, PageSection, Stack, StackItem, Title } from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { CONVERSION_LABELS } from '@utils/crds/conversion/constants';
import {
  getConversionCompletionTime,
  getConversionCreationTimestamp,
  getConversionPhase,
  getConversionPodRef,
  getCriticalConditions,
  getInspectionResult,
} from '@utils/crds/conversion/selectors';
import type { V1beta1Conversion } from '@utils/crds/conversion/types';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import InspectionResultsSection from './InspectionResultsSection';
import InspectionStatusLabel from './InspectionStatusLabel';

type InspectionExpandedSectionProps = {
  conversions: V1beta1Conversion[];
  vmId: string;
};

const InspectionExpandedSection: FC<InspectionExpandedSectionProps> = ({ conversions, vmId }) => {
  const { t } = useForkliftTranslation();

  const vmConversions = useMemo(
    () =>
      conversions
        .filter((conversion) => conversion.metadata?.labels?.[CONVERSION_LABELS.VM_ID] === vmId)
        .sort(
          (first, second) =>
            new Date(second.metadata?.creationTimestamp ?? 0).getTime() -
            new Date(first.metadata?.creationTimestamp ?? 0).getTime(),
        ),
    [conversions, vmId],
  );

  if (isEmpty(vmConversions)) {
    return null;
  }

  const [latest] = vmConversions;
  const phase = getConversionPhase(latest);
  const podRef = getConversionPodRef(latest);
  const criticalConditions = getCriticalConditions(latest);
  const completionTime = getConversionCompletionTime(latest);
  const inspectionResult = getInspectionResult(latest);
  const olderRuns = vmConversions.slice(1);

  return (
    <Stack hasGutter>
      <StackItem>
        <Title headingLevel="h4">{t('Deep inspection')}</Title>
      </StackItem>

      <StackItem>
        <PageSection hasBodyWrapper={false}>
          <Table aria-label={t('Deep inspection details')} variant="compact">
            <Thead>
              <Tr>
                <Th width={20}>{t('Label')}</Th>
                <Th width={30}>{t('Value')}</Th>
              </Tr>
            </Thead>
            <Tbody>
              <Tr>
                <Td>{t('Status')}</Td>
                <Td>
                  <InspectionStatusLabel phase={phase} timestamp={completionTime} />
                </Td>
              </Tr>
              {podRef?.name && (
                <Tr>
                  <Td>{t('Pod')}</Td>
                  <Td>{podRef.namespace ? `${podRef.namespace}/${podRef.name}` : podRef.name}</Td>
                </Tr>
              )}
              {criticalConditions.map((condition, index) => (
                <Tr key={`${condition.type}-${index}`}>
                  <Td>{t('Error')}</Td>
                  <Td>{condition.message}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </PageSection>
      </StackItem>

      {inspectionResult && (
        <StackItem>
          <InspectionResultsSection result={inspectionResult} />
        </StackItem>
      )}

      {!isEmpty(olderRuns) && (
        <StackItem>
          <ExpandableSection
            data-testid={`previous-inspections-${vmId}`}
            toggleText={t('Previous inspection ({{count}})', { count: olderRuns.length })}
          >
            <Stack hasGutter>
              {olderRuns.map((run) => (
                <StackItem key={run.metadata?.uid}>
                  <InspectionStatusLabel
                    phase={getConversionPhase(run)}
                    timestamp={
                      getConversionCompletionTime(run) ?? getConversionCreationTimestamp(run)
                    }
                  />
                </StackItem>
              ))}
            </Stack>
          </ExpandableSection>
        </StackItem>
      )}
    </Stack>
  );
};

export default InspectionExpandedSection;
