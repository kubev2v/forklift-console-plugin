import React, { ReactNode } from 'react';

import { Card, CardBody, CardTitle, Level, LevelItem } from '@patternfly/react-core';

interface SelectableCardProps {
  /** The title of the card. It can be any element - a string, a React component, etc. */
  title: ReactNode;
  /** Optional: A logo or symbol to be displayed along with the title. It can be any element - a string, a React component, etc. */
  titleLogo?: ReactNode;
  /** Optional: The content of the card. It can be any element - a string, a React component, etc. */
  content?: ReactNode;
  /** A function that will be called when the card is clicked. It receives a single argument, `isSelected`, which is a boolean indicating the selected state of the card. */
  onChange: (isSelected: boolean) => void;
  /** A boolean indicating whether the card is currently selected. */
  isSelected: boolean;
  /** Optional: A boolean indicating whether the card should be displayed in a compact form. This may affect things like the card's padding and margin. */
  isCompact?: boolean;
  /** Optional: A string representing a CSS class name. This class will be applied to the card's top-level DOM element, allowing you to style the card with custom CSS. */
  className?: string;
}

/**
 * SelectableCard component
 * @param props The properties of the SelectableCard
 */
export const SelectableCard: React.FC<SelectableCardProps> = ({
  title,
  titleLogo,
  content,
  onChange,
  isSelected,
  isCompact,
  className,
}) => {
  // Handler function to toggle selection and call onChange
  const handleClick = () => {
    // Flip the isSelected status and send the new status via the onChange handler
    onChange(!isSelected);
  };

  return (
    <Card
      className={`forklift-selectable-gallery-card ${className}`}
      id="selectable-card"
      onKeyDown={handleClick}
      onClick={handleClick}
      onSelectableInputChange={handleClick}
      isSelectable
      isCompact={isCompact}
      isSelected={isSelected}
    >
      {titleLogo ? (
        <CardTitle>
          <Level className="forklift--create-provider-edit-card-title">
            <LevelItem>{titleLogo}</LevelItem>
            <LevelItem>{title}</LevelItem>
          </Level>
        </CardTitle>
      ) : (
        <CardTitle>{title}</CardTitle>
      )}

      {content && <CardBody>{content}</CardBody>}
    </Card>
  );
};
