import type { FC } from 'react';

import { Alert } from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

type MigrationProgressErrorReasonsProps = {
  reasons?: string[];
};

const MigrationProgressErrorReasons: FC<MigrationProgressErrorReasonsProps> = ({ reasons }) => {
  const { t } = useForkliftTranslation();

  if (!reasons || isEmpty(reasons)) {
    return null;
  }

  return (
    <div className="pf-v6-u-mt-sm">
      <Alert isInline isPlain title={t('Error details')} variant="danger">
        <ul>
          {reasons.map((reason) => (
            <li key={reason}>{reason}</li>
          ))}
        </ul>
      </Alert>
    </div>
  );
};

export default MigrationProgressErrorReasons;
