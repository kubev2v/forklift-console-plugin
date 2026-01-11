import type { FC } from 'react';

import { ForkliftTrans } from '@utils/i18n';

export const InsecureSkipVerifyHelperTextPopover: FC = () => (
  <ForkliftTrans>
    <p>
      Select <strong>Skip certificate validation</strong> to skip certificate verification, which
      proceeds with an insecure migration and then the certificate is not required. Insecure
      migration means that the transferred data is sent over an insecure connection and potentially
      sensitive data could be exposed.
    </p>
  </ForkliftTrans>
);
