import type { FC, PropsWithChildren } from 'react';

import { Drawer, DrawerContent, DrawerContentBody } from '@patternfly/react-core';

import PlanConcernsPanel from './PlanConcernsPanel';

type PlanConcernsDrawerProps = PropsWithChildren & {
  name: string;
  namespace: string;
  showPlanConcernsPanel: boolean;
  setShowPlanConcernsPanel: (isOpen: boolean) => void;
};

const PlanConcernsDrawer: FC<PlanConcernsDrawerProps> = ({
  children,
  name,
  namespace,
  setShowPlanConcernsPanel,
  showPlanConcernsPanel,
}) => {
  return (
    <Drawer isInline isExpanded={showPlanConcernsPanel} position="right">
      <DrawerContent
        panelContent={
          <PlanConcernsPanel
            name={name}
            namespace={namespace}
            setShowPlanConcernsPanel={setShowPlanConcernsPanel}
            showPlanConcernsPanel={showPlanConcernsPanel}
          />
        }
      >
        <DrawerContentBody>{children}</DrawerContentBody>
      </DrawerContent>
    </Drawer>
  );
};

export default PlanConcernsDrawer;
