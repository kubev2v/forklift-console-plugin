import type { FC } from 'react';

import { ForkliftTrans } from '@utils/i18n';

export const CacertHelperTextPopover: FC = () => (
  <ForkliftTrans>
    <p>
      Use the CA certificate of the Manager unless it was replaced by a third-party certificate, in
      which case enter the Manager Apache CA certificate.
    </p>
    <p>When left empty the system CA certificate is used.</p>
    <p>
      The certificate is not verified when <strong>Skip certificate validation</strong> is set.
    </p>
  </ForkliftTrans>
);
