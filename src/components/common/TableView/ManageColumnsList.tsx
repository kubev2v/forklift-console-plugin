import type { FormEvent, ReactElement } from 'react';

import {
  Button,
  ButtonVariant,
  DataList,
  DataListAction,
  DataListCell,
  DataListCheck,
  DataListControl,
  DataListItem,
  DataListItemCells,
  DataListItemRow,
} from '@patternfly/react-core';
import { AngleDownIcon, AngleUpIcon } from '@patternfly/react-icons';

import type { ResourceField } from '../utils/types';

type ManageColumnsListProps = {
  editedColumns: ResourceField[];
  onMove: (fieldId: string, direction: -1 | 1) => void;
  onSelect: (updatedId: string, updatedValue: boolean) => void;
  resourceFields: ResourceField[];
  title: string;
};

export const ManageColumnsList = ({
  editedColumns,
  onMove,
  onSelect,
  resourceFields,
  title,
}: ManageColumnsListProps): ReactElement => {
  const onChangeFactory =
    (id: string) =>
    (checked: boolean, _event: FormEvent<HTMLInputElement>): void => {
      onSelect(id, checked);
    };

  return (
    <DataList aria-label={title} data-testid="manage-columns-list" isCompact>
      {editedColumns.map(({ isIdentity, isVisible, label, resourceFieldId: id }, index) => {
        const fieldId = id ?? '';

        return (
          <DataListItem id={fieldId} key={fieldId}>
            <DataListItemRow>
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
              <DataListAction
                aria-label={`Reorder ${label}`}
                aria-labelledby={`item-${fieldId}`}
                id={`manage-columns-actions-${fieldId}`}
              >
                <Button
                  aria-label={`Move ${label} up`}
                  data-testid={`manage-columns-move-up-${fieldId}`}
                  icon={<AngleUpIcon />}
                  isDisabled={index === 0}
                  onClick={() => {
                    onMove(fieldId, -1);
                  }}
                  variant={ButtonVariant.plain}
                />
                <Button
                  aria-label={`Move ${label} down`}
                  data-testid={`manage-columns-move-down-${fieldId}`}
                  icon={<AngleDownIcon />}
                  isDisabled={index === editedColumns.length - 1}
                  onClick={() => {
                    onMove(fieldId, 1);
                  }}
                  variant={ButtonVariant.plain}
                />
              </DataListAction>
            </DataListItemRow>
          </DataListItem>
        );
      })}
    </DataList>
  );
};
