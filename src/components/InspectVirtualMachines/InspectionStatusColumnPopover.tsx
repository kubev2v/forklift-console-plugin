import type { FC } from 'react';

import { Flex, FlexItem, Stack, StackItem } from '@patternfly/react-core';
import type { InspectionStatus } from '@utils/crds/conversion/constants';
import { INSPECTION_STATUS } from '@utils/crds/conversion/constants';
import { ForkliftTrans } from '@utils/i18n';

const STATUS_DESCRIPTIONS: Record<InspectionStatus, JSX.Element> = {
  [INSPECTION_STATUS.CANCELED]: (
    <ForkliftTrans>
      <strong>Canceled:</strong> The inspection was canceled.
    </ForkliftTrans>
  ),
  [INSPECTION_STATUS.FAILED]: (
    <ForkliftTrans>
      <strong>Failed:</strong> The inspection itself failed.
    </ForkliftTrans>
  ),
  [INSPECTION_STATUS.INSPECTION_PASSED]: (
    <ForkliftTrans>
      <strong>Inspection passed:</strong> The inspection was completed and no issues were found.
    </ForkliftTrans>
  ),
  [INSPECTION_STATUS.ISSUES_FOUND]: (
    <ForkliftTrans>
      <strong>Issues found:</strong> The inspection was completed and issues were found. Issues are
      grouped by severity. Click a severity badge to see the individual concerns.
    </ForkliftTrans>
  ),
  [INSPECTION_STATUS.NOT_INSPECTED]: (
    <ForkliftTrans>
      <strong>Not inspected:</strong> Inspection has not been requested for this VM.
    </ForkliftTrans>
  ),
  [INSPECTION_STATUS.PENDING]: (
    <ForkliftTrans>
      <strong>Pending:</strong> Inspection was requested but has not started yet.
    </ForkliftTrans>
  ),
  [INSPECTION_STATUS.RUNNING]: (
    <ForkliftTrans>
      <strong>Running:</strong> The inspection is in progress.
    </ForkliftTrans>
  ),
};

const POPOVER_ORDER: InspectionStatus[] = [
  INSPECTION_STATUS.NOT_INSPECTED,
  INSPECTION_STATUS.PENDING,
  INSPECTION_STATUS.RUNNING,
  INSPECTION_STATUS.FAILED,
  INSPECTION_STATUS.ISSUES_FOUND,
  INSPECTION_STATUS.INSPECTION_PASSED,
  INSPECTION_STATUS.CANCELED,
];

const InspectionStatusColumnPopover: FC = () => (
  <Stack hasGutter>
    <StackItem>
      <ForkliftTrans>
        The <strong>Inspection tool</strong> looks into the internal contents of your disks for
        potential issues.
      </ForkliftTrans>
    </StackItem>
    {POPOVER_ORDER.map((status) => (
      <StackItem key={status}>
        <Flex flexWrap={{ default: 'nowrap' }} alignItems={{ default: 'alignItemsCenter' }}>
          <FlexItem>{STATUS_DESCRIPTIONS[status]}</FlexItem>
        </Flex>
      </StackItem>
    ))}
  </Stack>
);

export default InspectionStatusColumnPopover;
