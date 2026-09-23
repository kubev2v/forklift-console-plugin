import { type FC, useState } from 'react';

import { HorizontalNav, type NavPage } from '@openshift-console/dynamic-plugin-sdk';

import ProviderIssuesDrawer from './components/ProviderIssuesPanel/ProviderIssuesDrawer';
import ProviderPageHeader from './ProviderPageHeader';

type ProviderDetailsLayoutProps = {
  name: string;
  namespace: string;
  tabPages: NavPage[];
};

const ProviderDetailsLayout: FC<ProviderDetailsLayoutProps> = ({ name, namespace, tabPages }) => {
  const [showProviderIssuesPanel, setShowProviderIssuesPanel] = useState(false);

  return (
    <ProviderIssuesDrawer
      name={name}
      namespace={namespace}
      setShowProviderIssuesPanel={setShowProviderIssuesPanel}
      showProviderIssuesPanel={showProviderIssuesPanel}
    >
      <div className="forklift-details-page-layout">
        <ProviderPageHeader
          name={name}
          namespace={namespace}
          setShowProviderIssuesPanel={setShowProviderIssuesPanel}
        />
        <div className="forklift-details-page-layout__content">
          <HorizontalNav pages={tabPages} />
        </div>
      </div>
    </ProviderIssuesDrawer>
  );
};

export default ProviderDetailsLayout;
