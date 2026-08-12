import type { FC } from 'react';

import { pluralize } from '@patternfly/react-core';
import { Td, Tr } from '@patternfly/react-table';
import { EMPTY_MSG } from '@utils/constants';
import { isEmpty } from '@utils/helpers';

import { AFFINITY_CONDITION_LABELS, AFFINITY_TYPE_LABELS } from './utils/constants';
import type { AffinityRowData } from './utils/types';
import AffinityRowActionsDropdown from './AffinityRowActionsDropdown';

type AffinityRowProps = {
  affinity: AffinityRowData;
  onDelete: (affinity: AffinityRowData) => void;
  onEdit: (affinity: AffinityRowData) => void;
};

const AffinityRow: FC<AffinityRowProps> = ({ affinity, onDelete, onEdit }) => {
  const expressionsLabel =
    !isEmpty(affinity?.expressions) && pluralize(affinity?.expressions?.length ?? 0, 'Expression');
  const fieldsLabel =
    !isEmpty(affinity?.fields) && pluralize(affinity?.fields?.length ?? 0, 'Node Field');

  return (
    <Tr>
      <Td dataLabel="type">{AFFINITY_TYPE_LABELS[affinity?.type]}</Td>
      <Td dataLabel="condition">{AFFINITY_CONDITION_LABELS[affinity?.condition]}</Td>
      <Td dataLabel="weight">{affinity?.weight ?? EMPTY_MSG}</Td>
      <Td dataLabel="terms">
        <div>{expressionsLabel}</div> <div>{fieldsLabel}</div>
      </Td>
      <Td className="pf-v6-c-table__action">
        <AffinityRowActionsDropdown affinity={affinity} onDelete={onDelete} onEdit={onEdit} />
      </Td>
    </Tr>
  );
};

export default AffinityRow;
