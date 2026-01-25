import type { FC } from 'react';
import { ErrorState } from 'src/components/common/Page/PageStates';
import LearningExperienceDrawer from 'src/onlineHelp/learningExperienceDrawer/LearningExperienceDrawer';
import { useForkliftTranslation } from 'src/utils/i18n';

import LoadingSuspend from '@components/LoadingSuspend';
import { ProviderModelGroupVersionKind, type V1beta1Provider } from '@forklift-ui/types';
import { type K8sModel, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { PageSection } from '@patternfly/react-core';

import ProviderDetailsPageByType from './ProviderDetailsPageByType';

import './ProviderDetailsPage.style.scss';

type ProviderDetailsPageProps = {
  kind: string;
  kindObj: K8sModel;
  name: string;
  namespace: string;
};

const ProviderDetailsPage: FC<ProviderDetailsPageProps> = ({ name, namespace }) => {
  const { t } = useForkliftTranslation();

  const [provider, loaded, error] = useK8sWatchResource<V1beta1Provider>({
    groupVersionKind: ProviderModelGroupVersionKind,
    name,
    namespace,
    namespaced: true,
  });

  if (error) {
    return <ErrorState title={t('Unable to retrieve data.')} />;
  }

  if (!loaded) {
    return <LoadingSuspend />;
  }

  return (
    <LearningExperienceDrawer>
      <PageSection hasBodyWrapper={false}>
        <ProviderDetailsPageByType type={provider?.spec?.type} name={name} namespace={namespace} />
      </PageSection>
    </LearningExperienceDrawer>
  );
};

export default ProviderDetailsPage;
