import React from 'react';
import StandardPage from 'src/components/page/StandardPage';
import { useGetDeleteAndEditAccessReview } from 'src/modules/Providers/hooks';
import { ModalHOC } from 'src/modules/Providers/modals';
import { useForkliftTranslation } from 'src/utils/i18n';

import { loadUserSettings, ResourceFieldFactory } from '@kubev2v/common';
import { PlanModel, PlanModelGroupVersionKind, V1beta1Plan } from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { HelperText, HelperTextItem } from '@patternfly/react-core';

import { PlansAddButton } from '../../components';
import PlansEmptyState from '../../components/PlansEmptyState';
import { getPlanSummaryStatus, PlanData, planSummaryStatuses } from '../../utils';

import PlanRow from './PlanRow';

import './PlansListPage.style.css';

export const fieldsMetadataFactory: ResourceFieldFactory = (t) => [
  {
    resourceFieldId: 'name',
    jsonPath: '$.obj.metadata.name',
    label: t('Name'),
    isVisible: true,
    isIdentity: true,
    filter: {
      type: 'freetext',
      placeholderLabel: t('Filter by name'),
    },
    sortable: true,
  },
  {
    resourceFieldId: 'namespace',
    jsonPath: '$.obj.metadata.namespace',
    label: t('Namespace'),
    isVisible: true,
    isIdentity: true,
    filter: {
      type: 'freetext',
      placeholderLabel: t('Filter by namespace'),
    },
    sortable: true,
  },
  {
    resourceFieldId: 'source',
    jsonPath: '$.obj.spec.provider.source.name',
    label: t('Source provider'),
    isVisible: true,
    filter: {
      type: 'freetext',
      placeholderLabel: t('Filter by source'),
    },
    sortable: true,
  },
  {
    resourceFieldId: 'destination',
    jsonPath: '$.obj.spec.provider.destination.name',
    label: t('Target provider'),
    isVisible: false,
    filter: {
      type: 'freetext',
      placeholderLabel: t('Filter by target'),
    },
    sortable: true,
  },
  {
    resourceFieldId: 'vms',
    jsonPath: (data: PlanData) => data?.obj?.spec?.vms?.length ?? 0,
    label: t('Virtual machines'),
    isVisible: true,
    sortable: true,
  },
  {
    resourceFieldId: 'phase',
    jsonPath: getPlanSummaryStatus,
    label: t('Migration status'),
    isVisible: true,
    filter: {
      type: 'enum',
      primary: true,
      placeholderLabel: t('Migration status'),
      values: planSummaryStatuses,
    },
    sortable: true,
  },
  {
    resourceFieldId: 'migration-started',
    jsonPath: '$.obj.status.migration.started',
    label: t('Migration started'),
    isVisible: true,
    filter: {
      type: 'dateRange',
      placeholderLabel: 'YYYY-MM-DD',
      helperText: (
        <HelperText className="forklift-date-range-helper-text">
          <HelperTextItem variant="indeterminate">
            {t('Dates are compared in UTC. End of the interval is included.')}
          </HelperTextItem>
        </HelperText>
      ),
    },
    sortable: true,
  },
  {
    resourceFieldId: 'description',
    jsonPath: '$.obj.spec.description',
    label: t('Description'),
    isVisible: false,
  },
  {
    resourceFieldId: 'actions',
    label: '',
    isAction: true,
    isVisible: true,
    sortable: false,
  },
  {
    resourceFieldId: 'archived',
    jsonPath: '$.obj.spec.archived',
    label: t('Archived'),
    isHidden: true,
    isPersistent: true,
    filter: {
      type: 'slider',
      standalone: true,
      placeholderLabel: t('Show archived'),
      defaultValues: ['false'],
    },
  },
];

const PlansListPage: React.FC<{
  namespace: string;
}> = ({ namespace }) => {
  const { t } = useForkliftTranslation();

  const userSettings = loadUserSettings({ pageId: 'Plans' });

  const [plans, plansLoaded, plansLoadError] = useK8sWatchResource<V1beta1Plan[]>({
    groupVersionKind: PlanModelGroupVersionKind,
    namespaced: true,
    isList: true,
    namespace,
  });

  const permissions = useGetDeleteAndEditAccessReview({
    model: PlanModel,
    namespace,
  });

  const data: PlanData[] = (plansLoaded && !plansLoadError ? plans : []).map((obj) => ({
    obj,
    permissions,
  }));

  const EmptyState = (
    <EmptyState_
      AddButton={<PlansAddButton dataTestId="add-network-map-button-empty-state" />}
      namespace={namespace}
    />
  );

  return (
    <ModalHOC>
      <StandardPage
        data-testid="network-maps-list"
        addButton={permissions.canCreate && <PlansAddButton dataTestId="add-network-map-button" />}
        dataSource={[data || [], plansLoaded, plansLoadError]}
        RowMapper={PlanRow}
        fieldsMetadata={fieldsMetadataFactory(t)}
        namespace={namespace}
        title={t('Plans')}
        userSettings={userSettings}
        customNoResultsFound={EmptyState}
        page={1}
      />
    </ModalHOC>
  );
};

interface EmptyStateProps {
  AddButton: JSX.Element;
  namespace?: string;
}

const EmptyState_: React.FC<EmptyStateProps> = ({ namespace }) => {
  return <PlansEmptyState namespace={namespace} />;
};

export default PlansListPage;
