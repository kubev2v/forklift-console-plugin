import type { FC } from 'react';
import { ErrorState } from 'src/components/common/Page/PageStates';
import LearningExperienceDrawer from 'src/onlineHelp/learningExperienceDrawer/LearningExperienceDrawer';
import { useForkliftTranslation } from 'src/utils/i18n';

import LoadingSuspend from '@components/LoadingSuspend';
import { ProviderModelGroupVersionKind, type V1beta1Provider } from '@forklift-ui/types';
import { type K8sModel, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { toTypedWatchResult } from '@utils/hooks/toTypedWatchResult';

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

  const [provider, loaded, error] = toTypedWatchResult(
    useK8sWatchResource<V1beta1Provider>({
      groupVersionKind: ProviderModelGroupVersionKind,
      name,
      namespace,
      namespaced: true,
    }),
  );

  if (error) {
    return <ErrorState title={t('Unable to retrieve data.')} />;
  }

  if (!loaded) {
    return <LoadingSuspend />;
  }

  return (
    <LearningExperienceDrawer>
      <ProviderDetailsPageByType name={name} namespace={namespace} type={provider?.spec?.type} />
    </LearningExperienceDrawer>
  );
};

export default ProviderDetailsPage;
