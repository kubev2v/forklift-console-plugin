import type { SelectOptionProps } from '@patternfly/react-core';

import DiskOptionItem from '../components/DiskOptionItem';

import { diskOptions, getRootDiskLabelByKey } from './utils';

export const getDiskOptionItems = (): SelectOptionProps[] =>
  diskOptions().map(({ description, key }) => ({
    children: <DiskOptionItem label={getRootDiskLabelByKey(key)} description={description} />,
    itemId: key,
  }));
