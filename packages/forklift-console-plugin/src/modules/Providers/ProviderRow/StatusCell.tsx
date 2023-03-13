import React from 'react';
import { getResourceFieldValue } from 'common/src/components/Filter';
import { PHASE } from 'src/utils/constants';
import { useTranslation } from 'src/utils/i18n';

import { BlueInfoCircleIcon } from '@openshift-console/dynamic-plugin-sdk';
import { Button, Popover } from '@patternfly/react-core';

import { categoryIcons, phaseLabes, statusIcons } from './consts';
import { TextWithIcon } from './TextWithIcon';
import { CellProps } from './types';

export const StatusCell: React.FC<CellProps> = ({ resourceData, resourceFields }) => {
  const { t } = useTranslation();

  const phase = getResourceFieldValue(resourceData, PHASE, resourceFields);
  const phaseLable = phaseLabes[phase] ? t(phaseLabes[phase]) : t('Undefined');
  const providerHasConditions =
    resourceData?.status?.conditions && resourceData?.status?.conditions.length > 0;

  if (!providerHasConditions) {
    return <TextWithIcon label={phaseLable} icon={statusIcons[phase]} />;
  }

  const allConditions = resourceData.status.conditions.map((condition) => (
    <TextWithIcon
      key={condition.type}
      label={condition.message || condition.type}
      icon={categoryIcons[condition.category]?.[condition.status] || <BlueInfoCircleIcon />}
    />
  ));

  return (
    <Popover bodyContent={allConditions}>
      <Button variant="link" isInline aria-label={phaseLable}>
        <TextWithIcon label={phaseLable} icon={statusIcons[phase]} />
      </Button>
    </Popover>
  );
};
