import type { FC } from 'react';

import { HelperText, HelperTextItem } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import { OffloadMatchStatus } from '../../utils/types';

type OffloadOptimalityHintProps = {
  matchStatus: OffloadMatchStatus;
};

const OffloadOptimalityHint: FC<OffloadOptimalityHintProps> = ({ matchStatus }) => {
  const { t } = useForkliftTranslation();

  if (matchStatus === OffloadMatchStatus.Optimal) {
    return (
      <HelperText>
        <HelperTextItem variant="success">
          {t(
            'Optimal configuration — direct XCOPY/vol-to-vol transfers will be used for maximum performance.',
          )}
        </HelperTextItem>
      </HelperText>
    );
  }

  if (matchStatus === OffloadMatchStatus.Suboptimal) {
    return (
      <HelperText>
        <HelperTextItem variant="warning">
          {t(
            'Vendor mismatch detected. Migration will use a fallback transfer path (still accelerated, but suboptimal).',
          )}
        </HelperTextItem>
      </HelperText>
    );
  }

  return null;
};

export default OffloadOptimalityHint;
