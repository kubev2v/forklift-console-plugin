import type { FC } from 'react';

import { ConsoleTimestamp } from '@components/ConsoleTimestamp/ConsoleTimestamp';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import { Content } from '@patternfly/react-core';
import { ExpandableRowContent, Tbody, Td, Tr } from '@patternfly/react-table';
import { EMPTY_MSG } from '@utils/constants';
import {
  ConversionModelGroupVersionKind,
  PodModelGroupVersionKind,
} from '@utils/crds/common/models';
import { getCreatedAt } from '@utils/crds/common/selectors';
import {
  getConversionPhase,
  getConversionPodRef,
  getCriticalConditions,
  getInspectionResult,
} from '@utils/crds/conversion/selectors';
import type { V1beta1Conversion } from '@utils/crds/conversion/types';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import ConversionPhaseLabel from './ConversionPhaseLabel';
import InspectionResultsSection from './InspectionResultsSection';

type InspectionTableRowProps = {
  columnCount: number;
  conversion: V1beta1Conversion;
  isExpanded: boolean;
  onToggle: () => void;
  rowIndex: number;
};

const InspectionTableRow: FC<InspectionTableRowProps> = ({
  columnCount,
  conversion,
  isExpanded,
  onToggle,
  rowIndex,
}) => {
  const { t } = useForkliftTranslation();
  const podRef = getConversionPodRef(conversion);
  const phase = getConversionPhase(conversion);
  const inspectionResult = getInspectionResult(conversion);
  const criticalConditions = getCriticalConditions(conversion);

  return (
    <Tbody isExpanded={isExpanded}>
      <Tr>
        <Td expand={{ isExpanded, onToggle, rowIndex }} />
        <Td>
          <ResourceLink
            groupVersionKind={ConversionModelGroupVersionKind}
            name={conversion.metadata?.name}
            namespace={conversion.metadata?.namespace}
          />
        </Td>
        <Td>
          <ConversionPhaseLabel phase={phase} />
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
          <ConsoleTimestamp timestamp={getCreatedAt(conversion)} showGlobalIcon={false} />
        </Td>
      </Tr>
      <Tr isExpanded={isExpanded}>
        <Td />
        <Td noPadding colSpan={columnCount - 1}>
          {isExpanded && (
            <ExpandableRowContent>
              {!isEmpty(criticalConditions) && (
                <Content className="pf-v6-u-py-sm pf-v6-u-pl-xl">
                  {criticalConditions.map((condition, index) => (
                    <Content key={`${condition.type}-${index}`}>{condition.message}</Content>
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
};

export default InspectionTableRow;
