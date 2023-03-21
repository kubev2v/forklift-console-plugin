import React from 'react';
import { Link } from 'react-router-dom';
import * as C from 'src/utils/constants';

import { getResourceFieldValue } from '@kubev2v/common/components/Filter';
import { PATH_PREFIX } from '@kubev2v/legacy/common/constants';
import { OutlinedHddIcon } from '@patternfly/react-icons';

import { TextWithIcon } from '../../../components/cells/TextWithIcon';
import { CellProps } from './types';

export const HostCell: React.FC<CellProps> = ({ resourceData, resourceFields }) => {
  const { name, namespace } = resourceData?.metadata ?? {};
  const phase = getResourceFieldValue(resourceData, C.PHASE, resourceFields);
  const type = getResourceFieldValue(resourceData, C.TYPE, resourceFields);
  const hostCount = getResourceFieldValue(resourceData, C.HOST_COUNT, resourceFields);

  if (!resourceData.inventory?.name) {
    return null;
  }

  return (
    <>
      {phase === 'Ready' && hostCount && type === 'vsphere' && name && namespace ? (
        <Link to={`${PATH_PREFIX}/providers/vsphere/ns/${namespace}/${name}`}>
          <TextWithIcon icon={<OutlinedHddIcon />} label={hostCount} />
        </Link>
      ) : (
        <TextWithIcon icon={<OutlinedHddIcon />} label={hostCount} />
      )}
    </>
  );
};
