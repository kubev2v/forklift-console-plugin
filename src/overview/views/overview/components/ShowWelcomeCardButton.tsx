import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useCreateOverviewContext } from 'src/modules/Overview/hooks/OverviewContextProvider';

import { Label } from '@patternfly/react-core';

export const ShowWelcomeCardButton: FC = () => {
  const { t } = useTranslation();

  // Set and use context data for the overview page state
  const { setData } = useCreateOverviewContext();
  const { data: { hideWelcomeCardByContext } = {} } = useCreateOverviewContext();
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
