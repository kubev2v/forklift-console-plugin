import type { FC } from 'react';

import { t } from '@utils/i18n';

type HooksActionHelperMessageContentProps = {
  planEditable: boolean;
  stateChanged: boolean;
};

const HooksActionHelperMessageContent: FC<HooksActionHelperMessageContentProps> = ({
  planEditable,
  stateChanged,
}) => {
  if (!planEditable) return t('Can not update plan hooks when the plan is not editable.');

  if (!stateChanged) return t('Update is disabled until a change is detected.');

  return t('Click the update hooks button to save your changes.');
};

export default HooksActionHelperMessageContent;
