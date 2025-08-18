import type { FC, ReactNode } from 'react';

import { Card, CardBody, CardHeader, CardTitle, Split, SplitItem } from '@patternfly/react-core';

type SelectableCardProps = {
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
  /** Optional: A string to use for the `data-testid` attribute. */
  'data-testid'?: string;
};

/**
 * SelectableCard component
 * @param props The properties of the SelectableCard
 */
export const SelectableCard: FC<SelectableCardProps> = ({
  className,
  content,
  'data-testid': dataTestId,
  isCompact,
  isSelected,
  onChange,
  title,
  titleLogo,
}) => {
  // Handler function to toggle selection and call onChange
  const handleClick = () => {
    // Flip the isSelected status and send the new status via the onChange handler
    onChange(!isSelected);
  };

  return (
    <Card
      data-testid={dataTestId}
      className={`forklift-selectable-gallery-card ${className}`}
      id="selectable-card"
      onKeyDown={handleClick}
      onClick={handleClick}
      isSelectable
      isCompact={isCompact}
      isSelected={isSelected}
    >
      <CardHeader
        selectableActions={{
          name: 'selectable-card-header',
          onChange: handleClick,
          selectableActionAriaLabelledby: 'selectable-card-header',
          selectableActionId: 'selectable-card-header',
          variant: 'single',
        }}
      >
        {titleLogo ? (
          <CardTitle>
            <Split className="forklift--create-provider-edit-card-title">
              <SplitItem>{titleLogo}</SplitItem>
              <SplitItem isFilled>{title}</SplitItem>
            </Split>
          </CardTitle>
        ) : (
          <CardTitle>{title}</CardTitle>
        )}
      </CardHeader>
      {content && <CardBody>{content}</CardBody>}
    </Card>
  );
};
