import type { FC, PropsWithChildren } from 'react';

import { Drawer, DrawerContent, DrawerContentBody } from '@patternfly/react-core';

import ProviderIssuesPanel from './ProviderIssuesPanel';

type ProviderIssuesDrawerProps = PropsWithChildren & {
  name: string;
  namespace: string;
  setShowProviderIssuesPanel: (isOpen: boolean) => void;
  showProviderIssuesPanel: boolean;
};

const ProviderIssuesDrawer: FC<ProviderIssuesDrawerProps> = ({
  children,
  name,
  namespace,
  setShowProviderIssuesPanel,
  showProviderIssuesPanel,
}) => {
  return (
    <Drawer isExpanded={showProviderIssuesPanel} isInline position="right">
      <DrawerContent
        panelContent={
          <ProviderIssuesPanel
            name={name}
            namespace={namespace}
            setShowProviderIssuesPanel={setShowProviderIssuesPanel}
            showProviderIssuesPanel={showProviderIssuesPanel}
          />
        }
      >
        <DrawerContentBody>{children}</DrawerContentBody>
      </DrawerContent>
    </Drawer>
  );
};

export default ProviderIssuesDrawer;
