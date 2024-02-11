import React, { FC } from 'react';
import automationIcon from 'src/modules/Overview/images/automation.svg';
import { ForkliftTrans, useForkliftTranslation } from 'src/utils/i18n';

import { V1beta1ForkliftController } from '@kubev2v/types';
import {
  Card,
  CardActions,
  CardBody,
  CardHeader,
  CardTitle,
  Dropdown,
  DropdownItem,
  KebabToggle,
  Split,
  SplitItem,
  Text,
} from '@patternfly/react-core';

type OverviewCardProps = {
  obj?: V1beta1ForkliftController;
  loaded?: boolean;
  loadError?: unknown;
  onHide?: () => void;
};

const hideFromViewDropdownOption = (onHide: () => void, t) => {
  const hasHideAction = !!onHide;

  return hasHideAction ? (
    <DropdownItem
      key="action"
      component="button"
      description={t(
        "You can always bring this welcome card back into view by clicking 'Show the welcome card' in the page heading.",
      )}
      onClick={onHide}
      data-testid="hide"
      style={{ whiteSpace: 'pre-wrap', width: 280, fontWeight: 'bold' }}
    >
      {t('Hide from view')}
    </DropdownItem>
  ) : (
    <DropdownItem />
  );
};

export const OverviewCard: FC<OverviewCardProps> = ({ onHide }) => {
  const { t } = useForkliftTranslation();
  const [menuIsOpen, setMenuIsOpen] = React.useState(false);

  const actionDropdownItems = [hideFromViewDropdownOption(onHide, t)];
  const onToggle = () => setMenuIsOpen((open) => !open);

  return (
    <Card>
      <Split>
        <SplitItem className="forklift-welcome__flex-icon">
          <img src={automationIcon} className="forklift-welcome__icon" />
        </SplitItem>
        <SplitItem className="forklift-welcome__flex-text">
          <CardHeader>
            <CardActions>
              <Dropdown
                isOpen={menuIsOpen}
                isPlain
                toggle={<KebabToggle onToggle={onToggle} data-testid="actions" />}
                position="right"
                dropdownItems={actionDropdownItems}
              />
            </CardActions>
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
