import React, { ReactNode } from 'react';

import { ExternalLink } from '@kubev2v/common';
import {
  Breadcrumb,
  BreadcrumbItem,
  Button,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  DescriptionListTermHelpText,
  DescriptionListTermHelpTextButton,
  Flex,
  FlexItem,
  Popover,
  Truncate,
} from '@patternfly/react-core';
import Pencil from '@patternfly/react-icons/dist/esm/icons/pencil-alt-icon';

/**
 * Component for displaying a details item.
 * It can optionally include a help text popover, breadcrumbs, and an edit button.
 *
 * @component
 * @param {DetailsItemProps} props - The props of the details item.
 */
export const DetailsItem: React.FC<DetailsItemProps> = ({
  title,
  content,
  helpContent,
  moreInfoLabel,
  moreInfoLink,
  crumbs,
  onEdit,
}) => {
  return (
    <DescriptionListGroup>
      {helpContent ? (
        <DescriptionTitleWithHelp
          title={title}
          helpContent={helpContent}
          moreInfoLabel={moreInfoLabel}
          moreInfoLink={moreInfoLink}
          crumbs={crumbs}
        />
      ) : (
        <DescriptionTitle title={title} />
      )}
      {onEdit ? (
        <EditableContentButton content={content} onEdit={onEdit} />
      ) : (
        <NonEditableContent content={content} />
      )}
    </DescriptionListGroup>
  );
};

/**
 * Component for displaying title with help text in a popover.
 *
 * @component
 */
export const DescriptionTitleWithHelp: React.FC<{
  title: string;
  helpContent: ReactNode;
  moreInfoLabel?: string;
  moreInfoLink?: string;
  crumbs?: string[];
}> = ({ title, helpContent, crumbs, moreInfoLabel = 'More info:', moreInfoLink }) => (
  <DescriptionListTermHelpText>
    <Popover
      headerContent={<div>{title}</div>}
      bodyContent={
        <Flex direction={{ default: 'column' }}>
          <FlexItem>{helpContent}</FlexItem>

          {moreInfoLink && (
            <FlexItem>
              {moreInfoLabel}{' '}
              <ExternalLink href={moreInfoLink} isInline hideIcon>
                <Truncate content={moreInfoLink} />
              </ExternalLink>
            </FlexItem>
          )}

          {crumbs && crumbs.length > 0 && (
            <FlexItem>
              <Breadcrumb>
                {crumbs.map((c) => (
                  <BreadcrumbItem key={c}>{c}</BreadcrumbItem>
                ))}
              </Breadcrumb>
            </FlexItem>
          )}
        </Flex>
      }
    >
      <DescriptionListTermHelpTextButton> {title} </DescriptionListTermHelpTextButton>
    </Popover>
  </DescriptionListTermHelpText>
);

/**
 * Component for displaying title.
 *
 * @component
 */
export const DescriptionTitle: React.FC<{ title: string }> = ({ title }) => (
  <DescriptionListTerm> {title} </DescriptionListTerm>
);

/**
 * Component for displaying an inline link button with editable content.
 *
 * @component
 * @param {ReactNode} content - The content of the button.
 * @param {Function} onEdit - Function to be called when the button is clicked.
 */
export const EditableContentButton: React.FC<{ content: ReactNode; onEdit: () => void }> = ({
  content,
  onEdit,
}) => (
  <Button variant="link" isInline onClick={onEdit}>
    <DescriptionListDescription>
      {content} <Pencil className="forklift-page-details-edit-pencil" />
    </DescriptionListDescription>
  </Button>
);

/**
 * Component for displaying a non-editable content.
 *
 * @component
 * @param {ReactNode} content - The content of the description.
 */
export const NonEditableContent: React.FC<{ content: ReactNode }> = ({ content }) => (
  <DescriptionListDescription>{content}</DescriptionListDescription>
);

/**
 * Type for the props of the DetailsItem component.
 *
 * @typedef {Object} DetailsItemProps
 * @property {string} title - The title of the details item.
 * @property {ReactNode} content - The content of the details item.
 * @property {ReactNode} [helpContent] - The content to display in the help popover.
 * @property {string[]} [crumbs] - Breadcrumbs for the details item.
 * @property {Function} [onEdit] - Function to be called when the edit button is clicked.
 */
export type DetailsItemProps = {
  title: string;
  content: ReactNode;
  helpContent?: ReactNode;
  moreInfoLabel?: string;
  moreInfoLink?: string;
  crumbs?: string[];
  onEdit?: () => void;
};
