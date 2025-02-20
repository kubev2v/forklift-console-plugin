import React from 'react';
import { TableLinkCell } from 'src/modules/Providers/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import { PlanModelGroupVersionKind } from '@kubev2v/types';

import { CellProps } from './CellProps';

export const PlanCell: React.FC<CellProps> = ({ data }) => {
  const { t } = useForkliftTranslation();

  const { obj } = data;
  if (!obj) {
    return <>-</>;
  }

  const labelColors = [];
  const labels = [];

  const { name, namespace } = obj?.metadata || {};
  const warm = obj?.spec?.warm;

  if (warm) {
    labelColors.push('orange');
    labels.push(t('Warm'));
  }

  return (
    <TableLinkCell
      groupVersionKind={PlanModelGroupVersionKind}
      name={name}
      namespace={namespace}
      hasLabel={warm}
      labelColor={labelColors}
      label={labels}
    />
  );
};
