import { type FC, type Ref, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';
import migrationIcon from 'src/components/images/resources/migration.svg';
import ovaIcon from 'src/components/images/resources/open-virtual-appliance.png';
import openShiftVirtualizationIcon from 'src/components/images/resources/openshift-virtualization.svg';
import openStackIcon from 'src/components/images/resources/openstack2.svg';
import redHatIcon from 'src/components/images/resources/redhat.svg';
import vmwareIcon from 'src/components/images/resources/vmware-light.svg';
import providerTypes from 'src/modules/Plans/views/create/constanats/providerTypes';
import { getResourceUrl } from 'src/modules/Providers/utils/helpers/getResourceUrl';
import { ForkliftTrans, useForkliftTranslation } from 'src/utils/i18n';

import { ProviderModelRef, type V1beta1ForkliftController } from '@kubev2v/types';
import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';
import {
  Card,
  CardBody,
  CardFooter,
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
  Tile,
} from '@patternfly/react-core';
import { EllipsisVIcon } from '@patternfly/react-icons';

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
  const [activeNamespace] = useActiveNamespace();
  const navigate = useNavigate();

  const providersListUrl = useMemo(() => {
    return getResourceUrl({
      namespace: activeNamespace,
      namespaced: true,
      reference: ProviderModelRef,
    });
  }, [activeNamespace]);
  const providersCreateUrl = `${providersListUrl}/~new`;
  const [menuIsOpen, setMenuIsOpen] = useState(false);
  const actionDropdownItems = [hideFromViewDropdownOption(onHide, t)];
  const onToggle = () => {
    setMenuIsOpen((open) => !open);
  };

  const headerActions = (
    <Dropdown
      isOpen={menuIsOpen}
      onOpenChange={(isOpen: boolean) => {
        setMenuIsOpen(isOpen);
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

  type ProviderType = keyof typeof providerTypes;
  const navigateToProvider = (type: ProviderType) => {
    navigate(`${providersCreateUrl}?providerType=${type}`, {
      state: { providerType: type },
    });
  };

  return (
    <Card>
      <Split>
        <SplitItem className="forklift-welcome__flex-icon">
          <img src={migrationIcon} className="forklift-welcome__icon" />
        </SplitItem>
        <SplitItem className="forklift-welcome__flex-text">
          <CardHeader actions={{ actions: headerActions }}>
            <CardTitle>{t('Welcome!')}</CardTitle>
          </CardHeader>
          <CardBody className="forklift-welcome__body">
            <Text className="forklift-welcome__text">
              <ForkliftTrans>
                Migration Toolkit for Virtualization (MTV) migrates virtual machines at scale to Red
                Hat OpenShift Virtualization. This allows organizations to more easily access
                workloads running on virtual machines while developing new cloud-native
                applications.
              </ForkliftTrans>
            </Text>
          </CardBody>
          <CardFooter>
            <Text className="forklift-welcome-text">
              <ForkliftTrans>You can migrate virtual machines from:</ForkliftTrans>
            </Text>
            <div className="welcome-tiles">
              <Tile
                title={providerTypes.vsphere.title}
                icon={<img src={vmwareIcon} className="tile-icon-center" />}
                onClick={() => {
                  navigateToProvider(providerTypes.vsphere.key as ProviderType);
                }}
              />
              <Tile
                title={providerTypes.ova.title}
                icon={<img src={ovaIcon} className="tile-icon-center" />}
                onClick={() => {
                  navigateToProvider(providerTypes.ova.key as ProviderType);
                }}
              />
              <Tile
                title={providerTypes.openstack.title}
                icon={<img src={openStackIcon} className="tile-icon-center" />}
                onClick={() => {
                  navigateToProvider(providerTypes.openstack.key as ProviderType);
                }}
              />
              <Tile
                title={providerTypes.ovirt.title}
                icon={<img src={redHatIcon} className="tile-icon-center" />}
                onClick={() => {
                  navigateToProvider(providerTypes.ovirt.key as ProviderType);
                }}
              />
              <Tile
                title={providerTypes.openshift.title}
                icon={<img src={openShiftVirtualizationIcon} className="tile-icon-center" />}
                onClick={() => {
                  navigateToProvider(providerTypes.openshift.key as ProviderType);
                }}
              />
            </div>
          </CardFooter>
        </SplitItem>
      </Split>
    </Card>
  );
};

export default OverviewCard;
