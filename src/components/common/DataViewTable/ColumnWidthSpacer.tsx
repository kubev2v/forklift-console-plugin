import type { FC } from 'react';

import { Td } from '@patternfly/react-table';

import { getColumnWidthSpacerProps } from './dataViewColumnUtils';

const ColumnWidthSpacer: FC = () => <Td {...getColumnWidthSpacerProps()} />;

export default ColumnWidthSpacer;
