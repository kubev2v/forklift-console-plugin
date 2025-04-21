import { type FC, useState } from 'react';

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

type InputListRow<T> = FC<{ value: T; onChange: (value: T) => void }>;
type InputListItem<T> = { id: string; content: T };

let idCounter = 0;

/**
 * Get a new unique ID.
 *
 * @returns {string} New unique ID.
 */
const generateUniqueId = () => {
  idCounter += 1;
  return `item-${idCounter}`;
};

/**
 * Extract content from items.
 *
 * @template T
 * @param {Array<{ id: string, content: T }>} items - Items with id and content.
 * @returns {T[]} List of content from items.
 */
const extractContent = <T,>(items: { id: string; content: T }[]): T[] =>
  items.map(({ content }) => content);

/**
 * Add IDs to items.
 *
 * @param {any[]} items - List of items without IDs.
 * @returns {InputListItem<T>[]} List of items with IDs.
 */
const assignIdsToItems = <T,>(items: T[]): InputListItem<T>[] =>
  items.map((content) => {
    const id = generateUniqueId();
    return { content, id };
  });

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
  const initialStateItems = (items || []).length > 0 ? items : [null as unknown as T];
  const [localItems, setLocalItems] = useState<InputListItem<T>[]>(
    assignIdsToItems(initialStateItems),
  );

  const handleItemChange = (id: string, newContent: T) => {
    const updatedItems = localItems.map(({ content, id: itemId }) => ({
      content: id === itemId ? newContent : content,
      id: itemId,
    }));

    setLocalItems(updatedItems);
    onChange(extractContent<T>(updatedItems));
  };

  const handleItemDelete = (id: string) => {
    const updatedItems = localItems.filter(({ id: itemId }) => id !== itemId);

    setLocalItems(updatedItems);
    onChange(extractContent<T>(updatedItems));
  };

  const handleAddItem = () => {
    const newItem: InputListItem<T> = { content: null as unknown as T, id: generateUniqueId() };
    const updatedItems = [...localItems, newItem];

    setLocalItems(updatedItems);
    onChange(extractContent<T>(updatedItems));
  };

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
