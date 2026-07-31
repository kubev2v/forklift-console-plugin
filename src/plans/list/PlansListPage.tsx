import { type FC, useCallback, useMemo, useState } from 'react';
import { loadUserSettings } from 'src/components/common/Page/userSettings';
import { StandardPageWithSelection } from 'src/components/page/StandardPageWithSelection';
import LearningExperienceDrawer from 'src/onlineHelp/learningExperienceDrawer/LearningExperienceDrawer';
import useGetDeleteAndEditAccessReview from 'src/utils/hooks/useGetDeleteAndEditAccessReview';
import { useForkliftTranslation } from 'src/utils/i18n';

import { PlanModel, PlanModelGroupVersionKind, type V1beta1Plan } from '@forklift-ui/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

import { getPlanRowId } from './components/BulkPlanActions/utils';
import {
  PLANS_BULK_TOOLBAR_ACTIONS,
  PlansBulkToolbarContext,
} from './components/BulkPlanActions/PlansBulkToolbarActions';
import PlanRow from './components/PlanRow/PlanRow';
import PlansAddButton from './components/PlansAddButton';
import PlansEmptyState from './components/PlansEmptyState';
import { PlanTableResourceId } from './utils/constants';
import { planFields } from './utils/planFields';

import './PlansListPage.style.css';

type PlansListPageProps = {
  namespace: string;
};

const PlansListPage: FC<PlansListPageProps> = ({ namespace }) => {
  const { t } = useForkliftTranslation();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const userSettings = useMemo(() => loadUserSettings({ pageId: 'Plans' }), []);

  const [plans, plansLoaded, plansLoadError] = useK8sWatchResource<V1beta1Plan[]>({
    groupVersionKind: PlanModelGroupVersionKind,
    isList: true,
    namespace,
    namespaced: true,
  });

  const { canCreate, canDelete } = useGetDeleteAndEditAccessReview({
    model: PlanModel,
    namespace,
  });

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  const bulkToolbarContextValue = useMemo(
    () => ({
      canDelete,
      onComplete: clearSelection,
      plans: plans ?? [],
    }),
    [canDelete, clearSelection, plans],
  );

  return (
    <LearningExperienceDrawer>
      <PlansBulkToolbarContext.Provider value={bulkToolbarContextValue}>
        <StandardPageWithSelection
          data-testid="plans-list"
          addButton={
            <PlansAddButton testId="create-plan-button" namespace={namespace} canCreate={canCreate} />
          }
          dataSource={[plans || [], plansLoaded, plansLoadError]}
          cell={PlanRow}
          fieldsMetadata={planFields}
          namespace={namespace}
          title={t('Migration plans')}
          titleHelpContent={t(
            'A migration plan is a strategy for moving VMs from 1 environment to OpenShift Virtualization. It lets you group VMs to be migrated together or with the same migration configuration.',
          )}
          userSettings={userSettings}
          customNoResultsFound={<PlansEmptyState namespace={namespace} />}
          postFilterData={(data, selectedFilters) =>
            selectedFilters[PlanTableResourceId.Archived]?.[0] === 'true'
              ? data
              : data.filter((plan) => !plan?.spec?.archived)
          }
          shouldShowLearningExperienceButton
          toId={getPlanRowId}
          selectedIds={selectedIds}
          onSelect={setSelectedIds}
          GlobalActionToolbarItems={PLANS_BULK_TOOLBAR_ACTIONS}
        />
      </PlansBulkToolbarContext.Provider>
    </LearningExperienceDrawer>
  );
};

export default PlansListPage;
