import React from 'react';
import { Link } from 'react-router-dom';
import { getResourceFieldValue } from 'common/src/components/Filter';
import * as C from 'src/utils/constants';

import { PATH_PREFIX } from '@kubev2v/legacy/common/constants';
import { OutlinedHddIcon } from '@patternfly/react-icons';

import { TextWithIcon } from './TextWithIcon';
import { CellProps } from './types';

export const HostCell: React.FC<CellProps> = ({ resourceData, resourceFields }) => {
  const { name, namespace } = resourceData?.metadata ?? {};
  const phase = getResourceFieldValue(resourceData, C.PHASE, resourceFields);
  const type = getResourceFieldValue(resourceData, C.TYPE, resourceFields);
  const hostCount = getResourceFieldValue(resourceData, C.HOST_COUNT, resourceFields);

  return (
    <>
      {phase === 'Ready' && hostCount && type === 'vsphere' ? (
        <Link
          to={
            namespace
              ? `${PATH_PREFIX}/providers/vsphere/ns/${namespace}/${name}`
              : `${PATH_PREFIX}/providers/vsphere/${name}`
          }
        >
          <TextWithIcon icon={<OutlinedHddIcon />} label={hostCount} />
        </Link>
      ) : (
        <TextWithIcon icon={<OutlinedHddIcon />} label={hostCount} />
      )}
    </>
  );
};
