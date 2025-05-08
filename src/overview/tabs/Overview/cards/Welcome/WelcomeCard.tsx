import { type FC, useMemo } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';
import migrationIcon from 'src/components/images/resources/migration.svg';
import providerTypes from 'src/modules/Plans/views/create/constanats/providerTypes';
import { getResourceUrl } from 'src/modules/Providers/utils/helpers/getResourceUrl';
import { useIsDarkTheme } from 'src/utils/hooks/useIsDarkTheme';
import { ForkliftTrans, useForkliftTranslation } from 'src/utils/i18n';

import { getImages } from '@components/images/logos';
import { ProviderModelRef } from '@kubev2v/types';
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

import HeaderActions from './HeaderActions';
import HideFromViewDropdownOption from './HideFromViewDropdownOption';

type WelcomeCardProps = {
  onHide: () => void;
};

const WelcomeCard: FC<WelcomeCardProps> = ({ onHide }) => {
  const { t } = useForkliftTranslation();
  const [activeNamespace] = useActiveNamespace();
  const navigate = useNavigate();
  const isDarkTheme = useIsDarkTheme();
  const providerItems = providerTypes(isDarkTheme);
  const images = getImages(isDarkTheme);

  const providersListUrl = useMemo(() => {
    return getResourceUrl({
      namespace: activeNamespace,
      namespaced: true,
      reference: ProviderModelRef,
    });
  }, [activeNamespace]);
  const providersCreateUrl = `${providersListUrl}/~new`;
  const actionDropdownItems = [<HideFromViewDropdownOption key="hide" onHide={onHide} />];

  const navigateToProvider = (type: string) => {
    navigate(`${providersCreateUrl}?providerType=${type}`, {
      state: { providerType: type as keyof typeof providerItems },
    });
  };

  return (
    <Card>
      <Split>
        <SplitItem className="forklift-welcome__flex-icon">
          <img alt="" src={migrationIcon} className="forklift-welcome__icon" />
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
                icon={<img alt="" src={images.vmwareImg} />}
                onClick={() => {
                  navigateToProvider(providerItems.vsphere.key);
                }}
              />
              <Tile
                title={providerItems.ova.title}
                icon={<img alt="" src={images.ovaImg} />}
                onClick={() => {
                  navigateToProvider(providerItems.ova.key);
                }}
              />
              <Tile
                title={providerItems.openstack.title}
                icon={<img alt="" src={images.openstackImg} />}
                onClick={() => {
                  navigateToProvider(providerItems.openstack.key);
                }}
              />
              <Tile
                title={providerItems.ovirt.title}
                icon={<img alt="" src={images.redhatImg} />}
                onClick={() => {
                  navigateToProvider(providerItems.ovirt.key);
                }}
              />
              <Tile
                title={providerItems.openshift.title}
                icon={<img alt="" src={images.openshiftImg} />}
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
