import { type FC, useMemo } from 'react';
import { loadUserSettings } from 'src/components/common/Page/userSettings';
import StandardPage from 'src/components/page/StandardPage';
import useGetDeleteAndEditAccessReview from 'src/modules/Providers/hooks/useGetDeleteAndEditAccessReview';
import { useForkliftTranslation } from 'src/utils/i18n';

import { INITIAL_PAGE } from '@components/page/utils/constants';
import { PlanModel, PlanModelGroupVersionKind, type V1beta1Plan } from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

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

  const userSettings = useMemo(() => loadUserSettings({ pageId: 'Plans' }), []);

  const [plans, plansLoaded, plansLoadError] = useK8sWatchResource<V1beta1Plan[]>({
    groupVersionKind: PlanModelGroupVersionKind,
    isList: true,
    namespace,
    namespaced: true,
  });

  const { canCreate } = useGetDeleteAndEditAccessReview({
    model: PlanModel,
    namespace,
  });

  return (
    <StandardPage
      data-testid="plans-list"
      addButton={
        <PlansAddButton testId="create-plan-button" namespace={namespace} canCreate={canCreate} />
      }
      dataSource={[plans || [], plansLoaded, plansLoadError]}
      RowMapper={PlanRow}
      fieldsMetadata={planFields}
      namespace={namespace}
      title={t('Migration plans')}
      titleHelpContent={t(
        'A migration plan is a strategy for moving VMs from 1 environment to OpenShift Virtualization. It lets you group VMs to be migrated together or with the same migration configuration.',
      )}
      userSettings={userSettings}
      customNoResultsFound={<PlansEmptyState namespace={namespace} />}
      page={INITIAL_PAGE}
      postFilterData={(data, selectedFilters) =>
        selectedFilters[PlanTableResourceId.Archived]?.[0] === 'true'
          ? data
          : data.filter((plan) => !plan?.spec?.archived)
      }
    />
  );
};

export default PlansListPage;
