import type { FormEvent, ReactElement } from 'react';

import {
  DataList,
  DataListCell,
  DataListCheck,
  DataListControl,
  DataListItemCells,
} from '@patternfly/react-core';
import { DragDropSort, type DraggableObject } from '@patternfly/react-drag-drop';

import type { ResourceField } from '../utils/types';

type ManageColumnsDragDropListProps = {
  editedColumns: ResourceField[];
  onDrop: (_event: unknown, newItems: DraggableObject[]) => void;
  onSelect: (updatedId: string, updatedValue: boolean) => void;
  resourceFields: ResourceField[];
  title: string;
};

export const ManageColumnsDragDropList = ({
  editedColumns,
  onDrop,
  onSelect,
  resourceFields,
  title,
}: ManageColumnsDragDropListProps): ReactElement => {
  const onChangeFactory =
    (id: string) =>
    (checked: boolean, _event: FormEvent<HTMLInputElement>): void => {
      onSelect(id, checked);
    };

  return (
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
  );
};
