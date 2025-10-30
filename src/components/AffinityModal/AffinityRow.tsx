import type { FC } from 'react';

import AffinityDataCell from '@components/AffinityModal/AffinityDataCell';
import type { RowProps } from '@openshift-console/dynamic-plugin-sdk';
import { pluralize } from '@patternfly/react-core';
import { EMPTY_MSG } from '@utils/constants';
import { isEmpty } from '@utils/helpers';

import { AFFINITY_CONDITION_LABELS, AFFINITY_TYPE_LABELS } from './utils/constants';
import type { AffinityRowData } from './utils/types';
import AffinityRowActionsDropdown from './AffinityRowActionsDropdown';

export type AffinityRowDataProps = {
  onDelete: (affinity: AffinityRowData) => void;
  onEdit: (affinity: AffinityRowData) => void;
};

const AffinityRow: FC<RowProps<AffinityRowData, AffinityRowDataProps>> = ({
  activeColumnIDs,
  obj: affinity,
  rowData: { onDelete, onEdit },
}) => {
  const expressionsLabel =
    !isEmpty(affinity?.expressions) && pluralize(affinity?.expressions?.length ?? 0, 'Expression');
  const fieldsLabel =
    !isEmpty(affinity?.fields) && pluralize(affinity?.fields?.length ?? 0, 'Node Field');
  return (
    <>
      <AffinityDataCell activeColumnIDs={activeColumnIDs} id="type">
        {AFFINITY_TYPE_LABELS[affinity?.type]}
      </AffinityDataCell>
      <AffinityDataCell activeColumnIDs={activeColumnIDs} id="condition">
        {AFFINITY_CONDITION_LABELS[affinity?.condition]}
      </AffinityDataCell>
      <AffinityDataCell activeColumnIDs={activeColumnIDs} id="weight">
        {affinity?.weight ?? EMPTY_MSG}
      </AffinityDataCell>
      <AffinityDataCell activeColumnIDs={activeColumnIDs} id="terms">
        <div>{expressionsLabel}</div> <div>{fieldsLabel}</div>
      </AffinityDataCell>
      <AffinityDataCell activeColumnIDs={activeColumnIDs} className="pf-v5-c-table__action" id="">
        <AffinityRowActionsDropdown affinity={affinity} onDelete={onDelete} onEdit={onEdit} />
      </AffinityDataCell>
    </>
  );
};

export default AffinityRow;
