import type { FC } from 'react';
import { useFormContext } from 'react-hook-form';

import { t } from '@utils/i18n';

import type { HookFormValues } from '../state/types';

type HooksActionHelperMessageContentProps = {
  planEditable: boolean;
};

const HooksActionHelperMessageContent: FC<HooksActionHelperMessageContentProps> = ({
  planEditable,
}) => {
  const {
    formState: { isDirty },
  } = useFormContext<HookFormValues>();

  if (!planEditable) return t('Can not update plan hooks when the plan is not editable.');

  if (!isDirty) return t('Update is disabled until a change is detected.');

  return t('Click the update hooks button to save your changes.');
};

export default HooksActionHelperMessageContent;
