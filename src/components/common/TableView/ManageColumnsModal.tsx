import { type ReactElement, useState } from 'react';

import { Button, ButtonVariant, Content, ContentVariants } from '@patternfly/react-core';
import { Modal, ModalBody, ModalFooter, ModalHeader } from '@patternfly/react-core';

import type { ResourceField } from '../utils/types';

import { ManageColumnsList } from './ManageColumnsList';
import { filterActionsAndHidden, sameOrderAndVisibility } from './manageColumnsUtils';

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
  // Fresh state each open: ManageColumnsToolbar mounts this only while open.
  const [editedColumns, setEditedColumns] = useState(filterActionsAndHidden(resourceFields));

  const restoreDefaults = (): void => {
    setEditedColumns([...filterActionsAndHidden(defaultColumns)]);
  };

  const onMove = (fieldId: string, direction: -1 | 1): void => {
    const index = editedColumns.findIndex((col) => col.resourceFieldId === fieldId);
    const nextIndex = index + direction;
    if (index < 0 || nextIndex < 0 || nextIndex >= editedColumns.length) {
      return;
    }

    const updatedColumns = [...editedColumns];
    const [moved] = updatedColumns.splice(index, 1);
    updatedColumns.splice(nextIndex, 0, moved);
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

  const visibleResourceFields = filterActionsAndHidden(resourceFields);

  return (
    <Modal data-testid="manage-columns-modal" isOpen={showModal} onClose={onClose} variant="small">
      <ModalHeader
        description={
          <Content>
            <Content component={ContentVariants.p}>{description}</Content>
          </Content>
        }
        title={title}
      />
      <ModalBody>
        <ManageColumnsList
          editedColumns={editedColumns}
          onMove={onMove}
          onSelect={onSelect}
          resourceFields={resourceFields}
          title={title}
        />
      </ModalBody>
      <ModalFooter>
        <Button
          data-testid="manage-columns-save-button"
          isDisabled={sameOrderAndVisibility(visibleResourceFields, editedColumns)}
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
  );
};
