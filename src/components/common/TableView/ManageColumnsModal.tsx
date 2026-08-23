import { type ReactElement, useState } from 'react';

import { Button, ButtonVariant, Content, ContentVariants } from '@patternfly/react-core';
import { Modal, ModalBody, ModalFooter, ModalHeader } from '@patternfly/react-core';
import type { DraggableObject } from '@patternfly/react-drag-drop';

import type { ResourceField } from '../utils/types';

import { ManageColumnsDragDropList } from './ManageColumnsDragDropList';
import { filterActionsAndHidden } from './manageColumnsUtils';

type ManagedColumnsProps = {
  cancelLabel?: string;
  defaultColumns: ResourceField[];
  description?: string;
  onChange: (columns: ResourceField[]) => void;
  onClose: () => void;
  reorderLabel?: string;
  resourceFields: ResourceField[];
  restoreLabel?: string;
  saveLabel?: string;
  showModal: boolean;
  title?: string;
};

export const ManageColumnsModal = ({
  cancelLabel = 'Cancel',
  defaultColumns,
  description = 'Selected columns will be displayed in the table.',
  onChange,
  onClose,
  reorderLabel: _reorderLabel = 'Reorder',
  resourceFields,
  restoreLabel = 'Restore default columns',
  saveLabel = 'Save',
  showModal,
  title = 'Manage columns',
}: ManagedColumnsProps): ReactElement => {
  const [editedColumns, setEditedColumns] = useState(filterActionsAndHidden(resourceFields));

  const restoreDefaults = (): void => {
    setEditedColumns([...filterActionsAndHidden(defaultColumns)]);
  };

  const onDrop = (_event: unknown, newItems: DraggableObject[]): void => {
    const columnsMap = new Map(editedColumns.map((col) => [col.resourceFieldId, col]));
    const updatedColumns = newItems.flatMap((item) => {
      const col = columnsMap.get(String(item.id));
      return col ? [col] : [];
    });
    setEditedColumns(updatedColumns);
  };

  const onSelect = (updatedId: string, updatedValue: boolean): void => {
    setEditedColumns(
      editedColumns.map(({ isVisible, resourceFieldId, ...rest }) => ({
        resourceFieldId,
        ...rest,
        isVisible: resourceFieldId === updatedId ? updatedValue : isVisible,
      })),
    );
  };

  const onSave = (): void => {
    onChange([
      ...editedColumns,
      ...resourceFields.filter((col) => Boolean(col.isAction) || Boolean(col.isHidden)),
    ]);
    onClose();
  };

  return (
    <>
      <div id="root" />
      <Modal
        data-testid="manage-columns-modal"
        isOpen={showModal}
        onClose={onClose}
        variant="small"
      >
        <ModalHeader
          description={
            <Content>
              <Content component={ContentVariants.p}>{description}</Content>
            </Content>
          }
          title={title}
        />
        <ModalBody>
          <ManageColumnsDragDropList
            editedColumns={editedColumns}
            onDrop={onDrop}
            onSelect={onSelect}
            resourceFields={resourceFields}
            title={title}
          />
        </ModalBody>
        <ModalFooter>
          <Button
            data-testid="manage-columns-save-button"
            isDisabled={resourceFields === editedColumns}
            key="save"
            onClick={onSave}
            variant={ButtonVariant.primary}
          >
            {saveLabel}
          </Button>
          <Button
            data-testid="manage-columns-cancel-button"
            key="cancel"
            onClick={onClose}
            variant={ButtonVariant.secondary}
          >
            {cancelLabel}
          </Button>
          <Button key="restore" onClick={restoreDefaults} variant={ButtonVariant.link}>
            {restoreLabel}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};
