import React, { type ReactNode } from 'react';
import { ExternalLink } from 'src/components/common/ExternalLink/ExternalLink';

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

import { ensureArray } from '../../helpers';

/**
 * Component for displaying a details item.
 * It can optionally include a help text popover, breadcrumbs, and an edit button.
 *
 * @component
 * @param {DetailsItemProps} props - The props of the details item.
 */
export const DetailsItem: React.FC<DetailsItemProps> = ({
  canEdit,
  content,
  crumbs,
  helpContent,
  moreInfoLabel,
  moreInfoLink,
  onEdit,
  showHelpIconNextToTitle,
  title,
}) => {
  const contents = ensureArray(content);
  const onEdits = ensureArray(onEdit);

  return (
    <DescriptionListGroup>
      <DisplayTitle
        title={title}
        helpContent={helpContent}
        showHelpIconNextToTitle={showHelpIconNextToTitle}
        moreInfoLabel={moreInfoLabel}
        moreInfoLink={moreInfoLink}
        crumbs={crumbs}
      />
      <DescriptionListDescription>
        {contents?.map((value: ReactNode, index) => (
          <ContentField
            key={`content-field-${index}`}
            content={value}
            onEdit={onEdits ? (onEdits[index] as () => void) : null}
            canEdit={canEdit}
          />
        ))}
      </DescriptionListDescription>
    </DescriptionListGroup>
  );
};

/**
 * Component for displaying an item's title
 *
 * @component
 */
export const DisplayTitle: React.FC<{
  title: string;
  helpContent: ReactNode;
  showHelpIconNextToTitle: boolean;
  moreInfoLabel?: string;
  moreInfoLink?: string;
  crumbs?: string[];
}> = ({ crumbs, helpContent, moreInfoLabel, moreInfoLink, showHelpIconNextToTitle, title }) =>
  helpContent ? (
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
  );

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
  crumbs,
  helpContent,
  moreInfoLabel = 'More info:',
  moreInfoLink,
  showHelpIconNextToTitle = false,
  title,
}) => {
  const onClick: (event: React.MouseEvent<HTMLButtonElement>) => void = (event) => {
    event.preventDefault();
  };

  return (
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
          <button type="button" onClick={onClick} className="pf-c-form__group-label-help">
            <HelpIcon />
          </button>
        ) : (
          <DescriptionListTermHelpTextButton> {title} </DescriptionListTermHelpTextButton>
        )}
      </Popover>
    </DescriptionListTermHelpText>
  );
};

/**
 * Component for displaying title without a popover.
 *
 * @component
 */
export const DescriptionTitle: React.FC<{ title: string }> = ({ title }) => (
  <DescriptionListTerm> {title} </DescriptionListTerm>
);

/**
 * Component for displaying an editable or non editable content field with the following format:
 * The content field's element and if editable, next to that appears a press-able inline
 * link edit button with the pencil icon, for triggering the onEdit callback.
 *
 * @component
 * @param {ReactNode} content - The field's content element.
 * @param {Function} onEdit - Function to be called when the button is clicked.
 */

export const ContentField: React.FC<{
  content: ReactNode;
  onEdit: () => void;
  canEdit?: boolean;
}> = ({ canEdit = true, content, onEdit }) =>
  canEdit && onEdit ? (
    <DescriptionListDescription>
      <Flex alignItems={{ default: 'alignItemsCenter' }}>
        <FlexItem spacer={{ default: 'spacerNone' }}>{content}</FlexItem>
        <FlexItem spacer={{ default: 'spacerNone' }}>
          <Button variant="link" isInline onClick={onEdit}>
            <Pencil className="forklift-page-details-edit-pencil" />
          </Button>
        </FlexItem>
      </Flex>
    </DescriptionListDescription>
  ) : (
    <DescriptionListDescription>{content}</DescriptionListDescription>
  );

/**
 * Type for the props of the DetailsItem component.
 *
 * @typedef {Object} DetailsItemProps
 * @property {string} title - The title of the details item.
 * @property {ReactNode} [helpContent] - The content to display in the help popover.
 * @property {ReactNode} [showHelpIconNextToTitle] - if true, adding a help icon next to the title for displaying the help popover.
 *    If false, show the default Patternfly dashed line under the title.
 * @property {string[]} [crumbs] - Breadcrumbs for the details item.
 * @property {ReactNode | ReactNode[]} content - Array of content fields to be displayed for the details item.
 * @property {Function | Function[]} onEdit - Array of functions per content field to be called when the edit button is clicked or null if the field is non editable.
 * @property {boolean} [showEditButton] - If true, show the edit button next to the content field, when missing falling back to onEdit existence.
 */
export type DetailsItemProps = {
  title: string;
  helpContent?: ReactNode;
  showHelpIconNextToTitle?: boolean;
  moreInfoLabel?: string;
  moreInfoLink?: string;
  crumbs?: string[];
  content: ReactNode | ReactNode[];
  onEdit?: (() => void) | (() => void)[];
  canEdit?: boolean;
};
