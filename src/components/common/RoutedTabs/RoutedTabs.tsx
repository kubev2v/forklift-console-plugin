import type { FC } from 'react';
import { useLocation, useNavigate } from 'react-router-dom-v5-compat';

import { Tab, Tabs, TabTitleText } from '@patternfly/react-core';

type RoutedTab = {
  name: string;
  to: string;
  onClick?: () => void;
};

type RoutedTabsProps = {
  tabs: RoutedTab[];
};

const RoutedTabs: FC<RoutedTabsProps> = ({ tabs }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const activeTab = tabs.find((tab) => location.pathname === tab.to) ?? tabs[0];

  return (
    <Tabs
      activeKey={activeTab.to}
      onSelect={(_, eventKey) => {
        const selectedTab = tabs.find((tab) => tab.to === eventKey);

        if (selectedTab) {
          navigate(selectedTab.to);
          selectedTab.onClick?.();
        }
      }}
    >
      {tabs.map((tab) => (
        <Tab key={tab.to} eventKey={tab.to} title={<TabTitleText>{tab.name}</TabTitleText>} />
      ))}
    </Tabs>
  );
};

export default RoutedTabs;
