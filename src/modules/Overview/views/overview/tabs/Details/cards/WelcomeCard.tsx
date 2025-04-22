import { type FC, type Ref, useState } from 'react';
import { ForkliftTrans, useForkliftTranslation } from 'src/utils/i18n';

import type { V1beta1ForkliftController } from '@kubev2v/types';
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Dropdown,
  DropdownItem,
  DropdownList,
  MenuToggle,
  type MenuToggleElement,
  Split,
  SplitItem,
  Text,
} from '@patternfly/react-core';
import { EllipsisVIcon } from '@patternfly/react-icons';

import automationIcon from '../../../../../images/automation.svg';

type OverviewCardProps = {
  obj?: V1beta1ForkliftController;
  loaded?: boolean;
  loadError?: unknown;
  onHide?: () => void;
};

const hideFromViewDropdownOption = (onHide: () => void, t) => {
  const hasHideAction = Boolean(onHide);

  return hasHideAction ? (
    <DropdownItem
      value={0}
      key="action"
      component="button"
      description={t(
        "You can always bring this welcome card back into view by clicking 'Show the welcome card' in the page heading.",
      )}
      onClick={onHide}
      data-testid="hide"
      style={{ fontWeight: 'bold', whiteSpace: 'pre-wrap', width: 280 }}
    >
      {t('Hide from view')}
    </DropdownItem>
  ) : (
    <DropdownItem />
  );
};

const OverviewCard: FC<OverviewCardProps> = ({ onHide }) => {
  const { t } = useForkliftTranslation();
  const [menuIsOpen, setMenuIsOpen] = useState(false);
  const actionDropdownItems = [hideFromViewDropdownOption(onHide, t)];
  const onToggle = () => {
    setMenuIsOpen((open) => !open);
  };

  const headerActions = (
    <Dropdown
      isOpen={menuIsOpen}
      onOpenChange={(menuIsOpen: boolean) => {
        setMenuIsOpen(menuIsOpen);
      }}
      toggle={(toggleRef: Ref<MenuToggleElement>) => (
        <MenuToggle ref={toggleRef} onClick={onToggle} isExpanded={menuIsOpen} variant={'plain'}>
          {<EllipsisVIcon />}
        </MenuToggle>
      )}
      shouldFocusFirstItemOnOpen={false}
      popperProps={{
        position: 'right',
      }}
    >
      <DropdownList>{actionDropdownItems}</DropdownList>
    </Dropdown>
  );

  return (
    <Card>
      <Split>
        <SplitItem className="forklift-welcome__flex-icon">
          <img src={automationIcon} className="forklift-welcome__icon" />
        </SplitItem>
        <SplitItem className="forklift-welcome__flex-text">
          <CardHeader actions={{ actions: headerActions }}>
            <CardTitle className="forklift-title">{t('Welcome')}</CardTitle>
          </CardHeader>
          <CardBody>
            <Text className="forklift-welcome-text">
              <ForkliftTrans>
                Migration Toolkit for Virtualization (MTV) migrates virtual machines at scale to Red
                Hat OpenShift Virtualization. You can migrate virtual machines from VMware vSphere,
                Red Hat Virtualization, OpenStack, OVA and OpenShift Virtualization source providers
                to OpenShift Virtualization with the Migration Toolkit for Virtualization (MTV).
              </ForkliftTrans>
            </Text>
            <Text className="forklift-welcome-text">
              <ForkliftTrans>
                This gives organizations the ability to more easily access workloads running on
                virtual machines, while developing new cloud-native applications.
              </ForkliftTrans>
            </Text>
            <Text className="forklift-welcome-text">
              <ForkliftTrans>
                Migrations are performed in a few simple steps, first by providing source and
                destination credentials, then mapping the source and destination infrastructure and
                creating a choreographed plan, and finally, executing the migration effort.
              </ForkliftTrans>
            </Text>
          </CardBody>
        </SplitItem>
      </Split>
    </Card>
  );
};

export default OverviewCard;
