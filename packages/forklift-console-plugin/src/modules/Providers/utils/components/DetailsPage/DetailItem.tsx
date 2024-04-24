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
import HelpIcon from '@patternfly/react-icons/dist/esm/icons/help-icon';
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
  showHelpIconNextToTitle,
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
          showHelpIconNextToTitle={showHelpIconNextToTitle}
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
  showHelpIconNextToTitle: boolean;
  moreInfoLabel?: string;
  moreInfoLink?: string;
  crumbs?: string[];
}> = ({
  title,
  helpContent,
  showHelpIconNextToTitle = false,
  crumbs,
  moreInfoLabel = 'More info:',
  moreInfoLink,
}) => (
  <DescriptionListTermHelpText>
    {showHelpIconNextToTitle ? <label>{title} &nbsp;</label> : null}
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
      {showHelpIconNextToTitle ? (
        <button
          type="button"
          onClick={(e) => e.preventDefault()}
          className="pf-c-form__group-label-help"
        >
          <HelpIcon />
        </button>
      ) : (
        <DescriptionListTermHelpTextButton> {title} </DescriptionListTermHelpTextButton>
      )}
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
 * Component for displaying an editable content in the following format:
 * The content field's element and next to that appears a press-able inline
 * link edit button with the pencil icon, for triggering the onEdit callback.
 *
 * @component
 * @param {ReactNode} content - The field's content element.
 * @param {Function} onEdit - Function to be called when the button is clicked.
 */
export const EditableContentButton: React.FC<{
  content: ReactNode;
  onEdit: () => void;
}> = ({ content, onEdit }) => (
  <DescriptionListDescription>
    {content}
    <Button variant="link" isInline onClick={onEdit}>
      <Pencil className="forklift-page-details-edit-pencil" />
    </Button>
  </DescriptionListDescription>
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
 * @property {ReactNode} [showHelpIconNextToTitle] - if true, adding a help icon next to the title for displaying the help popover.
 *    If false, show the default Patternfly dashed line under the title.
 * @property {string[]} [crumbs] - Breadcrumbs for the details item.
 * @property {Function} [onEdit] - Function to be called when the edit button is clicked.
 */
export type DetailsItemProps = {
  title: string;
  content: ReactNode;
  helpContent?: ReactNode;
  showHelpIconNextToTitle?: boolean;
  moreInfoLabel?: string;
  moreInfoLink?: string;
  crumbs?: string[];
  onEdit?: () => void;
};
