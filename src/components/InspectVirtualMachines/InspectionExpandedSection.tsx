import { type Dispatch, type FC, type SetStateAction, useMemo } from 'react';

import { ConsoleTimestamp } from '@components/ConsoleTimestamp/ConsoleTimestamp';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import {
  Content,
  HelperText,
  HelperTextItem,
  Icon,
  Label,
  PageSection,
  Title,
} from '@patternfly/react-core';
import {
  BanIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  InProgressIcon,
  MinusCircleIcon,
} from '@patternfly/react-icons';
import {
  ExpandableRowContent,
  Table,
  TableVariant,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@patternfly/react-table';
import { EMPTY_MSG } from '@utils/constants';
import {
  ConversionModelGroupVersionKind,
  PodModelGroupVersionKind,
} from '@utils/crds/common/models';
import { CONVERSION_LABELS, CONVERSION_PHASE } from '@utils/crds/conversion/constants';
import {
  getConversionCreationTimestamp,
  getConversionPhase,
  getConversionPodRef,
  getCriticalConditions,
  getInspectionResult,
} from '@utils/crds/conversion/selectors';
import type { ConversionPhase, V1beta1Conversion } from '@utils/crds/conversion/types';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import InspectionResultsSection from './InspectionResultsSection';

import './InspectionExpandedSection.scss';

type PhaseConfig = {
  icon: JSX.Element;
  label: string;
  labelStatus?: 'danger' | 'info' | 'success' | 'warning';
};

const getPhaseConfig = (
  phase: ConversionPhase | undefined,
  t: ReturnType<typeof useForkliftTranslation>['t'],
): PhaseConfig => {
  switch (phase) {
    case CONVERSION_PHASE.SUCCEEDED:
      return {
        icon: <CheckCircleIcon />,
        label: t('Succeeded'),
        labelStatus: 'success',
      };
    case CONVERSION_PHASE.FAILED:
      return {
        icon: <ExclamationCircleIcon />,
        label: t('Failed'),
        labelStatus: 'danger',
      };
    case CONVERSION_PHASE.CANCELED:
      return { icon: <BanIcon />, label: t('Canceled') };
    case CONVERSION_PHASE.RUNNING:
      return {
        icon: <InProgressIcon />,
        label: t('Running'),
        labelStatus: 'info',
      };
    case CONVERSION_PHASE.PENDING:
    case undefined:
    default:
      return { icon: <MinusCircleIcon />, label: t('Pending') };
  }
};

type InspectionExpandedSectionProps = {
  conversions: V1beta1Conversion[];
  expandedRows: Set<string>;
  onToggleExpand: Dispatch<SetStateAction<Set<string>>>;
  vmId: string;
};

const COLUMN_COUNT = 5;

const InspectionExpandedSection: FC<InspectionExpandedSectionProps> = ({
  conversions,
  expandedRows,
  onToggleExpand,
  vmId,
}) => {
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

  const toggleExpand = (uid: string): void => {
    onToggleExpand((prev) => {
      const next = new Set(prev);
      if (next.has(uid)) next.delete(uid);
      else next.add(uid);
      return next;
    });
  };

  if (isEmpty(vmConversions)) {
    return (
      <div data-testid="inspections-section">
        <Title headingLevel="h4">{t('Inspections')}</Title>
        <PageSection hasBodyWrapper={false}>
          <HelperText>
            <HelperTextItem>{t('No inspections found for this virtual machine.')}</HelperTextItem>
          </HelperText>
        </PageSection>
      </div>
    );
  }

  return (
    <div data-testid="inspections-section">
      <Title headingLevel="h4">{t('Inspections')}</Title>
      <PageSection hasBodyWrapper={false}>
        <Table
          aria-label={t('Inspections')}
          variant={TableVariant.compact}
          className="forklift-inspections-table"
        >
          <Thead>
            <Tr>
              <Th screenReaderText={t('Expand')} />
              <Th>{t('Inspection name')}</Th>
              <Th>{t('Status')}</Th>
              <Th>{t('Pod')}</Th>
              <Th>{t('Created at')}</Th>
            </Tr>
          </Thead>
          {vmConversions.map((conversion, rowIndex) => {
            const uid = conversion.metadata?.uid ?? conversion.metadata?.name ?? '';
            const isExpanded = expandedRows.has(uid);
            const podRef = getConversionPodRef(conversion);
            const phase = getConversionPhase(conversion);
            const inspectionResult = getInspectionResult(conversion);
            const criticalConditions = getCriticalConditions(conversion);
            const phaseConfig = getPhaseConfig(phase, t);

            return (
              <Tbody key={uid} isExpanded={isExpanded}>
                <Tr>
                  <Td
                    expand={{
                      isExpanded,
                      onToggle: () => {
                        toggleExpand(uid);
                      },
                      rowIndex,
                    }}
                  />
                  <Td>
                    <ResourceLink
                      groupVersionKind={ConversionModelGroupVersionKind}
                      name={conversion.metadata?.name}
                      namespace={conversion.metadata?.namespace}
                    />
                  </Td>
                  <Td>
                    <Label
                      variant="outline"
                      status={phaseConfig.labelStatus}
                      icon={
                        <Icon isInline status={phaseConfig.labelStatus}>
                          {phaseConfig.icon}
                        </Icon>
                      }
                    >
                      {phaseConfig.label}
                    </Label>
                  </Td>
                  <Td>
                    {podRef?.name ? (
                      <ResourceLink
                        groupVersionKind={PodModelGroupVersionKind}
                        name={podRef.name}
                        namespace={podRef.namespace}
                      />
                    ) : (
                      EMPTY_MSG
                    )}
                  </Td>
                  <Td>
                    <ConsoleTimestamp
                      timestamp={getConversionCreationTimestamp(conversion)}
                      showGlobalIcon={false}
                    />
                  </Td>
                </Tr>
                <Tr isExpanded={isExpanded}>
                  <Td />
                  <Td noPadding colSpan={COLUMN_COUNT - 1}>
                    {isExpanded && (
                      <ExpandableRowContent>
                        {!isEmpty(criticalConditions) && (
                          <Content className="pf-v6-u-py-sm pf-v6-u-pl-xl">
                            {criticalConditions.map((condition, index) => (
                              <Content key={`${condition.type}-${index}`}>
                                {condition.message}
                              </Content>
                            ))}
                          </Content>
                        )}
                        {inspectionResult && <InspectionResultsSection result={inspectionResult} />}
                        {!inspectionResult && isEmpty(criticalConditions) && (
                          <Content className="pf-v6-u-py-md pf-v6-u-pl-xl">
                            <Content>{t('No results available yet.')}</Content>
                          </Content>
                        )}
                      </ExpandableRowContent>
                    )}
                  </Td>
                </Tr>
              </Tbody>
            );
          })}
        </Table>
      </PageSection>
    </div>
  );
};

export default InspectionExpandedSection;
