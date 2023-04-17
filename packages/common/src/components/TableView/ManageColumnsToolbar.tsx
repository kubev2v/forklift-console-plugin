import React, { useState } from 'react';

import {
  Button,
  DataList,
  DataListCell,
  DataListCheck,
  DataListControl,
  DataListDragButton,
  DataListItem,
  DataListItemCells,
  DataListItemRow,
  DragDrop,
  Draggable,
  Droppable,
  Modal,
  Text,
  TextContent,
  TextVariants,
  ToolbarItem,
  Tooltip,
} from '@patternfly/react-core';
import { ColumnsIcon } from '@patternfly/react-icons';

import { ResourceField } from '../types';

export interface ManageColumnsToolbarProps {
  /** Read only. State maintained by parent component. */
  resourceFields: ResourceField[];
  /** Read only. The defaults used for initialization.*/
  defaultColumns: ResourceField[];
  /** Setter to modify state in the parent.*/
  setColumns(resourceFields: ResourceField[]): void;
  labels: Record<keyof typeof defaultLabels, string>;
}

/**
 * Toggles a modal dialog for managing resourceFields visibility and order.
 */
export const ManageColumnsToolbar = ({
  resourceFields,
  setColumns,
  defaultColumns,
  labels = defaultLabels,
}: ManageColumnsToolbarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <ToolbarItem>
      <Tooltip content={labels.manageColumns}>
        <Button variant="plain" onClick={() => setIsOpen(true)} aria-label={labels.manageColumns}>
          <ColumnsIcon />
        </Button>
      </Tooltip>
      <ManageColumns
        showModal={isOpen}
        onClose={() => setIsOpen(false)}
        description={labels.description}
        resourceFields={resourceFields}
        onChange={setColumns}
        defaultColumns={defaultColumns}
        labels={labels}
      />
    </ToolbarItem>
  );
};

interface ManagedColumnsProps {
  showModal: boolean;
  description: string;
  onClose(): void;
  /** Setter to modify state in the parent.*/
  onChange(columns: ResourceField[]): void;
  /** Read only. State maintained by parent component. */
  resourceFields: ResourceField[];
  /** Read only. The defaults used for initialization.*/
  defaultColumns: ResourceField[];
  labels: Record<keyof typeof defaultLabels, string>;
}

const filterActionsAndHidden = (resourceFields: ResourceField[]) =>
  resourceFields.filter((col) => !col.isAction && !col.isHidden);

const defaultLabels = {
  manageColumns: 'Manage Columns',
  description: 'Selected columns will be displayed in the table.',
  save: 'Save',
  cancel: 'Cancel',
  restoreDefaults: 'Restore default columns',
  reorder: 'Reorder',
  tableColumnManagement: 'Table column management',
};
/**
 * Modal dialog for managing resourceFields.
 * Supported features:
 * 1. toggle column visibility (disabled for identity resourceFields that should always be displayed to uniquely identify a row)
 * 2. re-order the resourceFields using drag and drop
 */
const ManageColumns = ({
  showModal,
  description,
  onClose,
  onChange,
  resourceFields,
  defaultColumns,
  labels = defaultLabels,
}: ManagedColumnsProps) => {
  const [editedColumns, setEditedColumns] = useState(filterActionsAndHidden(resourceFields));
  const restoreDefaults = () => setEditedColumns([...filterActionsAndHidden(defaultColumns)]);
  const onDrop = (source: { index: number }, dest: { index: number }) => {
    const draggedItem = editedColumns[source?.index];
    const itemCurrentlyAtDestination = editedColumns[dest?.index];
    if (!draggedItem || !itemCurrentlyAtDestination) {
      return false;
    }
    const base = editedColumns.filter(
      ({ resourceFieldId: id }) => id !== draggedItem?.resourceFieldId,
    );
    setEditedColumns([
      ...base.slice(0, dest.index),
      draggedItem,
      ...base.slice(dest.index, base.length),
    ]);
    return true;
  };
  const onSelect = (updatedId: string, updatedValue: boolean): void => {
    setEditedColumns(
      editedColumns.map(({ resourceFieldId, isVisible, ...rest }) => ({
        resourceFieldId,
        ...rest,
        isVisible: resourceFieldId === updatedId ? updatedValue : isVisible,
      })),
    );
  };
  const onSave = () => {
    // assume that action resourceFields are always at the end
    onChange([...editedColumns, ...resourceFields.filter((col) => col.isAction)]);
    onClose();
  };

  return (
    <Modal
      title={labels.manageColumns}
      isOpen={showModal}
      variant="small"
      description={
        <TextContent>
          <Text component={TextVariants.p}>{description}</Text>
        </TextContent>
      }
      onClose={onClose}
      actions={[
        <Button
          key="save"
          variant="primary"
          isDisabled={resourceFields === editedColumns}
          onClick={onSave}
        >
          {labels.save}
        </Button>,
        <Button key="cancel" variant="secondary" onClick={onClose}>
          {labels.cancel}
        </Button>,
        <Button key="restore" variant="link" onClick={restoreDefaults}>
          {labels.restoreDefaults}
        </Button>,
      ]}
    >
      <DragDrop onDrop={onDrop}>
        <Droppable hasNoWrapper>
          <DataList
            aria-label={labels.tableColumnManagement}
            id="table-column-management"
            isCompact
          >
            {editedColumns.map(({ resourceFieldId: id, isVisible, isIdentity, label }) => (
              <Draggable key={id} hasNoWrapper>
                <DataListItem aria-labelledby={`draggable-${id}`} ref={React.createRef()}>
                  <DataListItemRow>
                    <DataListControl>
                      <DataListDragButton
                        aria-label={labels.reorder}
                        aria-labelledby={`draggable-${id}`}
                      />
                      <DataListCheck
                        aria-labelledby={`draggable-${id}`}
                        name={id}
                        checked={
                          // visibility for identity resourceFields (namespace) is governed by parent component
                          isIdentity
                            ? resourceFields.find((c) => c.resourceFieldId === id)?.isVisible
                            : isVisible
                        }
                        isDisabled={isIdentity}
                        onChange={(value) => onSelect(id, value)}
                        otherControls
                      />
                    </DataListControl>
                    <DataListItemCells
                      dataListCells={[
                        <DataListCell key={id}>
                          <span id={`draggable-${id}`}>{label}</span>
                        </DataListCell>,
                      ]}
                    />
                  </DataListItemRow>
                </DataListItem>
              </Draggable>
            ))}
          </DataList>
        </Droppable>
      </DragDrop>
    </Modal>
  );
};
