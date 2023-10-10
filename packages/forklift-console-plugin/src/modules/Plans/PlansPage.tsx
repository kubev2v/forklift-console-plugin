import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { ConditionalTooltip } from 'legacy/src/common/components/ConditionalTooltip';
import { ENV, PATH_PREFIX } from 'legacy/src/common/constants';
import StandardPage from 'src/components/page/StandardPage';
import * as C from 'src/utils/constants';
import { PLAN_STATUS_FILTER } from 'src/utils/enums';
import { useForkliftTranslation } from 'src/utils/i18n';
import { ResourceConsolePageProps } from 'src/utils/types';

import { EnumToTuple } from '@kubev2v/common';
import { loadUserSettings, UserSettings } from '@kubev2v/common';
import { ResourceFieldFactory } from '@kubev2v/common';
import { MustGatherModal } from '@kubev2v/legacy/common/components/MustGatherModal';
import { PlanModel } from '@kubev2v/types';
import { useAccessReview } from '@openshift-console/dynamic-plugin-sdk';
import { Button } from '@patternfly/react-core';

import { FlatPlan, useFlatPlans, useHasSufficientProviders } from './data';
import EmptyStatePlans from './EmptyStatePlans';
import PlanRow from './PlanRow';

export const fieldsMetadataFactory: ResourceFieldFactory = (t) => [
  {
    resourceFieldId: C.NAME,
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
    resourceFieldId: C.NAMESPACE,
    label: t('Namespace'),
    isVisible: true,
    isIdentity: true,
    filter: {
      placeholderLabel: t('Filter by namespace'),
      type: 'freetext',
    },
    sortable: true,
  },
  {
    resourceFieldId: C.MIGRATION_STARTED,
    label: t('Migration started'),
    isVisible: true,
    filter: {
      type: 'dateRange',
      placeholderLabel: 'YYYY-MM-DD',
    },
    sortable: true,
  },
  {
    resourceFieldId: C.SOURCE,
    label: t('Source provider'),
    isVisible: true,
    filter: {
      type: 'freetext',
      placeholderLabel: t('Filter by name'),
    },
    sortable: true,
  },
  {
    resourceFieldId: C.TARGET,
    label: t('Target provider'),
    isVisible: true,
    filter: {
      type: 'freetext',
      placeholderLabel: t('Filter by name'),
    },
    sortable: true,
  },
  {
    resourceFieldId: C.VM_COUNT,
    label: t('VMs'),
    isVisible: true,
    sortable: true,
  },
  {
    resourceFieldId: C.STATUS,
    label: t('Status'),
    isVisible: true,
    filter: {
      type: 'enum',
      primary: true,
      placeholderLabel: t('Status'),
      values: EnumToTuple(PLAN_STATUS_FILTER),
    },
    sortable: true,
  },

  {
    resourceFieldId: C.DESCRIPTION,
    label: t('Description'),
    isVisible: true,
  },
  {
    resourceFieldId: C.ACTIONS,
    label: '',
    isAction: true,
    isVisible: true,
    sortable: false,
  },
  {
    resourceFieldId: C.ARCHIVED,
    label: t('Archived'),
    isHidden: true,
    filter: {
      type: 'slider',
      standalone: true,
      placeholderLabel: t('Show archived'),
      defaultValues: ['false'],
    },
  },
];

export const PlansPage = ({ namespace }: ResourceConsolePageProps) => {
  const { t } = useForkliftTranslation();
  const [userSettings] = useState(() => loadUserSettings({ pageId: 'Plans' }));
  const dataSource = useFlatPlans({
    namespace,
  });

  const [canCreate] = useAccessReview({
    group: PlanModel.apiGroup,
    resource: PlanModel.plural,
    verb: 'create',
    namespace,
  });

  return (
    <PageMemo
      dataSource={dataSource}
      namespace={namespace}
      title={t('Plans')}
      userSettings={userSettings}
      canCreate={canCreate}
    />
  );
};
PlansPage.displayName = 'PlansPage';

export const CreatePlanButton: React.FC<{ namespace: string }> = ({ namespace }) => {
  const { t } = useForkliftTranslation();
  const history = useHistory();
  const hasSufficientProviders = useHasSufficientProviders(namespace);

  return (
    <ConditionalTooltip
      isTooltipEnabled={!hasSufficientProviders}
      content={`You must add at least one source and one target provider in order to create a mapping.`}
    >
      <Button
        onClick={() =>
          history.push(`${PATH_PREFIX}/plans/ns/${namespace || ENV.DEFAULT_NAMESPACE}/create`)
        }
        isAriaDisabled={!hasSufficientProviders}
        variant="primary"
        id="create-plan-button"
      >
        {t('Create plan')}
      </Button>
    </ConditionalTooltip>
  );
};
CreatePlanButton.displayName = 'CreatePlanButton';

const Page = ({
  dataSource,
  namespace,
  title,
  userSettings,
  canCreate,
}: {
  dataSource: [FlatPlan[], boolean, boolean];
  namespace: string;
  title: string;
  userSettings: UserSettings;
  canCreate: boolean;
}) => {
  const { t } = useForkliftTranslation();

  return (
    <>
      <StandardPage<FlatPlan>
        addButton={canCreate && <CreatePlanButton namespace={namespace} />}
        dataSource={dataSource}
        RowMapper={PlanRow}
        fieldsMetadata={fieldsMetadataFactory(t)}
        namespace={namespace}
        title={title}
        userSettings={userSettings}
        customNoResultsFound={<EmptyStatePlans namespace={namespace} />}
      />
      <MustGatherModal />
    </>
  );
};

const PageMemo = React.memo(Page);

export default PlansPage;
