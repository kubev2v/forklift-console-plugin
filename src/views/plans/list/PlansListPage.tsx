import type { FC } from 'react';
import { loadUserSettings } from 'src/components/common/Page/userSettings';
import StandardPage from 'src/components/page/StandardPage';
import useGetDeleteAndEditAccessReview from 'src/modules/Providers/hooks/useGetDeleteAndEditAccessReview';
import { ModalHOC } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';
import { useForkliftTranslation } from 'src/utils/i18n';

import { PlanModel, PlanModelGroupVersionKind, type V1beta1Plan } from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

import PlansAddButton from '../../../modules/Plans/components/PlansAddButton';
import PlansEmptyState from '../../../modules/Plans/components/PlansEmptyState';

import PlanRow from './components/PlanRow/PlanRow';
import { planFields } from './utils/planFields';

import './PlansListPage.style.css';

type PlansListPageProps = {
  namespace: string;
};

const PlansListPage: FC<PlansListPageProps> = ({ namespace }) => {
  const { t } = useForkliftTranslation();

  const userSettings = loadUserSettings({ pageId: 'Plans' });

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
    <ModalHOC>
      <StandardPage
        data-testid="network-maps-list"
        {...(canCreate && {
          addButton: <PlansAddButton dataTestId="add-network-map-button" namespace={namespace} />,
        })}
        dataSource={[plans || [], plansLoaded, plansLoadError]}
        RowMapper={PlanRow}
        fieldsMetadata={planFields}
        namespace={namespace}
        title={t('Plans')}
        userSettings={userSettings}
        customNoResultsFound={<PlansEmptyState namespace={namespace} />}
        page={1}
      />
    </ModalHOC>
  );
};

export default PlansListPage;
