import { type FC, useContext, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom-v5-compat';
import migrationIcon from 'src/components/images/resources/migration.svg';
import { getResourceUrl } from 'src/modules/Providers/utils/helpers/getResourceUrl';
import { CreateOverviewContext } from 'src/overview/hooks/OverviewContext';
import { useIsDarkTheme } from 'src/utils/hooks/useIsDarkTheme';
import { ForkliftTrans, useForkliftTranslation } from 'src/utils/i18n';

import { getImages } from '@components/images/logos';
import { ProviderModelRef } from '@kubev2v/types';
import { useActiveNamespace, useFlag } from '@openshift-console/dynamic-plugin-sdk';
import {
  Card,
  CardBody,
  Content,
  ContentVariants,
  ExpandableSection,
  Flex,
  FlexItem,
} from '@patternfly/react-core';
import { type ProviderType, TELEMETRY_EVENTS } from '@utils/analytics/constants';
import { useForkliftAnalytics } from '@utils/analytics/hooks/useForkliftAnalytics';
import { Namespace } from '@utils/constants';

import { providerTypes } from './utils/providerTypes';
import { ProviderCard } from './ProviderCard';

const WelcomeCard: FC = () => {
  const { t } = useForkliftTranslation();
  const { trackEvent } = useForkliftAnalytics();
  const navigate = useNavigate();
  const isDarkTheme = useIsDarkTheme();
  const { data: { hideWelcomeCardByContext } = {}, setData } = useContext(CreateOverviewContext);
  const providerItems = providerTypes(isDarkTheme);
  const images = getImages(isDarkTheme);

  const providersListUrl = useMemo(() => {
    return getResourceUrl({
      namespaced: false,
      reference: ProviderModelRef,
    });
  }, []);
  const providersCreateUrl = `${providersListUrl}/~new`;

  const navigateToProvider = (type: ProviderType) => {
    trackEvent(TELEMETRY_EVENTS.OVERVIEW_WELCOME_PROVIDER_CLICKED, {
      providerType: type,
    });
    navigate(`${providersCreateUrl}?providerType=${type}`, {
      state: { providerType: type as keyof typeof providerItems },
    });
  };
  const [activeNamespace] = useActiveNamespace();
  const kubevirtInstalled = useFlag('KUBEVIRT_DYNAMIC');
  const namespaceURL =
    activeNamespace === Namespace.AllProjects ? 'all-namespaces' : `ns/${activeNamespace}`;

  const operatorHubURL = `/operatorhub/${namespaceURL}?keyword=kubevirt`;
  const virtualizationOverviewURL = `/k8s/${namespaceURL}/virtualization-overview`;
  return (
    <Card>
      <CardBody>
        <ExpandableSection
          toggleContent={<Content component={ContentVariants.h3}>{t('Welcome')}</Content>}
          isExpanded={!hideWelcomeCardByContext}
          onToggle={(_ev, isExpanded) => {
            setData({ hideWelcomeCardByContext: !isExpanded });
          }}
        >
          <Flex
            direction={{ default: 'row' }}
            spaceItems={{ default: 'spaceItemsNone' }}
            alignItems={{ default: 'alignItemsCenter' }}
          >
            <FlexItem className="forklift-overview__welcome-left">
              <img alt="" src={migrationIcon} />
            </FlexItem>
            <FlexItem flex={{ default: 'flex_1' }} className="forklift-overview__welcome-right">
              <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsMd' }}>
                <FlexItem>
                  <Content component="p" className="forklift-overview__welcome-text">
                    <ForkliftTrans>
                      Migration Toolkit for Virtualization (MTV) migrates virtual machines at scale
                      to{' '}
                      <Link to={kubevirtInstalled ? virtualizationOverviewURL : operatorHubURL}>
                        Red Hat OpenShift Virtualization
                      </Link>
                      . This allows organizations to more easily access workloads running on virtual
                      machines while developing new cloud-native applications.
                    </ForkliftTrans>
                  </Content>
                </FlexItem>

                <FlexItem>
                  <Content component="p" className="forklift-overview__welcome-text">
                    <ForkliftTrans>You can migrate virtual machines from:</ForkliftTrans>
                  </Content>
                </FlexItem>

                <FlexItem>
                  <Flex
                    className="forklift-overview__welcome-tiles"
                    spaceItems={{ default: 'spaceItemsSm' }}
                    alignItems={{ default: 'alignItemsCenter' }}
                  >
                    <FlexItem>
                      <ProviderCard
                        imageSrc={images.vmwareImg}
                        onClick={() => {
                          navigateToProvider(providerItems.vsphere.key);
                        }}
                      >
                        {providerItems.vsphere.title}
                      </ProviderCard>
                    </FlexItem>

                    <FlexItem>
                      <ProviderCard
                        imageSrc={images.ovaImg}
                        onClick={() => {
                          navigateToProvider(providerItems.ova.key);
                        }}
                      >
                        {providerItems.ova.title}
                      </ProviderCard>
                    </FlexItem>

                    <FlexItem>
                      <ProviderCard
                        imageSrc={images.openstackImg}
                        onClick={() => {
                          navigateToProvider(providerItems.openstack.key);
                        }}
                      >
                        {providerItems.openstack.title}
                      </ProviderCard>
                    </FlexItem>

                    <FlexItem>
                      <ProviderCard
                        imageSrc={images.redhatImg}
                        onClick={() => {
                          navigateToProvider(providerItems.ovirt.key);
                        }}
                      >
                        {providerItems.ovirt.title}
                      </ProviderCard>
                    </FlexItem>

                    <FlexItem>
                      <ProviderCard
                        imageSrc={images.openshiftImg}
                        onClick={() => {
                          navigateToProvider(providerItems.openshift.key);
                        }}
                      >
                        {providerItems.openshift.title}
                      </ProviderCard>
                    </FlexItem>
                  </Flex>
                </FlexItem>
              </Flex>
            </FlexItem>
          </Flex>
        </ExpandableSection>
      </CardBody>
    </Card>
  );
};

export default WelcomeCard;
