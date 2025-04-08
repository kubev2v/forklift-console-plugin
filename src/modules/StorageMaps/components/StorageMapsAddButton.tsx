import type { FC } from 'react';
import { useHistory } from 'react-router';
import { getResourceUrl } from 'src/modules/Providers/utils/helpers/getResourceUrl';
import { useForkliftTranslation } from 'src/utils/i18n';

import { StorageMapModelRef } from '@kubev2v/types';
import { Button } from '@patternfly/react-core';

const StorageMapsAddButton: FC<{ namespace: string; dataTestId?: string }> = ({
  dataTestId,
  namespace,
}) => {
  const { t } = useForkliftTranslation();
  const history = useHistory();

  const StorageMapsListURL = getResourceUrl({
    namespace,
    namespaced: namespace !== undefined,
    reference: StorageMapModelRef,
  });

  const onClick = () => {
    history.push(`${StorageMapsListURL}/~new`);
  };

  return (
    <Button data-testid={dataTestId} variant="primary" onClick={onClick}>
      {t('Create StorageMap')}
    </Button>
  );
};

export default StorageMapsAddButton;
