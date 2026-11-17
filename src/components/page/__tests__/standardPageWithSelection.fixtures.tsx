import type { ReactElement } from 'react';
import { MemoryRouter } from 'react-router';

import type { GlobalActionToolbarProps, ResourceField } from '@components/common/utils/types';
import { render, type RenderResult } from '@testing-library/react';

export const mockData = [
  { id: '1', name: 'Item 1' },
  { id: '2', name: 'Item 2' },
  { id: '3', name: 'Item 3' },
];

export const fieldsMetadata: ResourceField[] = [
  {
    resourceFieldId: 'name',
    label: 'Name',
    isVisible: true,
    isIdentity: true,
  },
  {
    resourceFieldId: 'id',
    label: 'ID',
    isVisible: true,
    isIdentity: false,
    filter: {
      type: 'freetext',
    },
  },
];

export const toId = (item: { id: string }): string => item.id;

export const renderWithRouter = (component: ReactElement): RenderResult =>
  render(<MemoryRouter>{component}</MemoryRouter>);

export const ExpandedContent = (): ReactElement => <div>Expanded details</div>;

export const SelectedIdsProbe = ({
  selectedIds,
}: GlobalActionToolbarProps<{ id: string }>): ReactElement => (
  <div data-testid="selected-ids-probe">{(selectedIds ?? []).join(',')}</div>
);
