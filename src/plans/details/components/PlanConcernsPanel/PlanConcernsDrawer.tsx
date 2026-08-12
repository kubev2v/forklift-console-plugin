import type { FC, PropsWithChildren } from 'react';

import { Drawer, DrawerContent, DrawerContentBody } from '@patternfly/react-core';

import PlanConcernsPanel from './PlanConcernsPanel';

type PlanConcernsDrawerProps = PropsWithChildren & {
  name: string;
  namespace: string;
  setShowPlanConcernsPanel: (isOpen: boolean) => void;
  showPlanConcernsPanel: boolean;
};

const PlanConcernsDrawer: FC<PlanConcernsDrawerProps> = ({
  children,
  name,
  namespace,
  setShowPlanConcernsPanel,
  showPlanConcernsPanel,
}) => {
  return (
    <Drawer isExpanded={showPlanConcernsPanel} isInline position="right">
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
