import { type FormEvent, type ReactElement, useState } from 'react';

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
   * A label for the ``Cancel`` button to be displayed in the modal.
   */
  cancelLabel?: string;
  /**
   * The defaults used for initialization and for the restore option. Read only.
   */
  defaultColumns: ResourceField[];
  /**
   * A description title to be displayed in the modal.
   */
  description?: string;
  /**
   * A callback for when the ``Save`` button is clicked. A setter to modify state in the parent
   */
  onChange: (columns: ResourceField[]) => void;
  /**
   * A callback for when the ``close`` button is clicked.
   */
  onClose: () => void;
  /**
   * An aria label for the reorder draggable option to be displayed in the modal.
   */
  reorderLabel?: string;
  /**
   * The list of fields to manage by the modal. This is the state maintained by parent component. Read only.
   */
  resourceFields: ResourceField[];
  /**
   * A label for the ``Restore`` button to be displayed in the modal.
   */
  restoreLabel?: string;
  /**
   * A label for the ``Save`` button to be displayed in the modal.
   */
  saveLabel?: string;
  /**
   * To flag an open or a closed modal.
   */
  showModal: boolean;
  /**
   * A Simple text content of the modal header.
   */
  title?: string;
};

const filterActionsAndHidden = (resourceFields: ResourceField[]): ResourceField[] =>
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
    // assume that action resourceFields are always at the end
    onChange([
      ...editedColumns,
      ...resourceFields.filter((col) => Boolean(col.isAction) || Boolean(col.isHidden)),
    ]);
    onClose();
  };

  type OnChangeFactoryType = (
    id: string,
  ) => (checked: boolean, event: FormEvent<HTMLInputElement>) => void;

  const onChangeFactory: OnChangeFactoryType = (id) => (checked) => {
    onSelect(id, checked);
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
          <DragDropSort
            items={editedColumns.map(({ isIdentity, isVisible, label, resourceFieldId: id }) => {
              const fieldId = id ?? '';

              return {
                content: (
                  <>
                    <DataListControl>
                      <DataListCheck
                        aria-labelledby={`item-${fieldId}`}
                        id={`check-${fieldId}`}
                        isChecked={
                          isIdentity
                            ? resourceFields.find(
                                (resourceField) => resourceField.resourceFieldId === fieldId,
                              )?.isVisible
                            : isVisible
                        }
                        isDisabled={isIdentity}
                        name={`item-${fieldId}`}
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
            variant="DataList"
          >
            <DataList aria-label={title} data-testid="manage-columns-list" isCompact />
          </DragDropSort>
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
