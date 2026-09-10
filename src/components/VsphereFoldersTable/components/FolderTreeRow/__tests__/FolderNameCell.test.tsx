import { mockI18n } from '@test-utils/mockI18n';

mockI18n();

import { render, screen } from '@testing-library/react';

import { type FolderRow, ROW_TYPE } from '../../../utils/types';
import FolderNameCell from '../FolderNameCell';

const folderRow = (folderName: string): FolderRow => ({
  folderName,
  isHidden: false,
  key: `folder-${folderName}`,
  treeRow: { props: {} } as FolderRow['treeRow'],
  type: ROW_TYPE.Folder,
});

describe('FolderNameCell', () => {
  it('renders folder name and VM count label', () => {
    render(<FolderNameCell row={folderRow('Production')} vmCount={3} />);

    expect(screen.getByText('Production')).toBeInTheDocument();
    expect(screen.getByTestId('folder-Production-vm-count')).toHaveTextContent(/3\s+VMs?/);
  });

  it('renders zero VM count', () => {
    render(<FolderNameCell row={folderRow('Empty')} vmCount={0} />);

    expect(screen.getByTestId('folder-Empty-vm-count')).toHaveTextContent(/0\s+VMs?/);
  });
});
