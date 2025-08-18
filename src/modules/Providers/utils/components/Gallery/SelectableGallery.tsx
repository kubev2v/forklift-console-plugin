import { type FC, type ReactNode, useState } from 'react';

import { Gallery, GalleryItem } from '@patternfly/react-core';

import { SelectableCard } from './SelectableCard';

import './SelectableGallery.style.css';

export type SelectableGalleryItem = {
  /** The title of the item */
  title: ReactNode;
  /** The logo of the item */
  logo?: ReactNode;
  /** The content of the item */
  content: string;
};

type SelectableGalleryProps = {
  /** An object of items to be displayed in the gallery. Key is the item's id */
  items: Record<string, SelectableGalleryItem>;
  /** Handler function to be called when a card is selected */
  onChange: (selectedCardId: string | null) => void;
  /** A function to sort the items. Default is alphabetic sort on item titles. */
  sortFunction?: (a: [string, SelectableGalleryItem], b: [string, SelectableGalleryItem]) => number;
  /** initial selected value */
  selectedID?: string;
};

/**
 * SelectableGallery component
 * @param props The properties of the SelectableGallery
 */
export const SelectableGallery: FC<SelectableGalleryProps> = ({
  items,
  onChange,
  selectedID,
  sortFunction,
}) => {
  // State to manage the selected card's id
  const [selectedCardId, setSelectedCardId] = useState<string | null>(selectedID);

  // Callback function for when a card is selected
  const handleCardChange = (isSelected: boolean, id: string) => {
    if (isSelected) {
      setSelectedCardId(id);
      onChange(id);
    } else if (selectedCardId === id) {
      // Unselect the card if it's currently selected
      setSelectedCardId(null);
      onChange(null);
    }
  };

  // Convert the items object to an array and sort it
  const sortedItems = sortFunction
    ? Object.entries(items).sort(sortFunction)
    : Object.entries(items);

  return (
    <Gallery hasGutter className="forklift-selectable-gallery">
      {sortedItems.map(([id, item]) => (
        <GalleryItem key={id}>
          <SelectableCard
            data-testid={`${id}-provider-card`}
            title={item.title}
            titleLogo={item.logo}
            content={item.content}
            isSelected={id === selectedCardId}
            onChange={(isSelected) => {
              handleCardChange(isSelected, id);
            }}
          />
        </GalleryItem>
      ))}
    </Gallery>
  );
};
