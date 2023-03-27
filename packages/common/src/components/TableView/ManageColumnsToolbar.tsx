import React, { useState } from 'react';
import { useTranslation } from 'common/src/utils/i18n';

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
}

/**
 * Toggles a modal dialog for managing resourceFields visibility and order.
 */
export const ManageColumnsToolbar = ({
  resourceFields,
  setColumns,
  defaultColumns,
}: ManageColumnsToolbarProps) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  return (
    <ToolbarItem>
      <Tooltip content={t('Manage Columns')}>
        <Button variant="plain" onClick={() => setIsOpen(true)} aria-label={t('Manage Columns')}>
          <ColumnsIcon />
        </Button>
      </Tooltip>
      <ManageColumns
        showModal={isOpen}
        onClose={() => setIsOpen(false)}
        description={t('Selected resourceFields will be displayed in the table.')}
        resourceFields={resourceFields}
        onChange={setColumns}
        defaultColumns={defaultColumns}
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
}

const filterActionsAndHidden = (resourceFields: ResourceField[]) =>
  resourceFields.filter((col) => !col.isAction && !col.isHidden);

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
}: ManagedColumnsProps) => {
  const { t } = useTranslation();
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
      title={t('Manage Columns')}
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
          {t('Save')}
        </Button>,
        <Button key="cancel" variant="secondary" onClick={onClose}>
          {t('Cancel')}
        </Button>,
        <Button key="restore" variant="link" onClick={restoreDefaults}>
          {t('Restore default columns')}
        </Button>,
      ]}
    >
      <DragDrop onDrop={onDrop}>
        <Droppable hasNoWrapper>
          <DataList
            aria-label={t('Table column management')}
            id="table-column-management"
            isCompact
          >
            {editedColumns.map(({ resourceFieldId: id, isVisible, isIdentity, label }) => (
              <Draggable key={id} hasNoWrapper>
                <DataListItem aria-labelledby={`draggable-${id}`} ref={React.createRef()}>
                  <DataListItemRow>
                    <DataListControl>
                      <DataListDragButton
                        aria-label={t('Reorder')}
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
