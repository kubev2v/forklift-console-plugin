import type { ReactElement } from 'react';
import { MemoryRouter } from 'react-router';

import type { ResourceField } from '@components/common/utils/types';
import { render, type RenderResult } from '@testing-library/react';

export const mockData = [
  { id: '1', name: 'Item 1', status: 'Ready' },
  { id: '2', name: 'Item 2', status: 'NotReady' },
  { id: '3', name: 'Item 3', status: 'Ready' },
];

export const fieldsMetadata: ResourceField[] = [
  {
    resourceFieldId: 'name',
    label: 'Name',
    isVisible: true,
    isIdentity: true,
    sortable: true,
  },
  {
    resourceFieldId: 'status',
    label: 'Status',
    isVisible: true,
    isIdentity: false,
    filter: {
      type: 'enum',
      values: [
        { id: 'Ready', label: 'Ready' },
        { id: 'NotReady', label: 'Not Ready' },
      ],
    },
  },
];

export const renderWithRouter = (component: ReactElement): RenderResult =>
  render(<MemoryRouter>{component}</MemoryRouter>);
