import { type FC, type ReactElement, useState } from 'react';

import {
  Button,
  ButtonVariant,
  DataList,
  DataListAction,
  DataListCell,
  DataListItem,
  DataListItemCells,
  DataListItemRow,
  Tooltip,
} from '@patternfly/react-core';
import { MinusCircleIcon, PlusCircleIcon } from '@patternfly/react-icons';
import { isEmpty } from '@utils/helpers';

import './InputList.style.css';

type InputListRow<T> = FC<{ onChange: (value: T) => void; value: T }>;
type InputListItem<T> = { content: T; id: string };

let idCounter = 0;

/**
 * Get a new unique ID.
 *
 * @returns {string} New unique ID.
 */
const generateUniqueId = (): string => {
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
const extractContent = <T,>(items: { content: T; id: string }[]): T[] =>
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

const shouldHydrateFromItems = <T,>(localItems: InputListItem<T>[], items: T[]): boolean => {
  if (isEmpty(items) || localItems.length !== 1) {
    return false;
  }

  const currentContent = localItems[0].content;

  return currentContent === null || currentContent === undefined || currentContent === '';
};

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
  addButtonText?: string;
  InputRow: InputListRow<T>;
  items: T[];
  onChange: (newList: T[]) => void;
  removeIconContent?: string;
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
}: InputListProps<T>): ReactElement => {
  const initialStateItems = isEmpty(items) ? [null as unknown as T] : items;
  const [localItems, setLocalItems] = useState<InputListItem<T>[]>(() =>
    assignIdsToItems(initialStateItems),
  );
  const [prevItems, setPrevItems] = useState(items);

  if (items !== prevItems) {
    setPrevItems(items);

    if (shouldHydrateFromItems(localItems, items)) {
      setLocalItems(assignIdsToItems(items));
    }
  }

  const handleItemChange = (id: string, newContent: T): void => {
    const updatedItems = localItems.map(({ content, id: itemId }) => ({
      content: id === itemId ? newContent : content,
      id: itemId,
    }));

    setLocalItems(updatedItems);
    onChange(extractContent<T>(updatedItems));
  };

  const handleItemDelete = (id: string): void => {
    const updatedItems = localItems.filter(({ id: itemId }) => id !== itemId);

    setLocalItems(updatedItems);
    onChange(extractContent<T>(updatedItems));
  };

  const handleAddItem = (): void => {
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
          <DataListItem id={id} key={id}>
            <DataListItemRow>
              <DataListItemCells
                dataListCells={[
                  <DataListCell key="primary content">
                    <InputRow
                      onChange={(newValue) => {
                        handleItemChange(id, newValue);
                      }}
                      value={content}
                    />
                  </DataListCell>,
                ]}
              />
              <DataListAction
                aria-label={'Actions'}
                aria-labelledby=""
                id={`mapping_list_item_${id}`}
              >
                <Tooltip content={removeIconContent}>
                  <Button
                    aria-label={removeIconContent}
                    icon={<MinusCircleIcon />}
                    isDisabled={isDeleteDisabled}
                    key="delete-action"
                    onClick={() => {
                      handleItemDelete(id);
                    }}
                    variant={ButtonVariant.plain}
                  />
                </Tooltip>
              </DataListAction>
            </DataListItemRow>
          </DataListItem>
        ))}
      </DataList>
      <Button
        className="forklift--input-list-icon"
        icon={<PlusCircleIcon />}
        onClick={handleAddItem}
        variant={ButtonVariant.link}
      >
        {addButtonText}
      </Button>
    </>
  );
};
