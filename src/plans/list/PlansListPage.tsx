import { type FC, useCallback, useMemo } from 'react';
import { loadUserSettings } from 'src/components/common/Page/userSettings';
import { StandardPageWithSelection } from 'src/components/page/StandardPageWithSelection';
import LearningExperienceDrawer from 'src/onlineHelp/learningExperienceDrawer/LearningExperienceDrawer';
import useGetDeleteAndEditAccessReview from 'src/utils/hooks/useGetDeleteAndEditAccessReview';
import { useForkliftTranslation } from 'src/utils/i18n';

import type { GlobalActionToolbarProps } from '@components/common/utils/types';
import { PlanModel, PlanModelGroupVersionKind, type V1beta1Plan } from '@forklift-ui/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { toTypedWatchResult } from '@utils/hooks/toTypedWatchResult';

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

const selectedIds: string[] = [];

const onSelect = () => undefined;

const PlansListPage: FC<PlansListPageProps> = ({ namespace }) => {
  const { t } = useForkliftTranslation();

  const userSettings = useMemo(() => loadUserSettings({ pageId: 'Plans' }), []);

  const [plans, plansLoaded, plansLoadError] = toTypedWatchResult(
    useK8sWatchResource<V1beta1Plan[]>({
      groupVersionKind: PlanModelGroupVersionKind,
      isList: true,
      namespace,
      namespaced: true,
    }),
  );

  const { canCreate } = useGetDeleteAndEditAccessReview({ model: PlanModel, namespace });

  const GlobalActionToolbarItems = useMemo<FC<GlobalActionToolbarProps<V1beta1Plan>>[]>(
    () => [(props) => <PlansBulkActionsDropdown {...props} namespace={namespace} />],
    [namespace],
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

  const postFilterData = useCallback(
    (data: V1beta1Plan[], selectedFilters: Record<string, string[]>) =>
      selectedFilters[PlanTableResourceId.Archived]?.[0] === 'true'
        ? data
        : data.filter((plan) => !plan?.spec?.archived),
    [],
  );

  return (
    <LearningExperienceDrawer>
      <StandardPageWithSelection
        addButton={
          <PlansAddButton canCreate={canCreate} namespace={namespace} testId="create-plan-button" />
        }
        canSelect={canSelectPlanForBulkActions}
        cell={PlanRow}
        customNoResultsFound={<PlansEmptyState namespace={namespace} />}
        data-testid="plans-list"
        dataSource={[plans || [], plansLoaded, plansLoadError]}
        fieldsMetadata={planFields}
        getSelectDisabledReason={getSelectDisabledReason}
        GlobalActionToolbarItems={GlobalActionToolbarItems}
        namespace={namespace}
        onSelect={onSelect}
        postFilterData={postFilterData}
        selectedIds={selectedIds}
        shouldShowLearningExperienceButton
        title={t('Migration plans')}
        titleHelpContent={t(
          'A migration plan is a strategy for moving VMs from 1 environment to OpenShift Virtualization. It lets you group VMs to be migrated together or with the same migration configuration.',
        )}
        toId={getPlanRowId}
        userSettings={userSettings}
      />
    </LearningExperienceDrawer>
  );
};

export default PlansListPage;
