import type { FC } from 'react';

import type { V1beta1Provider } from '@forklift-ui/types';
import {
  Alert,
  AlertVariant,
  Button,
  ButtonVariant,
  Content,
  ContentVariants,
  PageSection,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import useProviderIssuesAlerts from '../../hooks/useProviderIssuesAlerts';

import './ProviderIssuesAlerts.scss';

type ProviderIssuesAlertsProps = {
  provider: V1beta1Provider;
  setIsDrawerOpen?: (isOpen: boolean) => void;
};

const ProviderIssuesAlerts: FC<ProviderIssuesAlertsProps> = ({ provider, setIsDrawerOpen }) => {
  const { t } = useForkliftTranslation();
  const { elevatedConditions, hasCriticalElevatedConditions, showElevatedConditions } =
    useProviderIssuesAlerts(provider);

  if (!showElevatedConditions) {
    return null;
  }

  return (
    <PageSection
      className="forklift-page-header-alerts provider-issues-alerts"
      hasBodyWrapper={false}
    >
      <Alert
        data-testid="provider-issues-alert"
        title={t('{{count}} issues impacting this provider', {
          count: elevatedConditions.length,
        })}
        variant={hasCriticalElevatedConditions ? AlertVariant.danger : AlertVariant.warning}
      >
        <Content component={ContentVariants.p}>
          <Stack hasGutter>
            <StackItem>
              {t('Review these conditions to ensure your provider is configured correctly.')}
            </StackItem>
            {hasCriticalElevatedConditions && (
              <StackItem>{t('To troubleshoot, check the Forklift controller pod logs.')}</StackItem>
            )}
            <StackItem>
              <Button
                data-testid="view-all-provider-issues-button"
                isInline
                onClick={() => {
                  setIsDrawerOpen?.(true);
                }}
                variant={ButtonVariant.link}
              >
                {t('View all issues')}
              </Button>
            </StackItem>
          </Stack>
        </Content>
      </Alert>
    </PageSection>
  );
};

export default ProviderIssuesAlerts;
