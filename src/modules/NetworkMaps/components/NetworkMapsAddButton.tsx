import type { FC } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';
import { getResourceUrl } from 'src/modules/Providers/utils/helpers/getResourceUrl';
import { useForkliftTranslation } from 'src/utils/i18n';

import { NetworkMapModelRef } from '@kubev2v/types';
import { Button, ButtonVariant } from '@patternfly/react-core';

const NetworkMapsAddButton: FC<{ namespace?: string; testId?: string }> = ({
  namespace,
  testId,
}) => {
  const { t } = useForkliftTranslation();
  const navigate = useNavigate();

  const NetworkMapsListURL = getResourceUrl({
    namespace,
    namespaced: namespace !== undefined,
    reference: NetworkMapModelRef,
  });

  const onClick = () => {
    navigate(`${NetworkMapsListURL}/~new`);
  };

  return (
    <Button data-testid={testId} variant={ButtonVariant.primary} onClick={onClick}>
      {t('Create network map')}
    </Button>
  );
};

export default NetworkMapsAddButton;
