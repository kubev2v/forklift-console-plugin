import React from 'react';

import { BlueInfoCircleIcon } from '@openshift-console/dynamic-plugin-sdk';
import { Button, Popover } from '@patternfly/react-core';

import { TextWithIcon } from './TextWithIcon';
import { categoryIcons } from './utils';

export interface StatusCellProps {
  label: string;
  conditions: { type?: string; message?: string; category?: string; status?: string }[];
  icon: React.ReactNode;
}

export const StatusCell: React.FC<StatusCellProps> = ({ label, conditions, icon }) => {
  if (!conditions?.length) {
    return <TextWithIcon label={label} icon={icon} />;
  }

  const allConditions = conditions.map(({ type, message, category, status }) => (
    <TextWithIcon
      className="forklift-table__flex-cell-popover"
      key={type}
      label={message || type}
      icon={categoryIcons[category]?.[status] || <BlueInfoCircleIcon />}
    />
  ));

  return (
    <Popover bodyContent={allConditions}>
      <Button variant="link" isInline aria-label={label}>
        <TextWithIcon label={label} icon={icon} />
      </Button>
    </Popover>
  );
};
