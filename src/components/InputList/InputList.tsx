import React, { useState } from 'react';

import {
  Button,
  DataList,
  DataListAction,
  DataListCell,
  DataListItem,
  DataListItemCells,
  DataListItemRow,
  Tooltip,
} from '@patternfly/react-core';
import { MinusCircleIcon, PlusCircleIcon } from '@patternfly/react-icons';

import './InputList.style.css';

export type InputListRow<T> = React.FC<{ value: T; onChange: (value: T) => void }>;

/**
 * Props for InputList component.
 *
 * @template T
 * @typedef {Object} Props
 *
 * @property {T[]} items - List of items.
 * @property {InputListRow<T>} InputRow - Component to render each row.
 * @property {(newList: T[]) => void} onChange - Callback when the list changes.
 * @property {string} [removeIconContent] - Help text for the remove icon tooltip.
 * @property {string} [addButtonText] - Text for the add button.
 */
type InputListProps<T> = {
  items: T[];
  InputRow: InputListRow<T>;
  onChange: (newList: T[]) => void;
  removeIconContent?: string;
  addButtonText?: string;
};

/**
 * InputList component to handle dynamic list input.
 *
 * @template T
 *
 * @param {InputListProps<T>} props - Props for the component.
 */
export const InputList = <T,>({
  addButtonText = 'Add',
  InputRow,
  items,
  onChange,
  removeIconContent = 'Remove',
}: InputListProps<T>) => {
  const initialStateItems = (items || []).length > 0 ? items : [null];
  const [localItems, setLocalItems] = useState(assignIdsToItems(initialStateItems));

  const handleItemChange = (id: string, newContent: T) => {
    const updatedItems = localItems.map(({ content, id: itemId }) => ({
      content: id === itemId ? newContent : content,
      id: itemId,
    }));

    setLocalItems(updatedItems);
    onChange(extractContent(updatedItems));
  };

  const handleItemDelete = (id: string) => {
    const updatedItems = localItems.filter(({ id: itemId }) => id !== itemId);

    setLocalItems(updatedItems);
    onChange(extractContent(updatedItems));
  };

  function handleAddItem() {
    const newItem = { content: null, id: generateUniqueId() };
    const updatedItems = [...localItems, newItem];

    setLocalItems(updatedItems);
    onChange(extractContent(updatedItems));
  }

  const isDeleteDisabled = localItems.length === 1;

  return (
    <>
      <DataList aria-label={'input data list'} isCompact>
        {localItems.map(({ content, id }) => (
          <DataListItem key={id} id={id}>
            <DataListItemRow>
              <DataListItemCells
                dataListCells={[
                  <DataListCell key="primary content">
                    <InputRow
                      value={content}
                      onChange={(newValue) => {
                        handleItemChange(id, newValue);
                      }}
                    />
                  </DataListCell>,
                ]}
              />
              <DataListAction
                id={`mapping_list_item_${id}`}
                aria-label={'Actions'}
                aria-labelledby=""
              >
                <Tooltip content={removeIconContent}>
                  <Button
                    onClick={() => {
                      handleItemDelete(id);
                    }}
                    variant="plain"
                    aria-label={removeIconContent}
                    key="delete-action"
                    icon={<MinusCircleIcon />}
                    isDisabled={isDeleteDisabled}
                  />
                </Tooltip>
              </DataListAction>
            </DataListItemRow>
          </DataListItem>
        ))}
      </DataList>
      <Button
        className="forklift--input-list-icon"
        variant="link"
        icon={<PlusCircleIcon />}
        onClick={handleAddItem}
      >
        {addButtonText}
      </Button>
    </>
  );
};

let idCounter = 0;

/**
 * Get a new unique ID.
 *
 * @returns {string} New unique ID.
 */
const generateUniqueId = () => `item-${idCounter++}`;

/**
 * Extract content from items.
 *
 * @param {Array<{ id: string, content: any }>} items - Items with id and content.
 * @returns {any[]} List of content from items.
 */
const extractContent = (items) => items.map(({ content }) => content);

/**
 * Add IDs to items.
 *
 * @param {any[]} items - List of items without IDs.
 * @returns {Array<{ id: string, content: any }>} List of items with IDs.
 */
const assignIdsToItems = (items) =>
  items.map((content) => {
    const id = generateUniqueId();
    return { content, id };
  });
