import { type FC, useMemo } from 'react';
import { Link } from 'react-router';

import { STATUS_ICONS } from '@components/status/statusIcons';
import {
  Bullseye,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Content,
  ContentVariants,
  Flex,
  FlexItem,
  Spinner,
} from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';
import {
  MIGRATION_ALERT_NAME,
  MONITORING_ALERTS_PATH,
} from '@utils/hooks/useMigrationAlerts/constants';
import useMigrationAlerts from '@utils/hooks/useMigrationAlerts/useMigrationAlerts';
import { useForkliftTranslation } from '@utils/i18n';

import AlertListItem from './AlertListItem';
import AlertSummaryItem from './AlertSummaryItem';

import './MigrationAlertsCard.scss';

const MigrationAlertsCard: FC = () => {
  const { t } = useForkliftTranslation();
  const { alerts, loaded } = useMigrationAlerts();

  const failedCount = useMemo(
    () => alerts.filter((a) => a.alertName === MIGRATION_ALERT_NAME.FAILED).length,
    [alerts],
  );

  const succeededCount = useMemo(
    () => alerts.filter((a) => a.alertName === MIGRATION_ALERT_NAME.SUCCEEDED).length,
    [alerts],
  );

  const renderAlertList = (): JSX.Element => {
    if (!loaded) {
      return (
        <Bullseye>
          <Spinner aria-label={t('Loading migration alerts')} />
        </Bullseye>
      );
    }

    if (isEmpty(alerts)) {
      return (
        <Bullseye>
          <Content component={ContentVariants.p} className="migration-alerts-card__empty-text">
            {t('No migrations have completed or failed yet.')}
          </Content>
        </Bullseye>
      );
    }

    return (
      <>
        {alerts.map((alert) => (
          <AlertListItem alert={alert} key={`${alert.alertName}-${alert.planUid}`} />
        ))}
      </>
    );
  };

  return (
    <Card data-testid="migration-alerts-card" isCompact>
      <CardHeader
        actions={{
          actions: (
            <Link className="migration-alerts-card__view-all" to={MONITORING_ALERTS_PATH}>
              {t('View alerts')}
            </Link>
          ),
          hasNoOffset: false,
        }}
      >
        <CardTitle className="migration-alerts-card__title">{t('Migration plan alerts')}</CardTitle>
      </CardHeader>

      <CardBody className="migration-alerts-card__summary">
        <Flex spaceItems={{ default: 'spaceItemsXl' }}>
          <FlexItem>
            <AlertSummaryItem count={failedCount} icon={STATUS_ICONS.danger} label={t('Failed')} />
          </FlexItem>
          <FlexItem>
            <AlertSummaryItem
              count={succeededCount}
              icon={STATUS_ICONS.success}
              label={t('Succeeded')}
            />
          </FlexItem>
        </Flex>
      </CardBody>

      <CardBody className="migration-alerts-card__alert-list">{renderAlertList()}</CardBody>
    </Card>
  );
};

export default MigrationAlertsCard;
