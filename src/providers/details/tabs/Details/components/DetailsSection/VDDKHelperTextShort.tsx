import type { FC } from 'react';
import { CREATE_VDDK_HELP_LINK } from 'src/plans/details/utils/constants';

import { ExternalLink } from '@components/common/ExternalLink/ExternalLink';
import { ForkliftTrans } from '@utils/i18n';

const VDDKHelperTextShort: FC = () => (
  <ForkliftTrans>
    <p>
      It is strongly recommended to use a VDDK image. Not using a VDDK image could result in
      significantly lower migration speeds or a plan failing. For more information, see{' '}
      <ExternalLink isInline href={CREATE_VDDK_HELP_LINK}>
        Creating a VDDK image
      </ExternalLink>
      .
    </p>
  </ForkliftTrans>
);

export default VDDKHelperTextShort;
