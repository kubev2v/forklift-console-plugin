import type { FC } from 'react';
import { useModal } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';
import { PageHeadings } from 'src/modules/Providers/utils/components/DetailsPage/PageHeadings';
import PlanCutoverMigrationModal from 'src/plans/actions/components/CutoverModal/PlanCutoverMigrationModal';
import PlanActionsDropdown from 'src/plans/actions/PlanActionsDropdown';

import { PlanModel } from '@kubev2v/types';
import { Button, ButtonVariant, Level, LevelItem } from '@patternfly/react-core';
import { CalendarAltIcon } from '@patternfly/react-icons';
import { getPlanIsWarm } from '@utils/crds/plans/selectors';
import { useForkliftTranslation } from '@utils/i18n';

import { usePlan } from '../../hooks/usePlan';
import PlanStatusLabel from '../PlanStatus/PlanStatusLabel';
import { isPlanArchived, isPlanExecuting } from '../PlanStatus/utils/utils';

import PlanAlerts from './components/PlanAlerts/PlanAlerts';

type PlanPageHeaderProps = {
  name: string;
  namespace: string;
};

const PlanPageHeader: FC<PlanPageHeaderProps> = ({ name, namespace }) => {
  const { t } = useForkliftTranslation();
  const { plan } = usePlan(name, namespace);
  const { showModal } = useModal();

  const canSetCutover = getPlanIsWarm(plan) && isPlanExecuting(plan) && !isPlanArchived(plan);
  return (
    <PageHeadings
      model={PlanModel}
      obj={plan}
      namespace={namespace}
      status={<PlanStatusLabel plan={plan} />}
      actions={
        <Level hasGutter>
          <LevelItem>
            {canSetCutover && (
              <Button
                isInline
                variant={ButtonVariant.primary}
                onClick={() => {
                  showModal(<PlanCutoverMigrationModal plan={plan} />);
                }}
                icon={<CalendarAltIcon />}
                iconPosition="right"
              >
                {t('Schedule cutover')}
              </Button>
            )}
          </LevelItem>
          <LevelItem>
            <PlanActionsDropdown plan={plan} />
          </LevelItem>
        </Level>
      }
    >
      <PlanAlerts plan={plan} />
    </PageHeadings>
  );
};

export default PlanPageHeader;
