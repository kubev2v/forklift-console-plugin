import { type FC, memo } from 'react';
import TipsAndTricksDrawer from 'src/onlineHelp/tipsAndTricksDrawer/TipsAndTricksDrawer';
import { useForkliftTranslation } from 'src/utils/i18n';

import { HorizontalNav, type K8sModel } from '@openshift-console/dynamic-plugin-sdk';

import { StorageMapPageHeadings } from './components/DetailsSection/components/StorageMapPageHeadings';
import { StorageMapDetailsTab } from './tabs/Details/StorageMapDetailsTab';
import { StorageMapYAMLTab } from './tabs/YAML/StorageMapYAMLTab';

import './StorageMapDetailsPage.scss';

type StorageMapDetailsPageProps = {
  kind: string;
  kindObj: K8sModel;
  match: { path: string; url: string; isExact: boolean; params: unknown };
  name: string;
  namespace: string;
};

const StorageMapDetailsPage: FC<StorageMapDetailsPageProps> = memo(({ name, namespace }) => {
  const { t } = useForkliftTranslation();

  const pages = [
    {
      component: () => <StorageMapDetailsTab name={name} namespace={namespace} />,
      href: '',
      name: t('Details'),
    },
    {
      component: () => <StorageMapYAMLTab name={name} namespace={namespace} />,
      href: 'yaml',
      name: t('YAML'),
    },
  ];
  return (
    <TipsAndTricksDrawer>
      <StorageMapPageHeadings name={name} namespace={namespace} />
      <HorizontalNav pages={pages} />
    </TipsAndTricksDrawer>
  );
});

export default StorageMapDetailsPage;
