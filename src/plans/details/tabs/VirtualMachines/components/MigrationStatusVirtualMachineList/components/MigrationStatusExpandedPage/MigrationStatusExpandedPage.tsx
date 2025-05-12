import type { FC } from 'react';
import type { RowProps } from 'src/components/common/TableView/types';
import PlanWarmLabel from 'src/plans/details/components/PlanWarmLabel';
import { useForkliftTranslation } from 'src/utils/i18n';

import ExpandableSectionHeading from '@components/ExpandableSectionHeading/ExpandableSectionHeading';
import { PageSection, Stack } from '@patternfly/react-core';

import type { MigrationStatusVirtualMachinePageData } from '../../utils/types';
import { isVirtualMachineCreationCompleted } from '../../utils/utils';

import MigrationDataVolumesTable from './components/MigrationDataVolumesTable';
import MigrationJobsTable from './components/MigrationJobsTable';
import MigrationPodsTable from './components/MigrationPodsTable';
import MigrationProgressTable from './components/MigrationProgressTable';
import MigrationPVCsTable from './components/MigrationPVCsTable';
import MigrationVirtualMachineTable from './components/MigrationVirtualMachineTable';

import './MigrationStatusExpandedPage.scss';

const MigrationStatusExpandedPage: FC<RowProps<MigrationStatusVirtualMachinePageData>> = ({
  resourceData,
}) => {
  const { t } = useForkliftTranslation();

  const { dvs, isWarm, jobs, pods, pvcs, statusVM, targetNamespace } = resourceData;
  const pipeline = statusVM?.pipeline ?? [];
  const vmCreated = isVirtualMachineCreationCompleted(statusVM);

  return (
    <>
      <PageSection>
        <ExpandableSectionHeading
          section={
            <MigrationProgressTable
              pipeline={pipeline}
              vmCreated={vmCreated}
              targetNamespace={targetNamespace}
              vmName={statusVM?.name}
            />
          }
          sectionTitle={
            <>
              {t('Migration progress')} <PlanWarmLabel isWarm={isWarm} />
            </>
          }
          initialExpanded
        />
      </PageSection>
      <PageSection>
        <ExpandableSectionHeading
          section={
            <Stack hasGutter>
              <MigrationVirtualMachineTable
                vmCreated={vmCreated}
                statusVM={statusVM}
                targetNamespace={targetNamespace}
              />
              <MigrationPodsTable pods={pods} />
              <MigrationPVCsTable pvcs={pvcs} />
              <MigrationJobsTable jobs={jobs} />
              <MigrationDataVolumesTable dvs={dvs} />
            </Stack>
          }
          sectionTitle={t('Migration resources')}
        />
      </PageSection>
    </>
  );
};

export default MigrationStatusExpandedPage;
