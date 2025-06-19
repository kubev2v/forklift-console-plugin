import type { FC } from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import { Card, CardBody, CardTitle } from '@patternfly/react-core';

import MigrationsListPage from './MigrationsListPage';

const HistoryCard: FC = () => {
  const { t } = useForkliftTranslation();

  return (
    <Card className="pf-m-full-height">
      <CardTitle className="forklift-title">{t('Migration history')}</CardTitle>
      <CardBody>
        <MigrationsListPage />
      </CardBody>
    </Card>
  );
};

export default HistoryCard;
