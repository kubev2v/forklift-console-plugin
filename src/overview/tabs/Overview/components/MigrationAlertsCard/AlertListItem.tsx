import type { FC } from 'react';
import { Link } from 'react-router-dom-v5-compat';

import { ConsoleTimestamp } from '@components/ConsoleTimestamp/ConsoleTimestamp';
import { STATUS_ICONS } from '@components/status/statusIcons';
import { Content, ContentVariants, Flex, FlexItem, Split, SplitItem } from '@patternfly/react-core';
import {
  MIGRATION_ALERT_NAME,
  MONITORING_ALERTS_PATH,
} from '@utils/hooks/useMigrationAlerts/constants';
import type { MigrationAlert } from '@utils/hooks/useMigrationAlerts/types';
import { useForkliftTranslation } from '@utils/i18n';

type AlertListItemProps = {
  alert: MigrationAlert;
};

const getAlertDetailsPath = (alertName: string): string =>
  `${MONITORING_ALERTS_PATH}?alertname=${alertName}`;

const AlertListItem: FC<AlertListItemProps> = ({ alert }) => {
  const { t } = useForkliftTranslation();
  const isFailed = alert.alertName === MIGRATION_ALERT_NAME.FAILED;
  const icon = isFailed ? STATUS_ICONS.danger : STATUS_ICONS.success;

  return (
    <Split className="migration-alerts-card__alert-item" hasGutter>
      <SplitItem>{icon}</SplitItem>
      <SplitItem isFilled>
        <Split>
          <SplitItem isFilled>
            <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsNone' }}>
              <FlexItem>
                <Content
                  component={ContentVariants.p}
                  className="migration-alerts-card__alert-title"
                >
                  {alert.alertName}
                </Content>
              </FlexItem>
              {alert.activeAt && (
                <FlexItem>
                  <ConsoleTimestamp showGlobalIcon={false} timestamp={alert.activeAt} />
                </FlexItem>
              )}
            </Flex>
          </SplitItem>
          <SplitItem>
            <Link to={getAlertDetailsPath(alert.alertName)}>{t('View details')}</Link>
          </SplitItem>
        </Split>
        {alert.description && (
          <Content
            component={ContentVariants.p}
            className="migration-alerts-card__alert-description"
          >
            {alert.description}
          </Content>
        )}
      </SplitItem>
    </Split>
  );
};

export default AlertListItem;
