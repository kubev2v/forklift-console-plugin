import type { FC } from 'react';

import { Stack, StackItem } from '@patternfly/react-core';
import { ForkliftTrans, useForkliftTranslation } from '@utils/i18n';

import { POPOVER_ORDER, STATUS_DESCRIPTIONS } from './utils/inspectionStatusDescriptions';

const InspectionStatusColumnPopover: FC = () => {
  const { t } = useForkliftTranslation();

  return (
    <Stack hasGutter>
      <StackItem>
        <ForkliftTrans>
          The <strong>Inspection tool</strong> looks into the internal contents of your disks for
          potential issues.
        </ForkliftTrans>
      </StackItem>
      {POPOVER_ORDER.map((status) => {
        const { description, label } = STATUS_DESCRIPTIONS[status];
        return (
          <StackItem key={status}>
            <strong>{t(label)}:</strong> {t(description)}
          </StackItem>
        );
      })}
    </Stack>
  );
};

export default InspectionStatusColumnPopover;
