import { type FormEvent, useState } from 'react';

import {
  Button,
  ButtonVariant,
  Content,
  ContentVariants,
  DataList,
  DataListCell,
  DataListCheck,
  DataListControl,
  DataListItemCells,
} from '@patternfly/react-core';
import { Modal, ModalBody, ModalFooter, ModalHeader } from '@patternfly/react-core';
import { DragDropSort, type DraggableObject } from '@patternfly/react-drag-drop';

import type { ResourceField } from '../utils/types';

type ManagedColumnsProps = {
  /**
   * To flag an open or a closed modal.
   */
  showModal: boolean;
  /**
   * A callback for when the ``close`` button is clicked.
   */
  onClose: () => void;
  /**
   * A callback for when the ``Save`` button is clicked. A setter to modify state in the parent
   */
  onChange: (columns: ResourceField[]) => void;
  /**
   * The list of fields to manage by the modal. This is the state maintained by parent component. Read only.
   */
  resourceFields: ResourceField[];
  /**
   * The defaults used for initialization and for the restore option. Read only.
   */
  defaultColumns: ResourceField[];
  /**
   * A description title to be displayed in the modal.
   */
  description?: string;
  /**
   * A label for the ``Save`` button to be displayed in the modal.
   */
  saveLabel?: string;
  /**
   * A label for the ``Cancel`` button to be displayed in the modal.
   */
  cancelLabel?: string;
  /**
   * An aria label for the reorder draggable option to be displayed in the modal.
   */
  reorderLabel?: string;
  /**
   * A label for the ``Restore`` button to be displayed in the modal.
   */
  restoreLabel?: string;
  /**
   * A Simple text content of the modal header.
   */
  title?: string;
};

const filterActionsAndHidden = (resourceFields: ResourceField[]) =>
  resourceFields.filter((col) => !col.isAction && !col.isHidden && col.resourceFieldId !== null);

/**
 * Modal dialog for managing resourceFields.
 *
 * **Supported features:**
 * 1. toggle column visibility (disabled for identity resourceFields that should always be displayed to uniquely identify a row).
 * 2. re-order the resourceFields using drag and drop.
 *
 * [<img src="static/media/src/components-stories/assets/github-logo.svg"><i class="fi fi-brands-github"></i>
 * <font color="green">View component source on GitHub</font>](https://github.com/kubev2v/forklift-console-plugin/blob/main/packages/common/src/components/TableView/ManageColumnsModal.tsx)
 */
export const ManageColumnsModal = ({
  cancelLabel = 'Cancel',
  defaultColumns,
  description = 'Selected columns will be displayed in the table.',
  onChange,
  onClose,
  reorderLabel = 'Reorder',
  resourceFields,
  restoreLabel = 'Restore default columns',
  saveLabel = 'Save',
  showModal,
  title = 'Manage columns',
}: ManagedColumnsProps) => {
  const [editedColumns, setEditedColumns] = useState(filterActionsAndHidden(resourceFields));

  const restoreDefaults = () => {
    setEditedColumns([...filterActionsAndHidden(defaultColumns)]);
  };

  const onDrop = (_event: unknown, newItems: DraggableObject[]) => {
    const columnsMap = new Map(editedColumns.map((col) => [col.resourceFieldId, col]));
    const updatedColumns = newItems.map((item) => columnsMap.get(String(item.id))!);
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

  const onSave = () => {
    // assume that action resourceFields are always at the end
    onChange([
      ...editedColumns,
      ...resourceFields.filter((col) => Boolean(col.isAction) || Boolean(col.isHidden)),
    ]);
    onClose();
  };

  type onChangeFactoryType = (
    id: string,
  ) => (checked: boolean, event: FormEvent<HTMLInputElement>) => void;

  const onChangeFactory: onChangeFactoryType = (id) => (checked) => {
    onSelect(id, checked);
  };

  return (
    <>
      <div id="root" />
      <Modal
        isOpen={showModal}
        variant="small"
        onClose={onClose}
        data-testid="manage-columns-modal"
      >
        <ModalHeader
          title={title}
          description={
            <Content>
              <Content component={ContentVariants.p}>{description}</Content>
            </Content>
          }
        />
        <ModalBody>
          <DragDropSort
            variant="DataList"
            items={editedColumns.map(({ isIdentity, isVisible, label, resourceFieldId: id }) => {
              const fieldId = id!;

              return {
                content: (
                  <>
                    <DataListControl>
                      <DataListCheck
                        id={`check-${fieldId}`}
                        aria-labelledby={`item-${fieldId}`}
                        name={`item-${fieldId}`}
                        isChecked={
                          isIdentity
                            ? resourceFields.find(
                                (resourceField) => resourceField.resourceFieldId === fieldId,
                              )?.isVisible
                            : isVisible
                        }
                        isDisabled={isIdentity}
                        onChange={(event, checked) => {
                          onChangeFactory(fieldId)(checked, event);
                        }}
                        otherControls
                      />
                    </DataListControl>
                    <DataListItemCells
                      dataListCells={[
                        <DataListCell key={fieldId}>
                          <span id={`item-${fieldId}`}>{label}</span>
                        </DataListCell>,
                      ]}
                    />
                  </>
                ),
                id: fieldId,
              };
            })}
            onDrop={onDrop}
            overlayProps={{ isCompact: true }}
          >
            <DataList aria-label={title} isCompact data-testid="manage-columns-list" />
          </DragDropSort>
        </ModalBody>
        <ModalFooter>
          <Button
            key="save"
            variant={ButtonVariant.primary}
            isDisabled={resourceFields === editedColumns}
            onClick={onSave}
            data-testid="manage-columns-save-button"
          >
            {saveLabel}
          </Button>
          <Button
            key="cancel"
            variant={ButtonVariant.secondary}
            onClick={onClose}
            data-testid="manage-columns-cancel-button"
          >
            {cancelLabel}
          </Button>
          <Button key="restore" variant={ButtonVariant.link} onClick={restoreDefaults}>
            {restoreLabel}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};
