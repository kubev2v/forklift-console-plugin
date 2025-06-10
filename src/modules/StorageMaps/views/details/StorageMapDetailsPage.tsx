import { type FC, memo } from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import { HorizontalNav, type K8sModel } from '@openshift-console/dynamic-plugin-sdk';

import { StorageMapPageHeadings } from './components/DetailsSection/components/StorageMapPageHeadings';
import { StorageMapDetailsTab } from './tabs/Details/StorageMapDetailsTab';
import { StorageMapYAMLTab } from './tabs/YAML/StorageMapYAMLTab';

import './StorageMapDetailsPage.scss';

const StorageMapDetailsPageInternal: FC<{
  name: string;
  namespace: string;
}> = ({ name, namespace }) => {
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
    <>
      <StorageMapPageHeadings name={name} namespace={namespace} />
      <HorizontalNav pages={pages} />
    </>
  );
};
const StorageMapDetailsPageInternalMemo = memo(StorageMapDetailsPageInternal);

const StorageMapDetailsPage: FC<StorageMapDetailsPageProps> = ({ name, namespace }) => {
  return <StorageMapDetailsPageInternalMemo name={name} namespace={namespace} />;
};
StorageMapDetailsPage.displayName = 'StorageMapDetailsPage';

type StorageMapDetailsPageProps = {
  kind: string;
  kindObj: K8sModel;
  match: { path: string; url: string; isExact: boolean; params: unknown };
  name: string;
  namespace?: string;
};

export default StorageMapDetailsPage;
