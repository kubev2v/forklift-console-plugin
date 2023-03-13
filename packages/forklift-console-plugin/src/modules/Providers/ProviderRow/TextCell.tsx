import React from 'react';
import { getResourceFieldValue } from 'common/src/components/Filter';

import { Text } from '@patternfly/react-core';

import { CellProps } from './types';

export const TextCell: React.FC<CellProps> = ({
  resourceData,
  resourceFieldId,
  resourceFields,
}) => {
  const label = (
    getResourceFieldValue(resourceData, resourceFieldId, resourceFields) ?? ''
  ).toString();

  return <Text>{label}</Text>;
};
