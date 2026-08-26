import { mockI18n } from '@test-utils/mockI18n';

mockI18n();

import { Table, Tbody } from '@patternfly/react-table';
import { render, screen } from '@testing-library/react';

import { type FolderRow, ROW_TYPE } from '../../../utils/types';
import FolderTreeRow from '../FolderTreeRow';

const folderRow = (folderName: string): FolderRow => ({
  folderName,
  isHidden: false,
  key: `folder-${folderName}`,
  treeRow: {
    props: {
      'aria-level': 1,
      'aria-posinset': 1,
      'aria-setsize': 1,
      isExpanded: true,
      isTreeExpanded: true,
    },
  } as FolderRow['treeRow'],
  type: ROW_TYPE.Folder,
});

describe('FolderTreeRow', () => {
  it('renders folder row with count from the map', () => {
    render(
      <Table>
        <Tbody>
          <FolderTreeRow groupVMCountByFolder={new Map([['Prod', 5]])} row={folderRow('Prod')} />
        </Tbody>
      </Table>,
    );

    expect(screen.getByTestId('folder-Prod')).toBeInTheDocument();
    expect(screen.getByTestId('folder-Prod-vm-count')).toBeInTheDocument();
  });

  it('defaults VM count to 0 when folder is missing from the map', () => {
    render(
      <Table>
        <Tbody>
          <FolderTreeRow groupVMCountByFolder={new Map()} row={folderRow('Missing')} />
        </Tbody>
      </Table>,
    );

    expect(screen.getByTestId('folder-Missing-vm-count')).toBeInTheDocument();
  });
});
