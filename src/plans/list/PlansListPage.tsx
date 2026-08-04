import { type FC, useCallback, useMemo, useRef, useState } from 'react';
import { loadUserSettings } from 'src/components/common/Page/userSettings';
import { StandardPageWithSelection } from 'src/components/page/StandardPageWithSelection';
import LearningExperienceDrawer from 'src/onlineHelp/learningExperienceDrawer/LearningExperienceDrawer';
import useGetDeleteAndEditAccessReview from 'src/utils/hooks/useGetDeleteAndEditAccessReview';
import { useForkliftTranslation } from 'src/utils/i18n';

import type { GlobalActionToolbarProps } from '@components/common/utils/types';
import { PlanModel, PlanModelGroupVersionKind, type V1beta1Plan } from '@forklift-ui/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

import PlansBulkActionsDropdown from './components/BulkPlanActions/PlansBulkActionsDropdown';
import {
  canSelectPlanForBulkActions,
  getPlanRowId,
  isPlanRunningOrPending,
} from './components/BulkPlanActions/utils';
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

  const { canCreate, canDelete, canPatch } = useGetDeleteAndEditAccessReview({
    model: PlanModel,
    namespace,
  });

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  const bulkActionsRef = useRef({
    canDelete,
    canPatch,
    onComplete: clearSelection,
    plans: plans ?? [],
  });
  bulkActionsRef.current = {
    canDelete,
    canPatch,
    onComplete: clearSelection,
    plans: plans ?? [],
  };

  const GlobalActionToolbarItems = useMemo<FC<GlobalActionToolbarProps<V1beta1Plan>>[]>(
    () => [(props) => <PlansBulkActionsDropdown {...props} {...bulkActionsRef.current} />],
    [],
  );

  const getSelectDisabledReason = useCallback(
    (plan: V1beta1Plan) => {
      if (isPlanRunningOrPending(plan)) {
        return t('Running or pending plans cannot be selected for bulk archive or delete.');
      }
      return undefined;
    },
    [t],
  );

  return (
    <LearningExperienceDrawer>
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
        canSelect={canSelectPlanForBulkActions}
        getSelectDisabledReason={getSelectDisabledReason}
        GlobalActionToolbarItems={GlobalActionToolbarItems}
      />
    </LearningExperienceDrawer>
  );
};

export default PlansListPage;
