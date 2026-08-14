import { type FC, useContext, useMemo } from 'react';
import { Link, useNavigate } from 'react-router';
import migrationIcon from 'src/components/images/resources/migration.svg';
import { OverviewContext } from 'src/overview/context/OverviewContext';

import { ProviderModelRef } from '@forklift-ui/types';
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
import { TELEMETRY_EVENTS } from '@utils/analytics/constants';
import { useForkliftAnalytics } from '@utils/analytics/hooks/useForkliftAnalytics';
import { Namespace } from '@utils/constants';
import { getResourceUrl } from '@utils/getResourceUrl';
import { useClusterIsAwsPlatform } from '@utils/hooks/useClusterIsAwsPlatform';
import { useIsDarkTheme } from '@utils/hooks/useIsDarkTheme';
import { ForkliftTrans, useForkliftTranslation } from '@utils/i18n';
import type { ProviderTypes } from '@utils/providers/constants';
import { getProviderTypeOptions } from '@utils/providers/getProviderTypeOptions';

import { ProviderCard } from './ProviderCard';

const WelcomeCard: FC = () => {
  const { t } = useForkliftTranslation();
  const { trackEvent } = useForkliftAnalytics();
  const navigate = useNavigate();
  const isDarkTheme = useIsDarkTheme();
  const { isAwsPlatform, loaded: isAwsPlatformLoaded } = useClusterIsAwsPlatform();
  const { data: { hideWelcomeCardByContext } = {}, setData } = useContext(OverviewContext);

  // Same order as create-provider (OpenShift first); EC2 only when AWS status is known and true.
  const providerTypeOptions = useMemo(
    () => getProviderTypeOptions(isDarkTheme, isAwsPlatformLoaded && isAwsPlatform),
    [isAwsPlatform, isAwsPlatformLoaded, isDarkTheme],
  );

  const providersListUrl = useMemo(() => {
    return getResourceUrl({
      namespaced: false,
      reference: ProviderModelRef,
    });
  }, []);
  const providersCreateUrl = `${providersListUrl}/~new`;

  const navigateToProvider = (type: ProviderTypes) => {
    trackEvent(TELEMETRY_EVENTS.OVERVIEW_WELCOME_PROVIDER_CLICKED, {
      providerType: type,
    });
    navigate(`${providersCreateUrl}?providerType=${type}`)?.catch(() => undefined);
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
          isExpanded={!hideWelcomeCardByContext}
          onToggle={(_ev, isExpanded) => {
            setData({ hideWelcomeCardByContext: !isExpanded });
          }}
          toggleContent={<Content component={ContentVariants.h3}>{t('Welcome')}</Content>}
        >
          <Flex
            alignItems={{ default: 'alignItemsCenter' }}
            direction={{ default: 'row' }}
            spaceItems={{ default: 'spaceItemsNone' }}
          >
            <FlexItem className="forklift-overview__welcome-left">
              <img alt="" src={migrationIcon} />
            </FlexItem>
            <FlexItem className="forklift-overview__welcome-right" flex={{ default: 'flex_1' }}>
              <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsMd' }}>
                <FlexItem>
                  <Content className="forklift-overview__welcome-text" component="p">
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
                  <Content className="forklift-overview__welcome-text" component="p">
                    <ForkliftTrans>You can migrate virtual machines from:</ForkliftTrans>
                  </Content>
                </FlexItem>

                <FlexItem>
                  <Flex
                    alignItems={{ default: 'alignItemsCenter' }}
                    className="forklift-overview__welcome-tiles"
                    spaceItems={{ default: 'spaceItemsSm' }}
                  >
                    {providerTypeOptions.map((option) => (
                      <FlexItem key={option.value}>
                        <ProviderCard
                          image={option.icon}
                          onClick={() => {
                            navigateToProvider(option.value);
                          }}
                          title={option.label}
                        />
                      </FlexItem>
                    ))}
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
