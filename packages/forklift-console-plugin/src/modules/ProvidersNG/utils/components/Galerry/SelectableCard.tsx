import React, { ReactNode } from 'react';

import { Card, CardBody, CardTitle } from '@patternfly/react-core';

interface SelectableCardProps {
  /** The title of the card */
  title: ReactNode;
  /** The content of the card */
  content: ReactNode;
  /** Handler function to be called when the card is clicked */
  onChange: (isSelected: boolean) => void;
  /** The selected state of the card */
  isSelected: boolean;
}

/**
 * SelectableCard component
 * @param props The properties of the SelectableCard
 */
export const SelectableCard: React.FC<SelectableCardProps> = ({
  title,
  content,
  onChange,
  isSelected,
}) => {
  // Handler function to toggle selection and call onChange
  const handleClick = () => {
    // Flip the isSelected status and send the new status via the onChange handler
    onChange(!isSelected);
  };

  return (
    <Card
      className="forklift-selectable-gallery-card"
      id="selectable-card"
      onKeyDown={handleClick}
      onClick={handleClick}
      onSelectableInputChange={handleClick}
      isSelectable
      isSelected={isSelected}
    >
      <CardTitle>{title}</CardTitle>
      <CardBody>{content}</CardBody>
    </Card>
  );
};
