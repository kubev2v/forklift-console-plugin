import type { FC } from 'react';
import type { RowProps } from 'src/components/common/TableView/types';
import { ModalHOC } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';
import PlanMigrationTypeLabel from 'src/plans/details/components/PlanMigrationTypeLabel/PlanMigrationTypeLabel';
import { getPlanMigrationType } from 'src/plans/details/utils/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import ExpandableSectionHeading from '@components/ExpandableSectionHeading/ExpandableSectionHeading';
import { PageSection, Stack } from '@patternfly/react-core';

import type { MigrationStatusVirtualMachinePageData } from '../../utils/types';
import { isVirtualMachineCreationCompleted } from '../../utils/utils';

import MigrationDataVolumesTable from './components/MigrationDataVolumesTable';
import MigrationJobsTable from './components/MigrationJobsTable';
import MigrationPodsTable from './components/MigrationPodsTable';
import MigrationProgressTable from './components/MigrationProgressTable/MigrationProgressTable';
import MigrationPVCsTable from './components/MigrationPVCsTable';
import MigrationVirtualMachineTable from './components/MigrationVirtualMachineTable';

import './MigrationStatusExpandedPage.scss';

const MigrationStatusExpandedPage: FC<RowProps<MigrationStatusVirtualMachinePageData>> = ({
  resourceData,
}) => {
  const { t } = useForkliftTranslation();

  const { dvs, jobs, plan, pods, pvcs, statusVM, targetNamespace } = resourceData;
  const vmCreated = isVirtualMachineCreationCompleted(statusVM);

  return (
    <ModalHOC>
      <PageSection hasBodyWrapper={false}>
        <ExpandableSectionHeading
          section={
            <MigrationProgressTable
              plan={plan}
              statusVM={statusVM}
              vmCreated={vmCreated}
              targetNamespace={targetNamespace}
              vmName={statusVM?.name}
            />
          }
          sectionTitle={
            <>
              {t('Migration progress')}{' '}
              <PlanMigrationTypeLabel migrationType={getPlanMigrationType(plan)} />
            </>
          }
          initialExpanded
        />
      </PageSection>
      <PageSection hasBodyWrapper={false}>
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
    </ModalHOC>
  );
};

export default MigrationStatusExpandedPage;
