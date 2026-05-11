import type { FC } from 'react';

import { ConsoleTimestamp } from '@components/ConsoleTimestamp/ConsoleTimestamp';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import { ExpandableRowContent, Tbody, Td, Tr } from '@patternfly/react-table';
import { EMPTY_MSG } from '@utils/constants';
import {
  ConversionModelGroupVersionKind,
  PodModelGroupVersionKind,
} from '@utils/crds/common/models';
import { getCreatedAt, getName, getNamespace } from '@utils/crds/common/selectors';
import {
  getConversionPhase,
  getConversionPodRef,
  getCriticalConditions,
  getInspectionResult,
} from '@utils/crds/conversion/selectors';
import type { V1beta1Conversion } from '@utils/crds/conversion/types';

import ConversionPhaseLabel from './ConversionPhaseLabel';
import InspectionRowExpandedContent from './InspectionRowExpandedContent';

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
            name={getName(conversion)}
            namespace={getNamespace(conversion)}
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
        {/* Spacer cell aligns content with the expand toggle column */}
        <Td />
        <Td noPadding colSpan={columnCount - 1}>
          {isExpanded && (
            <ExpandableRowContent>
              <InspectionRowExpandedContent
                criticalConditions={criticalConditions}
                inspectionResult={inspectionResult}
              />
            </ExpandableRowContent>
          )}
        </Td>
      </Tr>
    </Tbody>
  );
};

export default InspectionTableRow;
