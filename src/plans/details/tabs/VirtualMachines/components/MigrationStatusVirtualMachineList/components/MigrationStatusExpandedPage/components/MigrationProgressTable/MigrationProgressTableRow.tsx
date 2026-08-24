import type { FC } from 'react';

import { ConsoleTimestamp } from '@components/ConsoleTimestamp/ConsoleTimestamp';
import type { V1beta1Plan, V1beta1PlanStatusMigrationVms } from '@forklift-ui/types';
import { Split, SplitItem } from '@patternfly/react-core';
import { Td, Tr } from '@patternfly/react-table';

import { getPipelineStepDisplayName } from '../../../../utils/utils';
import { getPipelineProgressIcon } from '../../../utils/icon';

import MigrationProgressDescriptionCell from './MigrationProgressDescriptionCell';

type MigrationProgressTableRowProps = {
  inPostMigrationSetup: boolean;
  pipe: NonNullable<V1beta1PlanStatusMigrationVms['pipeline']>[number];
  plan: V1beta1Plan;
  targetNamespace?: string;
  vmCreated?: boolean;
  vmName?: string;
};

const MigrationProgressTableRow: FC<MigrationProgressTableRowProps> = ({
  inPostMigrationSetup,
  pipe,
  plan,
  targetNamespace,
  vmCreated,
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
      </Td>
      <Td>
        <ConsoleTimestamp showGlobalIcon={false} timestamp={pipe?.completed ?? null} />
      </Td>
    </Tr>
  );
};

export default MigrationProgressTableRow;
