import { type FC, useMemo } from 'react';

import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  ExpandableSection,
  Flex,
  FlexItem,
  Stack,
  StackItem,
  Timestamp,
  Title,
} from '@patternfly/react-core';
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
  const creationTimestamp = getConversionCreationTimestamp(latest);
  const completionTime = getConversionCompletionTime(latest);
  const inspectionResult = getInspectionResult(latest);
  const olderRuns = vmConversions.slice(1);

  return (
    <Stack hasGutter>
      <StackItem>
        <Title headingLevel="h4">{t('Deep inspection')}</Title>
      </StackItem>

      <StackItem>
        <DescriptionList isHorizontal isCompact>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Status')}</DescriptionListTerm>
            <DescriptionListDescription>
              <InspectionStatusLabel
                phase={phase}
                timestamp={completionTime ?? creationTimestamp}
              />
            </DescriptionListDescription>
          </DescriptionListGroup>

          {creationTimestamp && (
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Started')}</DescriptionListTerm>
              <DescriptionListDescription>
                <Timestamp date={new Date(creationTimestamp)} />
              </DescriptionListDescription>
            </DescriptionListGroup>
          )}

          {completionTime && (
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Completed')}</DescriptionListTerm>
              <DescriptionListDescription>
                <Timestamp date={new Date(completionTime)} />
              </DescriptionListDescription>
            </DescriptionListGroup>
          )}

          {podRef?.name && (
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Pod')}</DescriptionListTerm>
              <DescriptionListDescription>
                {podRef.namespace ? `${podRef.namespace}/${podRef.name}` : podRef.name}
              </DescriptionListDescription>
            </DescriptionListGroup>
          )}
        </DescriptionList>
      </StackItem>

      {!isEmpty(criticalConditions) && (
        <StackItem>
          <Stack>
            {criticalConditions.map((condition, index) => (
              <StackItem key={`${condition.type}-${index}`}>{condition.message}</StackItem>
            ))}
          </Stack>
        </StackItem>
      )}

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
                  <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapMd' }}>
                    <FlexItem>
                      <InspectionStatusLabel
                        phase={getConversionPhase(run)}
                        timestamp={
                          getConversionCompletionTime(run) ?? getConversionCreationTimestamp(run)
                        }
                      />
                    </FlexItem>
                  </Flex>
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
