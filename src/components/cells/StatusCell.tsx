import React from 'react';

import { Button, Popover } from '@patternfly/react-core';
import { InfoCircleIcon } from '@patternfly/react-icons';

import { TextWithIcon } from './TextWithIcon';
import { categoryIcons } from './utils';

export type StatusCellProps = {
  label: string;
  conditions: { type?: string; message?: string; category?: string; status?: string }[];
  icon: React.ReactNode;
};

export const StatusCell: React.FC<StatusCellProps> = ({ conditions, icon, label }) => {
  if (!conditions?.length) {
    return <TextWithIcon label={label} icon={icon} />;
  }

  const allConditions = conditions.map(({ category, message, status, type }) => (
    <TextWithIcon
      className="forklift-table__flex-cell-popover"
      key={type}
      label={message || type}
      icon={categoryIcons[category]?.[status] || <InfoCircleIcon color="#2B9AF3" />}
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
