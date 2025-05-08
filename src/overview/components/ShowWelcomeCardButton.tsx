import { type FC, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { CreateOverviewContext } from 'src/overview/hooks/OverviewContext';

import { Label } from '@patternfly/react-core';

export const ShowWelcomeCardButton: FC = () => {
  const { t } = useTranslation();
  const { data: { hideWelcomeCardByContext } = {}, setData } = useContext(CreateOverviewContext);

  const onClick = () => {
    setData({ hideWelcomeCardByContext: false });
  };

  if (!hideWelcomeCardByContext) return null;

  return (
    <Label
      color="purple"
      onClick={onClick}
      onClose={() => null}
      style={{ cursor: 'pointer' }}
      data-testid="show-welcome-card"
    >
      {t('Show the welcome card')}
    </Label>
  );
};
