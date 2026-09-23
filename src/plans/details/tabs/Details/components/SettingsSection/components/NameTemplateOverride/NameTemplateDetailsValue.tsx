import type { FC } from 'react';
import type { NameTemplateType } from 'src/plans/details/utils/nameTemplateOverrides';

import { Label } from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import NameTemplateOverridePopover from './NameTemplateOverridePopover';

type NameTemplateDetailsValueProps = {
  canApply: boolean;
  isPlanCustom: boolean;
  onApply: () => Promise<unknown>;
  templateType: NameTemplateType;
  vmNames: string[];
};

const NameTemplateDetailsValue: FC<NameTemplateDetailsValueProps> = ({
  canApply,
  isPlanCustom,
  onApply,
  templateType,
  vmNames,
}) => {
  const { t } = useForkliftTranslation();
  const statusText = isPlanCustom ? t('Use custom') : t('Use default');

  if (isEmpty(vmNames)) {
    return (
      <Label color="grey" isCompact>
        {statusText}
      </Label>
    );
  }

  const triggerLabel = t('{{status}} · {{count}} VMs override', {
    count: vmNames.length,
    status: statusText,
  });

  return (
    <NameTemplateOverridePopover
      canApply={canApply}
      onApply={onApply}
      templateType={templateType}
      triggerLabel={triggerLabel}
      vmNames={vmNames}
    />
  );
};

export default NameTemplateDetailsValue;
