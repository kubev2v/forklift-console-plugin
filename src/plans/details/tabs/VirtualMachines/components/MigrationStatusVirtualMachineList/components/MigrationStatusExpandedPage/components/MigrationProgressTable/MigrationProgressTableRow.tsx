import type { FC } from 'react';

import { ConsoleTimestamp } from '@components/ConsoleTimestamp/ConsoleTimestamp';
import type {
  IoK8sApiCoreV1Pod,
  V1beta1Plan,
  V1beta1PlanStatusMigrationVms,
} from '@forklift-ui/types';
import { Split, SplitItem } from '@patternfly/react-core';
import { Td, Tr } from '@patternfly/react-table';
import { isEmpty } from '@utils/helpers';

import { getPipelineStepDisplayName } from '../../../../utils/utils';
import { getPipelineProgressIcon } from '../../../utils/icon';

import MigrationProgressDescriptionCell from './MigrationProgressDescriptionCell';
import MigrationStepFailurePanel from './MigrationStepFailurePanel';

type MigrationProgressTableRowProps = {
  inPostMigrationSetup: boolean;
  pipe: NonNullable<V1beta1PlanStatusMigrationVms['pipeline']>[number];
  plan: V1beta1Plan;
  pods?: IoK8sApiCoreV1Pod[];
  targetNamespace?: string;
  vmCreated?: boolean;
  vmErrorPhase?: string;
  vmName?: string;
};

const MigrationProgressTableRow: FC<MigrationProgressTableRowProps> = ({
  inPostMigrationSetup,
  pipe,
  plan,
  pods,
  targetNamespace,
  vmCreated,
  vmErrorPhase,
  vmName,
}) => {
  const displayName = getPipelineStepDisplayName(pipe?.name);

  return (
    <Tr key={pipe?.name}>
      <Td modifier="nowrap">
        <Split hasGutter>
          <SplitItem>{getPipelineProgressIcon(pipe)}</SplitItem>
          <SplitItem>{displayName}</SplitItem>
        </Split>
      </Td>
      <Td>
        <MigrationProgressDescriptionCell
          displayName={displayName}
          inPostMigrationSetup={inPostMigrationSetup}
          pipe={pipe}
          plan={plan}
          targetNamespace={targetNamespace}
          vmCreated={vmCreated}
          vmName={vmName}
        />
        {pipe?.error?.reasons && !isEmpty(pipe.error.reasons) && (
          <MigrationStepFailurePanel
            pipelineStepName={pipe.name}
            pods={pods}
            reasons={pipe.error.reasons}
            vmErrorPhase={vmErrorPhase}
          />
        )}
      </Td>
      <Td>
        <ConsoleTimestamp showGlobalIcon={false} timestamp={pipe?.completed ?? null} />
      </Td>
    </Tr>
  );
};

export default MigrationProgressTableRow;
