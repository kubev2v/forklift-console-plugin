import { type FC, type Ref, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';
import migrationIcon from 'src/components/images/resources/migration.svg';
import ovaIcon from 'src/components/images/resources/open-virtual-appliance.png';
import openShiftVirtualizationIcon from 'src/components/images/resources/openshift-virtualization.svg';
import openStackIcon from 'src/components/images/resources/openstack2.svg';
import redHatIcon from 'src/components/images/resources/redhat.svg';
import vmwareIcon from 'src/components/images/resources/vmware-dark.svg';
import vmwareIconLight from 'src/components/images/resources/vmware-light.svg';
import providerTypes from 'src/modules/Plans/views/create/constanats/providerTypes';
import { getResourceUrl } from 'src/modules/Providers/utils/helpers/getResourceUrl';
import HideFromViewDropdownOption from 'src/overview/components/HideFromViewDropdownOption';
import { useIsDarkTheme } from 'src/utils/hooks/useIsDarkTheme';
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
  DropdownList,
  MenuToggle,
  type MenuToggleElement,
  Split,
  SplitItem,
  Text,
  Tile,
} from '@patternfly/react-core';
import { EllipsisVIcon } from '@patternfly/react-icons';

type WelcomeCardProps = {
  obj?: V1beta1ForkliftController;
  loaded?: boolean;
  loadError?: unknown;
  onHide: () => void;
};

const WelcomeCard: FC<WelcomeCardProps> = ({ onHide }) => {
  const { t } = useForkliftTranslation();
  const [activeNamespace] = useActiveNamespace();
  const navigate = useNavigate();
  const isDarkTheme = useIsDarkTheme();

  const providersListUrl = useMemo(() => {
    return getResourceUrl({
      namespace: activeNamespace,
      namespaced: true,
      reference: ProviderModelRef,
    });
  }, [activeNamespace]);
  const providersCreateUrl = `${providersListUrl}/~new`;
  const [menuIsOpen, setMenuIsOpen] = useState(false);
  const actionDropdownItems = [<HideFromViewDropdownOption onHide={onHide} />];
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
            <Text className="forklift-welcome__text">
              <ForkliftTrans>You can migrate virtual machines from:</ForkliftTrans>
            </Text>
            <div className="forklift-welcome__tiles">
              <Tile
                className="vmware-tile"
                title={providerTypes.vsphere.title}
                icon={<img src={isDarkTheme ? vmwareIconLight : vmwareIcon} />}
                onClick={() => {
                  navigateToProvider(providerTypes.vsphere.key as ProviderType);
                }}
              />
              <Tile
                title={providerTypes.ova.title}
                icon={<img src={ovaIcon} />}
                onClick={() => {
                  navigateToProvider(providerTypes.ova.key as ProviderType);
                }}
              />
              <Tile
                title={providerTypes.openstack.title}
                icon={<img src={openStackIcon} />}
                onClick={() => {
                  navigateToProvider(providerTypes.openstack.key as ProviderType);
                }}
              />
              <Tile
                title={providerTypes.ovirt.title}
                icon={<img src={redHatIcon} />}
                onClick={() => {
                  navigateToProvider(providerTypes.ovirt.key as ProviderType);
                }}
              />
              <Tile
                title={providerTypes.openshift.title}
                icon={<img src={openShiftVirtualizationIcon} />}
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

export default WelcomeCard;
