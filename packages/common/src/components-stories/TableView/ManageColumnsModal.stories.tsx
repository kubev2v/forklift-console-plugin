import React, { useState } from 'react';

import type { Meta } from '@storybook/react';

import { ManageColumnsToolbarItem } from '../../components/TableView';
import { ManageColumnsModal } from '../../components/TableView/ManageColumnsModal';

const meta: Meta<typeof ManageColumnsModal> = {
  title: 'Common package components/TableView/ManageColumnsModal',
  component: ManageColumnsModal,
  tags: ['autodocs'],
  parameters: {
    componentSubtitle:
      'A table is used to display large data sets that can be easily laid out in a simple grid with column headers.',
  },
};

export default meta;

const Template = (args) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div>
      <ManageColumnsToolbarItem
        showDialog={() => setIsOpen(true)}
        ariaLabel={'Manage Columns'}
        tooltip={'Manage Columns'}
      >
        <ManageColumnsModal
          {...args}
          showModal={isOpen}
          onClose={() => setIsOpen(false)}
          onChange={() => setIsOpen(false)}
        />
      </ManageColumnsToolbarItem>
      {"   (<-Click the 'Manage Columns' button for displaying the modal)"}
    </div>
  );
};

/**
 * An example for a managed columns modal with 4 fields.
 * The ``Name`` field is disabled since it's an identified field.
 * The ``Namespace`` field is hidden by default.
 * And other 2 fields (``Type``, ``Status``) are enabled and visible for managing by default.
 */
export const Basic = Template.bind({});

Basic.args = {
  resourceFields: [
    {
      resourceFieldId: 'type',
      label: 'Type',
      isVisible: true,
      sortable: true,
      filter: true,
      isAction: false,
      isIdentity: false,
    },
    {
      resourceFieldId: 'name',
      label: 'Name',
      isVisible: true,
      sortable: true,
      filter: true,
      isAction: false,
      isIdentity: true,
    },
    {
      resourceFieldId: 'status',
      label: 'Status',
      isVisible: true,
      sortable: true,
      filter: true,
      isAction: false,
      isIdentity: false,
    },
    {
      resourceFieldId: 'namespace',
      label: 'Namespace',
      isVisible: false,
      sortable: false,
      filter: true,
      isAction: false,
      isIdentity: false,
    },
  ],

  defaultColumns: [
    {
      resourceFieldId: 'type',
      label: 'Type',
      isVisible: true,
      sortable: true,
      filter: true,
      isAction: false,
      isIdentity: false,
    },
    {
      resourceFieldId: 'name',
      label: 'Name',
      isVisible: true,
      sortable: true,
      filter: true,
      isAction: false,
      isIdentity: true,
    },
    {
      resourceFieldId: 'status',
      label: 'Status',
      isVisible: true,
      sortable: true,
      filter: true,
      isAction: false,
      isIdentity: false,
    },
    {
      resourceFieldId: 'namespace',
      label: 'Namespace',
      isVisible: false,
      sortable: false,
      filter: true,
      isAction: false,
      isIdentity: false,
    },
  ],
};
