import { type FC, memo } from 'react';
import LearningExperienceDrawer from 'src/onlineHelp/learningExperienceDrawer/LearningExperienceDrawer';
import { useForkliftTranslation } from 'src/utils/i18n';

import { HorizontalNav, type K8sModel } from '@openshift-console/dynamic-plugin-sdk';

import { NetworkMapPageHeadings } from './components/DetailsSection/components/NetworkMapPageHeadings';
import NetworkMapDetailsTab from './tabs/Details/NetworkMapDetailsTab';
import NetworkMapYAMLTab from './tabs/YAML/NetworkMapYAMLTab';

import './NetworkMapDetailsPage.scss';

type NetworkMapDetailsPageProps = {
  kind: string;
  kindObj: K8sModel;
  match: { path: string; url: string; isExact: boolean; params: unknown };
  name: string;
  namespace: string;
};

const NetworkMapDetailsPage: FC<NetworkMapDetailsPageProps> = memo(({ name, namespace }) => {
  const { t } = useForkliftTranslation();

  const pages = [
    {
      component: () => <NetworkMapDetailsTab name={name} namespace={namespace} />,
      href: '',
      name: t('Details'),
    },
    {
      component: () => <NetworkMapYAMLTab name={name} namespace={namespace} />,
      href: 'yaml',
      name: t('YAML'),
    },
  ];

  return (
    <LearningExperienceDrawer>
      <div className="forklift-details-page-layout">
        <NetworkMapPageHeadings name={name} namespace={namespace} />
        <div className="forklift-details-page-layout__content">
          <HorizontalNav pages={pages} />
        </div>
      </div>
    </LearningExperienceDrawer>
  );
});

export default NetworkMapDetailsPage;
