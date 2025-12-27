import type { FC } from 'react';
import { CREATE_VDDK_HELP_LINK } from 'src/plans/details/utils/constants';

import { ExternalLink } from '@components/common/ExternalLink/ExternalLink';
import { Alert, AlertVariant } from '@patternfly/react-core';
import { ForkliftTrans, useForkliftTranslation } from '@utils/i18n';

const SkipVddkAlert: FC = () => {
  const { t } = useForkliftTranslation();

  return (
    <Alert
      variant={AlertVariant.warning}
      isInline
      title={t('It is highly recommended to use a VDDK image.')}
    >
      <ForkliftTrans>
        <p>
          Not using a VDDK image could result in significantly lower migration speeds or a plan
          failing. For more information, see{' '}
          <ExternalLink isInline href={CREATE_VDDK_HELP_LINK}>
            Creating a VDDK image
          </ExternalLink>
        </p>
      </ForkliftTrans>
    </Alert>
  );
};

export default SkipVddkAlert;
