import { type FC, useMemo } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';
import migrationIcon from 'src/components/images/resources/migration.svg';
import ovaIcon from 'src/components/images/resources/open-virtual-appliance.png';
import openShiftVirtualizationIcon from 'src/components/images/resources/openshift-virtualization.svg';
import openStackIcon from 'src/components/images/resources/openstack2.svg';
import redHatIcon from 'src/components/images/resources/redhat.svg';
import vmwareIconDark from 'src/components/images/resources/vmware-dark.svg';
import vmwareIconLight from 'src/components/images/resources/vmware-light.svg';
import providerTypes from 'src/modules/Plans/views/create/constanats/providerTypes';
import { getResourceUrl } from 'src/modules/Providers/utils/helpers/getResourceUrl';
import HeaderActions from 'src/overview/components/HeaderActions';
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
  Split,
  SplitItem,
  Text,
  Tile,
} from '@patternfly/react-core';

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
  const providerItems = providerTypes(isDarkTheme);

  const providersListUrl = useMemo(() => {
    return getResourceUrl({
      namespace: activeNamespace,
      namespaced: true,
      reference: ProviderModelRef,
    });
  }, [activeNamespace]);
  const providersCreateUrl = `${providersListUrl}/~new`;
  const actionDropdownItems = [<HideFromViewDropdownOption onHide={onHide} />];

  const navigateToProvider = (type: string) => {
    navigate(`${providersCreateUrl}?providerType=${type}`, {
      state: { providerType: type as keyof typeof providerItems },
    });
  };

  return (
    <Card>
      <Split>
        <SplitItem className="forklift-welcome__flex-icon">
          <img src={migrationIcon} className="forklift-welcome__icon" />
        </SplitItem>
        <SplitItem className="forklift-welcome__flex-text">
          <CardHeader actions={{ actions: <HeaderActions actions={actionDropdownItems} /> }}>
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
                title={providerItems.vsphere.title}
                icon={<img src={isDarkTheme ? vmwareIconLight : vmwareIconDark} />}
                onClick={() => {
                  navigateToProvider(providerItems.vsphere.key);
                }}
              />
              <Tile
                title={providerItems.ova.title}
                icon={<img src={ovaIcon} />}
                onClick={() => {
                  navigateToProvider(providerItems.ova.key);
                }}
              />
              <Tile
                title={providerItems.openstack.title}
                icon={<img src={openStackIcon} />}
                onClick={() => {
                  navigateToProvider(providerItems.openstack.key);
                }}
              />
              <Tile
                title={providerItems.ovirt.title}
                icon={<img src={redHatIcon} />}
                onClick={() => {
                  navigateToProvider(providerItems.ovirt.key);
                }}
              />
              <Tile
                title={providerItems.openshift.title}
                icon={<img src={openShiftVirtualizationIcon} />}
                onClick={() => {
                  navigateToProvider(providerItems.openshift.key);
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
